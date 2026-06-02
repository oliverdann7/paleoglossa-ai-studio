import { getAdminDb, isAdminAvailable } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Cache types. `short-gloss` / `word-explanation` are English; a UI-localised
 * gloss is keyed as `short-gloss:<uiLang>` (e.g. `short-gloss:pt`) so each
 * interface language gets its own cached translation.
 */
export type LexicalCacheType = 'short-gloss' | 'word-explanation' | `short-gloss:${string}`;

export interface LexicalCacheEntry {
  languageId: string;
  lemma: string;
  surface?: string;
  type: LexicalCacheType;
  value: string;
  source: 'ai';
  model?: string;
  createdAt: string;
  updatedAt: string;
  hitCount: number;
}

// In-memory cache for dev/test
const memoryCache = new Map<string, LexicalCacheEntry>();

function buildKey(languageId: string, lemma: string, type: string): string {
  return `${languageId}:${lemma.toLowerCase().trim()}:${type}`;
}

export async function getCacheEntry(
  languageId: string,
  lemma: string,
  type: LexicalCacheType
): Promise<LexicalCacheEntry | null> {
  const key = buildKey(languageId, lemma, type);

  if (isAdminAvailable()) {
    const db = getAdminDb();
    if (!db) return memoryCache.get(key) || null;

    const doc = await db.collection('lexicalCache').doc(key).get();
    if (doc.exists) {
      return doc.data() as LexicalCacheEntry;
    }
  }

  return memoryCache.get(key) || null;
}

export async function upsertCacheEntry(
  languageId: string,
  lemma: string,
  surface: string | undefined,
  type: LexicalCacheType,
  value: string
): Promise<void> {
  const key = buildKey(languageId, lemma, type);
  const now = new Date().toISOString();

  const entry: LexicalCacheEntry = {
    languageId,
    lemma,
    surface,
    type,
    value,
    source: 'ai',
    createdAt: now,
    updatedAt: now,
    hitCount: 1,
  };

  // Update in-memory fallback
  memoryCache.set(key, entry);

  // Attempt to persist to Firestore
  if (isAdminAvailable()) {
    const db = getAdminDb();
    if (db) {
      try {
        await db
          .collection('lexicalCache')
          .doc(key)
          .set(
            {
              ...entry,
              hitCount: FieldValue.increment(1),
            },
            { merge: true }
          );
      } catch (e) {
        console.error('[lexicalCache] Failed to persist to Firestore:', e);
      }
    }
  }
}
