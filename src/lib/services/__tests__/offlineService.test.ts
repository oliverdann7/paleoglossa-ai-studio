import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineService } from '../offlineService';

/**
 * Offline reading + the pending-write sync queue are persisted in
 * localStorage. This layer was untested; these cases lock in the round-trip,
 * dedup, removal and corruption-resilience behaviour the reader depends on
 * when the network is unavailable.
 */
describe('OfflineService', () => {
  beforeEach(() => localStorage.clear());

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

  it('removes a text and its payload', () => {
    OfflineService.setOfflineText('Jn-1', 'John', 'grc-koine');
    OfflineService.saveOfflinePayload('Jn-1', {
      textId: 'Jn-1',
      title: 'John',
      languageId: 'grc-koine',
      sentences: [{ tokens: [{ text: 'Ἐν', lemma: 'ἐν', type: 'word' }], translation: 'In' }],
      source: 'corpus',
    });
    OfflineService.removeOfflineText('Jn-1');
    expect(OfflineService.isOfflineText('Jn-1')).toBe(false);
    expect(OfflineService.getOfflinePayload('Jn-1')).toBeNull();
  });

  it('round-trips an offline payload', () => {
    OfflineService.saveOfflinePayload('Caesar-BG-1', {
      textId: 'Caesar-BG-1',
      title: 'De Bello Gallico',
      languageId: 'lat',
      sentences: [
        { tokens: [{ text: 'Gallia', lemma: 'Gallia', type: 'word' }], translation: 'Gaul' },
      ],
      source: 'corpus',
    });
    const payload = OfflineService.getOfflinePayload('Caesar-BG-1');
    expect(payload?.sentences[0].tokens[0].text).toBe('Gallia');
    expect(payload?.cachedAt).toBeTruthy();
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
