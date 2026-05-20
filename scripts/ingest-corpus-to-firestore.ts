/**
 * Ingest static corpus texts into Firestore.
 *
 * Writes each text as corpus/{textId} and each section as
 * corpus/{textId}/sections/{sectionId}. Existing documents are overwritten.
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON=<...> tsx scripts/ingest-corpus-to-firestore.ts [options]
 *
 * Options:
 *   --lang <id>     Only ingest texts for this language (e.g. grc, lat, hbo)
 *   --text <id>     Only ingest the single text with this ID
 *   --dry-run       Print what would be written without touching Firestore
 *   --help          Show this message
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CorpusDB } from '../src/data/corpus.js';

// ─── Init ─────────────────────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) return;
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    console.error('FIREBASE_SERVICE_ACCOUNT_JSON env var is required');
    process.exit(1);
  }
  const sa = JSON.parse(saJson.startsWith('{') ? saJson : Buffer.from(saJson, 'base64').toString());
  initializeApp({ credential: cert(sa) });
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`Usage: tsx scripts/ingest-corpus-to-firestore.ts [--lang <id>] [--text <id>] [--dry-run]`);
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const langFilter = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const textFilter = args.includes('--text') ? args[args.indexOf('--text') + 1] : null;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!dryRun) initAdmin();

  const db = dryRun ? null : getFirestore();
  const BATCH_SIZE = 400; // Firestore max is 500 ops per batch

  let allTexts = CorpusDB.getTexts();
  if (langFilter) allTexts = allTexts.filter((tx) => (tx as any).languageId === langFilter || (tx as any).language === langFilter);
  if (textFilter) allTexts = allTexts.filter((tx) => tx.id === textFilter);

  console.log(`[ingest] ${dryRun ? '[DRY RUN] ' : ''}Processing ${allTexts.length} corpus texts...`);

  let textCount = 0;
  let sectionCount = 0;
  let batch = db?.batch();
  let batchOps = 0;

  const flushBatch = async () => {
    if (batch && batchOps > 0) {
      await batch.commit();
      batch = db!.batch();
      batchOps = 0;
    }
  };

  for (const text of allTexts) {
    const textData = text as any;
    const textId = text.id;
    const sectionsPreview: { id: string; label: string }[] = textData.sectionsPreview ?? [];

    const textDoc = {
      id: textId,
      title: text.title,
      languageId: textData.languageId || textData.language || 'grc',
      sourceStatus: textData.sourceStatus ?? 'complete',
      isSample: textData.isSample ?? false,
      sentenceCount: textData.sentenceCount ?? 0,
      sectionsPreview,
      ingestedAt: dryRun ? new Date().toISOString() : Timestamp.now(),
    };

    if (dryRun) {
      console.log(`  [text] corpus/${textId} →`, JSON.stringify({ title: textDoc.title, languageId: textDoc.languageId, sections: sectionsPreview.length }));
    } else {
      const ref = db!.doc(`corpus/${textId}`);
      batch!.set(ref, textDoc);
      batchOps++;
      if (batchOps >= BATCH_SIZE) await flushBatch();
    }
    textCount++;

    for (const preview of sectionsPreview) {
      const section = CorpusDB.getSection(preview.id);
      if (!section) {
        console.warn(`  [warn] Section ${preview.id} not found for text ${textId}`);
        continue;
      }

      const sectionDoc = {
        id: section.id,
        textId,
        label: (section as any).label || preview.label,
        sequence: (section as any).sequence ?? 0,
        sentences: (section as any).sentences ?? [],
        ingestedAt: dryRun ? new Date().toISOString() : Timestamp.now(),
      };

      if (dryRun) {
        const sentCount = sectionDoc.sentences.length;
        console.log(`    [section] corpus/${textId}/sections/${section.id} → ${sentCount} sentences`);
      } else {
        const ref = db!.doc(`corpus/${textId}/sections/${section.id}`);
        batch!.set(ref, sectionDoc);
        batchOps++;
        if (batchOps >= BATCH_SIZE) await flushBatch();
      }
      sectionCount++;
    }
  }

  if (!dryRun) await flushBatch();

  console.log(`[ingest] Done. Wrote ${textCount} texts and ${sectionCount} sections${dryRun ? ' (dry run — nothing committed)' : ''}.`);
}

main().catch((err) => {
  console.error('[ingest] Fatal error:', err);
  process.exit(1);
});
