import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ImportedText as FSImportedText } from '../../types/firestore';
import { normalizeTimestamp } from '../utils';
import { STORAGE_KEYS } from '../constants/storage';

export type ImportedText = FSImportedText;

const STORAGE_KEY = STORAGE_KEYS.IMPORTS;

export class ImportService {
  static async getImports(userId: string | null): Promise<ImportedText[]> {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
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

  static async saveImport(userId: string | null, text: Partial<ImportedText>) {
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

    try {
      await setDoc(doc(db, `users/${userId}/imports`, importId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Import Save Error:", e);
    }
  }

  // ==================== Public Library ====================
  
  static async sharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const importRef = doc(db, `users/${userId}/imports`, importId);
      const snap = await getDoc(importRef);
      
      if (!snap.exists()) return false;
      
      // Update to public
      await setDoc(importRef, {
        visibility: 'public',
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Also add to public collection
      const data = snap.data();
      await setDoc(doc(db, 'publicTexts', importId), {
        ...data,
        authorId: userId,
        authorName: data.authorName || 'Anonymous',
        publishedAt: serverTimestamp()
      });
      
      return true;
    } catch (e) {
      console.error("Error sharing text:", e);
      return false;
    }
  }

  static async unsharePublic(userId: string, importId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const importRef = doc(db, `users/${userId}/imports`, importId);
      await setDoc(importRef, {
        visibility: 'private',
        publishedAt: null,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Remove from public collection
      try {
        await deleteDoc(doc(db, 'publicTexts', importId));
      } catch {
        // Ignore if doesn't exist
      }
      
      return true;
    } catch (e) {
      console.error("Error unsharing text:", e);
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
    
    try {
      // Get the public text
      const publicRef = doc(db, 'publicTexts', publicTextId);
      const snap = await getDoc(publicRef);
      
      if (!snap.exists()) return null;
      
      const data = snap.data();
      
      // Create a copy in user's imports
      const newId = `fork_${publicTextId}_${Date.now()}`;
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
        publishedAt: null
      });
      
      return newId;
    } catch (e) {
      console.error("Error forking text:", e);
      return null;
    }
  }
}
