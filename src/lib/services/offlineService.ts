import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys } from 'idb-keyval';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

const OFFLINE_TEXTS_KEY = 'paleoglossa_offline_texts';
const OFFLINE_PAYLOADS_KEY = 'paleoglossa_offline_payloads';
const SYNC_QUEUE_KEY = 'paleoglossa_sync_queue';

/**
 * IndexedDB key prefix for offline reading payloads. Payloads (full
 * sentence/token graphs for an entire text) are the heavy part of the offline
 * store and used to blow the ~5 MB localStorage quota after a handful of texts.
 * They now live in IndexedDB, lz-string-compressed, so 100+ texts fit.
 *
 * The lightweight metadata index ({@link OfflineText}[]) and the pending-write
 * sync queue stay in localStorage: they are tiny and several call sites read
 * `isOfflineText`/`getOfflineTexts` synchronously during render.
 */
const PAYLOAD_IDB_PREFIX = 'paleoglossa_offline_payload_';

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

const payloadIdbKey = (textId: string) => `${PAYLOAD_IDB_PREFIX}${textId}`;

export const OfflineService = {
  // ── Text metadata (synchronous, localStorage) ──────────────────────

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

  isOfflineText(textId: string): boolean {
    return this.getOfflineTexts().some((t) => t.textId === textId);
  },

  /** Remove the metadata entry and its (async) IndexedDB payload. */
  async removeOfflineText(textId: string): Promise<void> {
    const texts = this.getOfflineTexts().filter((t) => t.textId !== textId);
    localStorage.setItem(OFFLINE_TEXTS_KEY, JSON.stringify(texts));
    try {
      await idbDel(payloadIdbKey(textId));
    } catch (e) {
      console.warn('[offline] Failed to delete payload from IndexedDB:', e);
    }
    // Clean up any legacy localStorage payload left by an older build.
    localStorage.removeItem(`${OFFLINE_PAYLOADS_KEY}_${textId}`);
  },

  // ── Text payload — IndexedDB, lz-string-compressed ─────────────────

  async saveOfflinePayload(
    textId: string,
    payload: Omit<OfflineTextPayload, 'cachedAt'>
  ): Promise<void> {
    const full: OfflineTextPayload = { ...payload, cachedAt: new Date().toISOString() };
    try {
      await idbSet(payloadIdbKey(textId), compressToUTF16(JSON.stringify(full)));
    } catch (e) {
      console.warn('[offline] Failed to cache payload to IndexedDB:', e);
    }
  },

  async getOfflinePayload(textId: string): Promise<OfflineTextPayload | null> {
    try {
      const compressed = await idbGet<string>(payloadIdbKey(textId));
      if (compressed) {
        const json = decompressFromUTF16(compressed);
        return json ? (JSON.parse(json) as OfflineTextPayload) : null;
      }
      // Fall back to a legacy localStorage payload (pre-IndexedDB build).
      const raw = localStorage.getItem(`${OFFLINE_PAYLOADS_KEY}_${textId}`);
      return raw ? (JSON.parse(raw) as OfflineTextPayload) : null;
    } catch {
      return null;
    }
  },

  /**
   * One-time migration: move any legacy `*_offline_payloads_<id>` localStorage
   * entries into IndexedDB (compressed), then drop them from localStorage so
   * the quota is reclaimed. Idempotent and safe to call on every boot.
   */
  async migrateLegacyPayloads(): Promise<void> {
    let migrated = 0;
    try {
      const prefix = `${OFFLINE_PAYLOADS_KEY}_`;
      const legacyKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) legacyKeys.push(key);
      }
      for (const key of legacyKeys) {
        const textId = key.slice(prefix.length);
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            await idbSet(payloadIdbKey(textId), compressToUTF16(raw));
            migrated++;
          } catch (e) {
            console.warn('[offline] Failed to migrate legacy payload', textId, e);
            continue;
          }
        }
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[offline] Legacy payload migration failed:', e);
    }
    if (migrated > 0) {
      console.info(`[offline] Migrated ${migrated} cached text(s) to IndexedDB`);
    }
  },

  // ── Sync queue for pending writes (synchronous, localStorage) ──────

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

  /** Test/diagnostic helper: list the text IDs with a payload in IndexedDB. */
  async listPayloadIds(): Promise<string[]> {
    try {
      const allKeys = await idbKeys();
      return allKeys
        .filter((k): k is string => typeof k === 'string' && k.startsWith(PAYLOAD_IDB_PREFIX))
        .map((k) => k.slice(PAYLOAD_IDB_PREFIX.length));
    } catch {
      return [];
    }
  },
};
