import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ImportedText as FSImportedText } from '../../types/firestore';
import { normalizeTimestamp } from '../utils';
import { STORAGE_KEYS } from '../constants/storage';

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
      snap.forEach(doc => {
        const data = doc.data();
        imports.push({
          ...data,
          id: doc.id,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt)
        } as ImportedText);
      });
      importsCache.set(userId, { data: imports, at: Date.now() });
      return imports;
    } catch (e) {
      console.error("Import Fetch Error:", e);
      return [];
    }
  }

  static async migrateLocalStorage(userId: string): Promise<number> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return 0;
    
    try {
      const imports = JSON.parse(saved) as ImportedText[];
      let count = 0;
      for (const imp of imports) {
        await this.saveImport(userId, imp);
        count++;
      }
      localStorage.removeItem(STORAGE_KEY);
      return count;
    } catch (e) {
      console.error("Import migration failed:", e);
      return 0;
    }
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
          updatedAt: normalizeTimestamp(data.updatedAt)
        } as ImportedText;
      }
      return null;
    } catch (e) {
      console.error("Import Fetch Error:", e);
      return null;
    }
  }

  static stripUndefined(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(v => this.stripUndefined(v));
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
        learningWords: 0
      }
    };

    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const imports = saved ? JSON.parse(saved) : [];
      imports.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
      return;
    }

    const cleanedPayload = this.stripUndefined(payload);

    importsCache.delete(userId);
    try {
      await setDoc(doc(db, `users/${userId}/imports`, importId), {
        ...cleanedPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Import Save Error:", e);
      throw new Error(`Failed to save import to Firestore: ${message}`, e instanceof Error ? { cause: e } : undefined);
    }
  }

  // ==================== Public Library ====================
  
  static async sharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;

    const token = await auth.currentUser?.getIdToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/imports/' + importId + '/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.success === true;
    } catch {
      return false;
    }
  }

  static async unsharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;

    const token = await auth.currentUser?.getIdToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/imports/' + importId + '/unshare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.success === true;
    } catch {
      return false;
    }
  }

  static async getPublicTexts(maxItems: number = 50): Promise<ImportedText[]> {
    try {
      const snap = await getDocs(collection(db, 'publicTexts'));
      const texts: ImportedText[] = [];
      snap.forEach(d => {
        const rawData = d.data() as Record<string, unknown>;
        const content = rawData.content as string || '';
        const sentences = rawData.sentences as string[] || [];
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        
        texts.push({
          id: d.id,
          userId: rawData.userId as string || '',
          title: rawData.title as string || '',
          languageId: rawData.languageId as string || 'grc',
          sourceType: rawData.sourceType as 'paste' | 'file' | 'url' | 'image' | 'pdf' || 'file',
          rawContent: content,
          status: rawData.status as 'pending' | 'processing' | 'complete' | 'failed' || 'complete',
          analysisStatus: rawData.analysisStatus as 'analyzed' | 'raw' | 'needs_ai' || 'analyzed',
          visibility: rawData.visibility as 'private' | 'shared' | 'public' || 'public',
          sentences: sentences.map((s: string) => ({ text: s, tokens: [] })),
          stats: {
            totalWords: wordCount,
            uniqueWords: new Set(content.split(/\s+/)).size,
            knownWords: 0,
            newWords: wordCount,
            learningWords: 0
          },
          createdAt: normalizeTimestamp(rawData.createdAt as string | undefined),
          updatedAt: normalizeTimestamp(rawData.updatedAt as string | undefined),
          publishedAt: normalizeTimestamp(rawData.publishedAt as string | undefined),
          authorName: rawData.authorName as string | undefined,
          authorId: rawData.authorId as string | undefined,
          forkedFrom: rawData.forkedFrom as string | undefined
        });
      });
      
      return texts.slice(0, maxItems);
    } catch (e) {
      console.error("Error fetching public texts:", e);
      return [];
    }
  }

  static async forkPublic(userId: string, publicTextId: string): Promise<string | null> {
    if (!userId) return null;

    const token = await auth.currentUser?.getIdToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/public/texts/' + publicTextId + '/fork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.id || null;
    } catch {
      return null;
    }
  }
}
