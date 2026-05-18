const OFFLINE_TEXTS_KEY = 'paleoglossa_offline_texts';
const OFFLINE_PAYLOADS_KEY = 'paleoglossa_offline_payloads';
const SYNC_QUEUE_KEY = 'paleoglossa_sync_queue';

export interface OfflineText {
  textId: string;
  title: string;
  languageId: string;
  cachedAt: string;
}

export interface OfflineTextPayload {
  textId: string;
  title: string;
  languageId: string;
  sentences: {
    tokens: {
      text: string;
      lemma: string;
      gloss?: string;
      type: string;
      transliteration?: string;
      pos?: string;
      confidence?: number | null;
    }[];
    translation?: string | null;
  }[];
  source: 'corpus' | 'import';
  cachedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
}

export const OfflineService = {
  // ── Text metadata ───────────────────────────────────────────────────

  getOfflineTexts(): OfflineText[] {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_TEXTS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  setOfflineText(textId: string, title: string, languageId: string): void {
    const texts = this.getOfflineTexts();
    if (texts.some((t) => t.textId === textId)) return;
    texts.push({ textId, title, languageId, cachedAt: new Date().toISOString() });
    localStorage.setItem(OFFLINE_TEXTS_KEY, JSON.stringify(texts));
  },

  removeOfflineText(textId: string): void {
    const texts = this.getOfflineTexts().filter((t) => t.textId !== textId);
    localStorage.setItem(OFFLINE_TEXTS_KEY, JSON.stringify(texts));
    localStorage.removeItem(`${OFFLINE_PAYLOADS_KEY}_${textId}`);
  },

  isOfflineText(textId: string): boolean {
    return this.getOfflineTexts().some((t) => t.textId === textId);
  },

  // ── Text payload (sentences/tokens for offline reading) ────────────

  saveOfflinePayload(textId: string, payload: Omit<OfflineTextPayload, 'cachedAt'>): void {
    const full: OfflineTextPayload = { ...payload, cachedAt: new Date().toISOString() };
    try {
      localStorage.setItem(`${OFFLINE_PAYLOADS_KEY}_${textId}`, JSON.stringify(full));
    } catch (e) {
      console.warn('[offline] Failed to cache payload, possibly too large:', e);
    }
  },

  getOfflinePayload(textId: string): OfflineTextPayload | null {
    try {
      const raw = localStorage.getItem(`${OFFLINE_PAYLOADS_KEY}_${textId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ── Sync queue for pending writes ──────────────────────────────────

  getSyncQueue(): SyncQueueItem[] {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
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
