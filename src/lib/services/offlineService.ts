const OFFLINE_TEXTS_KEY = 'paleoglossa_offline_texts';
const SYNC_QUEUE_KEY = 'paleoglossa_sync_queue';

export interface OfflineText {
  textId: string;
  title: string;
  languageId: string;
  cachedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
}

export const OfflineService = {

  getOfflineTexts(): OfflineText[] {
    try { return JSON.parse(localStorage.getItem(OFFLINE_TEXTS_KEY) || '[]'); }
    catch { return []; }
  },

  setOfflineText(textId: string, title: string, languageId: string): void {
    const texts = this.getOfflineTexts();
    if (texts.some(t => t.textId === textId)) return;
    texts.push({ textId, title, languageId, cachedAt: new Date().toISOString() });
    localStorage.setItem(OFFLINE_TEXTS_KEY, JSON.stringify(texts));
  },

  removeOfflineText(textId: string): void {
    const texts = this.getOfflineTexts().filter(t => t.textId !== textId);
    localStorage.setItem(OFFLINE_TEXTS_KEY, JSON.stringify(texts));
  },

  isOfflineText(textId: string): boolean {
    return this.getOfflineTexts().some(t => t.textId === textId);
  },

  getSyncQueue(): SyncQueueItem[] {
    try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); }
    catch { return []; }
  },

  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): void {
    const queue = this.getSyncQueue();
    queue.push({ ...item, id: `sync_${Date.now()}`, createdAt: new Date().toISOString() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  clearSyncQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  },
};
