import '@testing-library/jest-dom';
// jsdom has no IndexedDB; offlineService payloads live there in real builds.
import 'fake-indexeddb/auto';

if (typeof localStorage !== 'object' || typeof localStorage.getItem !== 'function') {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    },
    configurable: true,
    writable: true,
  });
}
