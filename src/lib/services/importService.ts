import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

export interface ImportedText {
  id: string;
  title: string;
  content: string;
  language: string;
  totalWords: number;
  percentKnown: number;
  percentLearning: number;
  isImported: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
        const data = doc.data() as ImportedText;
        imports.push({ ...data, id: doc.id });
      });
      return imports;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  static async saveImport(userId: string | null, text: ImportedText) {
    if (!userId) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const imports = saved ? JSON.parse(saved) : [];
      imports.push(text);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
      return;
    }

    try {
      await setDoc(doc(db, `users/${userId}/imports`, text.id || `import-${Date.now()}`), {
        ...text,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  }
}
