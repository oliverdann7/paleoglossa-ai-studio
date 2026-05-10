import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { ImportedText as FSImportedText } from '../../types/firestore';

export type ImportedText = FSImportedText;

const STORAGE_KEY = 'paleoglossa_imports';

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
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt;
        
        imports.push({ 
          ...data, 
          id: doc.id,
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString()
        } as ImportedText);
      });
      return imports;
    } catch (e) {
      console.error("Import Fetch Error:", e);
      return [];
    }
  }

  static async saveImport(userId: string | null, text: Partial<ImportedText>) {
    const importId = text.id || `imp_${Date.now()}`;
    const payload = {
      ...text,
      id: importId,
      status: text.status || 'complete',
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
}
