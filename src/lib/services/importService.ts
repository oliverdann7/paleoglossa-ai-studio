import { db } from '../firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { apiFetch } from './apiFetch.js';
import { ImportedText as FSImportedText } from '../../types/firestore.js';
import { normalizeTimestamp } from '../utils.js';
import { STORAGE_KEYS } from '../constants/storage.js';
import { markWriteSuccess, markWriteFailure, markPendingWrite } from '../sync/syncStatus.js';
import { reportPersistenceError } from '../errors/persistenceReporter.js';

export async function computeContentHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export type ImportedText = FSImportedText;

const STORAGE_KEY = STORAGE_KEYS.IMPORTS;

const importsCache = new Map<string, { data: ImportedText[]; at: number }>();
const IMPORTS_CACHE_TTL = 5 * 60_000;

export class ImportService {
  static async getImports(userId: string | null): Promise<ImportedText[]> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }

    const cached = importsCache.get(userId);
    if (cached && Date.now() - cached.at < IMPORTS_CACHE_TTL) {
      return cached.data;
    }

    try {
      const snap = await getDocs(collection(db, `users/${userId}/imports`));
      const imports: ImportedText[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        imports.push({
          ...data,
          id: doc.id,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        } as ImportedText);
      });
      importsCache.set(userId, { data: imports, at: Date.now() });
      return imports;
    } catch (e) {
      console.error('Import Fetch Error:', e);
      return [];
    }
  }

  static async migrateLocalStorage(userId: string): Promise<number> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return 0;

    // Do not catch — caller (useDemoMigration) must see failures so it does
    // not call discardDemoData() when local data could not be saved to Firestore.
    const imports = JSON.parse(saved) as ImportedText[];
    let count = 0;
    for (const imp of imports) {
      await this.saveImport(userId, imp);
      count++;
    }
    localStorage.removeItem(STORAGE_KEY);
    return count;
  }

  static async getImport(userId: string | null, importId: string): Promise<ImportedText | null> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const imports = saved ? JSON.parse(saved) : [];
      return imports.find((i: any) => i.id === importId) || null;
    }

    try {
      const snap = await getDoc(doc(db, `users/${userId}/imports`, importId));
      if (snap.exists()) {
        const data = snap.data();
        return {
          ...data,
          id: snap.id,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
        } as ImportedText;
      }
      return null;
    } catch (e) {
      console.error('Import Fetch Error:', e);
      return null;
    }
  }

  static stripUndefined(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map((v) => this.stripUndefined(v));
    if (typeof obj === 'object') {
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.stripUndefined(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  static async saveImport(userId: string | null, text: Partial<ImportedText>) {
    if (!text.rawContent || text.rawContent.trim().length === 0) {
      throw new Error('Cannot save empty text');
    }

    const importId = text.id || `imp_${Date.now()}`;
    const payload = {
      ...text,
      id: importId,
      status: text.status || 'complete',
      analysisStatus: text.analysisStatus || 'analyzed',
      visibility: text.visibility || 'private',
      sourceType: text.sourceType || 'paste',
      languageId: text.languageId || 'grc',
      stats: text.stats || {
        totalWords: 0,
        uniqueWords: 0,
        knownWords: 0,
        newWords: 0,
        learningWords: 0,
      },
    };

    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const imports: ImportedText[] = saved ? JSON.parse(saved) : [];
      const existingIndex = imports.findIndex((i) => i.id === importId);
      if (existingIndex >= 0) {
        imports[existingIndex] = payload as ImportedText;
      } else {
        imports.push(payload as ImportedText);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
      return;
    }

    const cleanedPayload = this.stripUndefined(payload);

    importsCache.delete(userId);
    markPendingWrite();
    try {
      await setDoc(doc(db, `users/${userId}/imports`, importId), {
        ...cleanedPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      markWriteSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Import Save Error:', e);
      markWriteFailure(message);
      reportPersistenceError(e, {
        operation: 'import:save',
        path: `users/${userId}/imports/${importId}`,
        category: 'import',
        dataPreservedLocally: false,
      });
      throw new Error(
        `Failed to save import to Firestore: ${message}`,
        e instanceof Error ? { cause: e } : undefined
      );
    }
  }

  static async updateImport(
    userId: string,
    importId: string,
    patch: Partial<ImportedText>
  ): Promise<void> {
    importsCache.delete(userId);
    const cleanedPatch = this.stripUndefined(patch);
    markPendingWrite();
    try {
      await updateDoc(doc(db, `users/${userId}/imports`, importId), {
        ...cleanedPatch,
        updatedAt: serverTimestamp(),
      });
      markWriteSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('Import Update Error:', e);
      markWriteFailure(message);
      reportPersistenceError(e, {
        operation: 'import:update',
        path: `users/${userId}/imports/${importId}`,
        category: 'import',
        dataPreservedLocally: false,
      });
      throw e;
    }
  }

  static async getImportByHash(userId: string, contentHash: string): Promise<ImportedText | null> {
    try {
      const snap = await getDocs(
        query(collection(db, `users/${userId}/imports`), where('contentHash', '==', contentHash))
      );
      if (snap.empty) return null;
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt),
      } as ImportedText;
    } catch {
      return null;
    }
  }

  /** Deduplicate localStorage imports by ID, keeping the latest occurrence of each. */
  static dedupeImportsById(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const imports: ImportedText[] = JSON.parse(saved);
    const seen = new Map<string, number>();
    const deduped: ImportedText[] = [];
    for (const imp of imports) {
      const id = imp.id;
      if (!id) {
        deduped.push(imp);
        continue;
      }
      const existing = seen.get(id);
      if (existing !== undefined) {
        deduped[existing] = imp;
      } else {
        seen.set(id, deduped.length);
        deduped.push(imp);
      }
    }
    if (deduped.length !== imports.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    }
  }

  // ==================== Public Library ====================

  static async sharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      await apiFetch('/api/imports/' + importId + '/share', { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  }

  static async unsharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;

    try {
      await apiFetch('/api/imports/' + importId + '/unshare', { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  }

  static async getPublicTexts(maxItems: number = 50): Promise<ImportedText[]> {
    try {
      const snap = await getDocs(collection(db, 'publicTexts'));
      const texts: ImportedText[] = [];
      snap.forEach((d) => {
        const rawData = d.data() as Record<string, unknown>;
        const content = (rawData.rawContent as string) || (rawData.content as string) || '';
        const sentences = (rawData.sentences as any[]) || [];
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        texts.push({
          id: d.id,
          userId: (rawData.userId as string) || '',
          title: (rawData.title as string) || '',
          languageId: (rawData.languageId as string) || 'grc',
          sourceType: (rawData.sourceType as 'paste' | 'file' | 'url' | 'image' | 'pdf') || 'file',
          rawContent: content,
          status:
            (rawData.status as 'pending' | 'processing' | 'complete' | 'failed') || 'complete',
          analysisStatus: (rawData.analysisStatus as 'analyzed' | 'raw' | 'needs_ai') || 'analyzed',
          visibility: (rawData.visibility as 'private' | 'shared' | 'public') || 'public',
          moderationStatus: rawData.moderationStatus as string | undefined,
          sentences: Array.isArray(sentences)
            ? sentences.map((s: any) => (typeof s === 'string' ? { text: s, tokens: [] } : s))
            : [],
          stats: {
            totalWords: (rawData.stats as any)?.totalWords ?? wordCount,
            uniqueWords: (rawData.stats as any)?.uniqueWords ?? new Set(content.split(/\s+/)).size,
            knownWords: (rawData.stats as any)?.knownWords ?? 0,
            newWords: (rawData.stats as any)?.newWords ?? wordCount,
            learningWords: (rawData.stats as any)?.learningWords ?? 0,
          },
          authorName: rawData.authorName as string | undefined,
          authorId: rawData.authorId as string | undefined,
          forkCount: rawData.forkCount as number | undefined,
          forkedFrom: rawData.forkedFrom as string | undefined,
          createdAt: normalizeTimestamp(rawData.createdAt as string | undefined),
          updatedAt: normalizeTimestamp(rawData.updatedAt as string | undefined),
          publishedAt: normalizeTimestamp(rawData.publishedAt as string | undefined),
        });
      });

      return texts.slice(0, maxItems);
    } catch (e) {
      console.error('Error fetching public texts:', e);
      return [];
    }
  }

  static async forkPublic(userId: string, publicTextId: string): Promise<string | null> {
    if (!userId) return null;

    try {
      // Get the public text
      const publicRef = doc(db, 'publicTexts', publicTextId);
      const snap = await getDoc(publicRef);

      if (!snap.exists()) return null;

      const data = snap.data();

      // Create a copy in user's imports
      const newId = `fork_${publicTextId}_${Date.now()}`;
      importsCache.delete(userId);
      await setDoc(doc(db, `users/${userId}/imports`, newId), {
        ...data,
        id: newId,
        title: `${data.title} (forked)`,
        visibility: 'private',
        forkedFrom: publicTextId,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: null,
      });
      return newId || null;
    } catch {
      return null;
    }
  }
}
