/**
 * Stage 5 — push to Firestore.
 *
 * Writes the assembled text to the SAME documents the existing reader path
 * reads (api/_routes/corpus.ts) and the same shapes
 * scripts/ingest-corpus-to-firestore.ts already produces:
 *
 *   corpus/{textId}                      → text metadata (read by /api/corpus)
 *   corpus/{textId}/sections/{sectionId} → sentences + tokens (read by the Reader)
 *
 * The text never enters src/data/corpus.ts, so the bundle is untouched and the
 * single-chunk constraint is preserved. `dryRun` prints what would be written
 * without requiring credentials or touching the database.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { IngestedText } from './types.js';

const BATCH_SIZE = 400; // Firestore caps batches at 500 ops

function initAdmin(): void {
  if (getApps().length > 0) return;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is required for a non-dry-run push');
  }
  const sa = JSON.parse(saJson.startsWith('{') ? saJson : Buffer.from(saJson, 'base64').toString());
  initializeApp({ credential: cert(sa) });
}

export interface PushOptions {
  dryRun?: boolean;
}

export interface PushResult {
  textId: string;
  sectionsWritten: number;
}

export async function pushToFirestore(
  ingested: IngestedText,
  opts: PushOptions = {}
): Promise<PushResult> {
  const { text, sections } = ingested;
  const dryRun = !!opts.dryRun;

  const textDoc = {
    id: text.id,
    title: text.title,
    languageId: text.language,
    author: text.author ?? null,
    sourceStatus: text.sourceStatus ?? 'partial',
    isSample: text.isSample ?? false,
    isComplete: text.isComplete ?? false,
    hasMorphology: text.hasMorphology ?? true,
    hasTranslation: text.hasTranslation ?? false,
    sentenceCount: text.sentenceCount ?? 0,
    sectionsPreview: text.sectionsPreview ?? [],
  };

  if (dryRun) {
    console.log(`  [text] corpus/${text.id} →`, JSON.stringify({
      title: textDoc.title,
      languageId: textDoc.languageId,
      sourceStatus: textDoc.sourceStatus,
      sections: textDoc.sectionsPreview.length,
      sentenceCount: textDoc.sentenceCount,
    }));
    for (const section of sections) {
      console.log(`    [section] corpus/${text.id}/sections/${section.id} → ${section.sentences.length} sentences`);
    }
    return { textId: text.id, sectionsWritten: sections.length };
  }

  initAdmin();
  const db = getFirestore();
  let batch = db.batch();
  let ops = 0;
  const flush = async () => {
    if (ops > 0) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  batch.set(db.doc(`corpus/${text.id}`), { ...textDoc, ingestedAt: Timestamp.now() });
  ops++;

  for (const section of sections) {
    batch.set(db.doc(`corpus/${text.id}/sections/${section.id}`), {
      id: section.id,
      textId: text.id,
      label: section.label,
      sequence: section.sequence,
      nextSectionId: section.nextSectionId ?? null,
      previousSectionId: section.previousSectionId ?? null,
      sentences: section.sentences,
      ingestedAt: Timestamp.now(),
    });
    ops++;
    if (ops >= BATCH_SIZE) await flush();
  }
  await flush();

  return { textId: text.id, sectionsWritten: sections.length };
}
