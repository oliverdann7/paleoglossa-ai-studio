import { describe, it, expect, beforeEach } from 'vitest';
import { clear as idbClear } from 'idb-keyval';
import { OfflineService } from '../offlineService';

/**
 * Offline reading + the pending-write sync queue. Text metadata and the sync
 * queue persist synchronously in localStorage; the heavy reading payloads live
 * (compressed) in IndexedDB. These cases lock in the round-trip, dedup,
 * removal, corruption-resilience and legacy-migration behaviour the reader
 * depends on when the network is unavailable.
 */
describe('OfflineService', () => {
  beforeEach(async () => {
    localStorage.clear();
    await idbClear();
  });

  it('caches text metadata and reports it as offline', () => {
    OfflineService.setOfflineText('Caesar-BG-1', 'De Bello Gallico', 'lat');
    expect(OfflineService.isOfflineText('Caesar-BG-1')).toBe(true);
    expect(OfflineService.getOfflineTexts()).toHaveLength(1);
    expect(OfflineService.getOfflineTexts()[0]).toMatchObject({
      textId: 'Caesar-BG-1',
      title: 'De Bello Gallico',
      languageId: 'lat',
    });
  });

  it('does not duplicate a text that is already cached', () => {
    OfflineService.setOfflineText('Jn-1', 'John', 'grc-koine');
    OfflineService.setOfflineText('Jn-1', 'John', 'grc-koine');
    expect(OfflineService.getOfflineTexts()).toHaveLength(1);
  });

  it('removes a text and its payload', async () => {
    OfflineService.setOfflineText('Jn-1', 'John', 'grc-koine');
    await OfflineService.saveOfflinePayload('Jn-1', {
      textId: 'Jn-1',
      title: 'John',
      languageId: 'grc-koine',
      sentences: [{ tokens: [{ text: 'Ἐν', lemma: 'ἐν', type: 'word' }], translation: 'In' }],
      source: 'corpus',
    });
    await OfflineService.removeOfflineText('Jn-1');
    expect(OfflineService.isOfflineText('Jn-1')).toBe(false);
    expect(await OfflineService.getOfflinePayload('Jn-1')).toBeNull();
    expect(await OfflineService.listPayloadIds()).toEqual([]);
  });

  it('round-trips an offline payload through IndexedDB (compressed)', async () => {
    await OfflineService.saveOfflinePayload('Caesar-BG-1', {
      textId: 'Caesar-BG-1',
      title: 'De Bello Gallico',
      languageId: 'lat',
      sentences: [
        { tokens: [{ text: 'Gallia', lemma: 'Gallia', type: 'word' }], translation: 'Gaul' },
      ],
      source: 'corpus',
    });
    const payload = await OfflineService.getOfflinePayload('Caesar-BG-1');
    expect(payload?.sentences[0].tokens[0].text).toBe('Gallia');
    expect(payload?.cachedAt).toBeTruthy();
    expect(await OfflineService.listPayloadIds()).toEqual(['Caesar-BG-1']);
  });

  it('migrates a legacy localStorage payload into IndexedDB', async () => {
    const legacy = {
      textId: 'Aen-1',
      title: 'Aeneid',
      languageId: 'lat',
      sentences: [
        { tokens: [{ text: 'Arma', lemma: 'arma', type: 'word' }], translation: 'Arms' },
      ],
      source: 'corpus',
      cachedAt: '2026-01-01T00:00:00.000Z',
    };
    localStorage.setItem('paleoglossa_offline_payloads_Aen-1', JSON.stringify(legacy));

    await OfflineService.migrateLegacyPayloads();

    // Legacy key reclaimed, payload now served from IndexedDB.
    expect(localStorage.getItem('paleoglossa_offline_payloads_Aen-1')).toBeNull();
    const payload = await OfflineService.getOfflinePayload('Aen-1');
    expect(payload?.sentences[0].tokens[0].text).toBe('Arma');
    expect(payload?.cachedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('queues pending writes and clears them', () => {
    OfflineService.addToSyncQueue({ type: 'vocabulary', payload: { word: 'arma' } });
    OfflineService.addToSyncQueue({ type: 'review', payload: { id: 'r1' } });
    const queue = OfflineService.getSyncQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0]).toMatchObject({ type: 'vocabulary' });
    expect(queue[0].id).toBeTruthy();
    OfflineService.clearSyncQueue();
    expect(OfflineService.getSyncQueue()).toEqual([]);
  });

  it('survives corrupted localStorage values', () => {
    localStorage.setItem('paleoglossa_offline_texts', '{not valid json');
    localStorage.setItem('paleoglossa_sync_queue', 'also broken');
    expect(OfflineService.getOfflineTexts()).toEqual([]);
    expect(OfflineService.getSyncQueue()).toEqual([]);
  });
});
