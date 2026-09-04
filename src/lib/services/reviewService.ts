import { db } from '../firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { calculateSM2, SRSState, Rating } from '../srs/sm2.js';
import { calculateFSRS, FSRSState, FSRRating } from '../srs/fsrs.js';
import { WordState } from '../constants/wordStates.js';
import { markPendingWrite, markWriteSuccess, markWriteFailure } from '../sync/syncStatus.js';
import { reportPersistenceError } from '../errors/persistenceReporter.js';
import { classifyFirestoreError } from '../errors/firestoreErrors.js';
import { recordMilestone } from '../hooks/useBeginnerProgress.js';

// Toggle to use FSRS algorithm
const USE_FSRS = true;

export interface ReviewItem {
  id: string;
  term: string;
  languageId: string;
  userGloss?: string;
  contexts?: string[];
  notes?: string;
  status: string;
  srs: SRSState & { fsrsStability?: number; fsrsDifficulty?: number };
  surface?: string;
  morphology?: string;
  transliteration?: string;
  textId?: string;
  sentenceIndex?: number;
  sentenceTranslation?: string;
}

export interface ReviewLogEntry {
  vocabItemId: string;
  term: string;
  languageId: string;
  cardType: string;
  rating: Rating;
  responseMs: number;
  intervalBefore: number;
  intervalAfter: number;
  easeBefore: number;
  easeAfter: number;
  timestamp: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  algorithm: string;
  wasCorrect: boolean;
}

export interface ReviewSessionSummary {
  cardsReviewed: number;
  accuracy: number;
  ratings: Record<Rating, number>;
  nextDueEstimate: string | null;
}

export class ReviewService {
  static async getDueItems(
    userId: string,
    count: number = 50,
    languageId?: string
  ): Promise<ReviewItem[]> {
    const vocabRef = collection(db, `users/${userId}/vocabulary`);
    const now = new Date().toISOString();
    const REVIEWABLE = [WordState.LEARNING, WordState.FAMILIAR, WordState.KNOWN];

    const toItem = (id: string, data: any): ReviewItem => ({
      id,
      term: data.term,
      languageId: data.languageId || languageId || 'unknown',
      userGloss: data.userGloss,
      contexts: data.contexts,
      notes: data.notes,
      status: data.status,
      srs: {
        interval: data.interval || 0,
        ease: data.ease || 2.5,
        step: data.step || 0,
        lastReviewed: data.lastReviewed || null,
        nextReview: data.nextReview || now,
        fsrsStability: data.fsrsStability ?? undefined,
        fsrsDifficulty: data.fsrsDifficulty ?? undefined,
      },
      surface: data.surface,
      morphology: data.morphology,
      transliteration: data.transliteration,
      textId: data.textId,
      sentenceIndex: data.sentenceIndex,
      sentenceTranslation: data.sentenceTranslation,
    });

    const collect = (snap: any, filterLang: boolean): ReviewItem[] => {
      const items: ReviewItem[] = [];
      snap.forEach((d: any) => {
        const data = d.data();
        if (!REVIEWABLE.includes(data.status)) return;
        if (filterLang && languageId && data.languageId !== languageId) return;
        items.push(toItem(d.id, data));
      });
      return items;
    };

    // Fast path: when a language is selected, push the filter to Firestore via
    // the (languageId + nextReview) composite index (see firestore.indexes.json).
    // If that index has not been deployed yet, Firestore throws FAILED_PRECONDITION
    // and we fall back to the over-fetch + in-memory filter below.
    if (languageId) {
      try {
        const snap = await getDocs(
          query(
            vocabRef,
            where('languageId', '==', languageId),
            where('nextReview', '<=', now),
            orderBy('nextReview', 'asc'),
            limit(count * 2)
          )
        );
        return collect(snap, false).slice(0, count);
      } catch (e) {
        if (classifyFirestoreError(e).code !== 'FAILED_PRECONDITION') {
          console.error('Error fetching due items (indexed)', e);
        }
        // index missing → fall through to the in-memory path
      }
    }

    try {
      const snap = await getDocs(
        query(vocabRef, where('nextReview', '<=', now), orderBy('nextReview', 'asc'), limit(count * 3))
      );
      return collect(snap, true).slice(0, count);
    } catch (e) {
      console.error('Error fetching due items', e);
      return [];
    }
  }

  /**
   * Every reviewable word (LEARNING / FAMILIAR / KNOWN) regardless of its due
   * date — the "practice ahead" queue offered when nothing is due yet. Words
   * that are actually due are listed first so a short session still covers them.
   */
  static async getReviewableItems(
    userId: string,
    count: number = 50,
    languageId?: string
  ): Promise<ReviewItem[]> {
    const vocabRef = collection(db, `users/${userId}/vocabulary`);
    const now = new Date().toISOString();
    const REVIEWABLE: string[] = [WordState.LEARNING, WordState.FAMILIAR, WordState.KNOWN];

    const collect = (snap: any, filterLang: boolean): ReviewItem[] => {
      const items: ReviewItem[] = [];
      snap.forEach((d: any) => {
        const data = d.data();
        if (!REVIEWABLE.includes(data.status)) return;
        if (filterLang && languageId && data.languageId !== languageId) return;
        items.push({
          id: d.id,
          term: data.term,
          languageId: data.languageId || languageId || 'unknown',
          userGloss: data.userGloss,
          contexts: data.contexts,
          notes: data.notes,
          status: data.status,
          srs: {
            interval: data.interval || 0,
            ease: data.ease || 2.5,
            step: data.step || 0,
            lastReviewed: data.lastReviewed || null,
            nextReview: data.nextReview || now,
            fsrsStability: data.fsrsStability ?? undefined,
            fsrsDifficulty: data.fsrsDifficulty ?? undefined,
          },
          surface: data.surface,
          morphology: data.morphology,
          transliteration: data.transliteration,
          textId: data.textId,
          sentenceIndex: data.sentenceIndex,
          sentenceTranslation: data.sentenceTranslation,
        });
      });
      return items.sort((a, b) => a.srs.nextReview.localeCompare(b.srs.nextReview));
    };

    // A single-field equality filter needs no composite index, so this path
    // never hits FAILED_PRECONDITION the way the due-items query can.
    try {
      const snap = languageId
        ? await getDocs(query(vocabRef, where('languageId', '==', languageId), limit(count * 3)))
        : await getDocs(query(vocabRef, limit(count * 3)));
      return collect(snap, false).slice(0, count);
    } catch (e) {
      console.error('Error fetching reviewable items', e);
      return [];
    }
  }

  static async logReview(
    userId: string,
    item: ReviewItem,
    rating: Rating,
    responseMs: number,
    metadata?: {
      cardType?: string;
      languageId?: string;
      wasCorrect?: boolean;
    }
  ): Promise<SRSState> {
    const now = new Date();

    let nextState: SRSState;
    let nextFSRS: FSRSState | null = null;

    if (USE_FSRS) {
      const fsrsRating: FSRRating =
        rating === 'AGAIN'
          ? 'again'
          : rating === 'HARD'
            ? 'hard'
            : rating === 'GOOD'
              ? 'good'
              : 'easy';

      const fsrsState: FSRSState = {
        stability: item.srs.fsrsStability ?? item.srs.interval ?? 1,
        difficulty: item.srs.fsrsDifficulty ?? 5,
        interval: item.srs.interval || 0,
        dueDate: now,
        repetitions: item.srs.step || 0,
        ease: item.srs.ease || 2.5,
        step: item.srs.step || 0,
        lastReviewed: item.srs.lastReviewed,
        nextReview: item.srs.nextReview || now.toISOString(),
      };

      nextFSRS = calculateFSRS(fsrsRating, fsrsState, now);
      nextState = {
        interval: nextFSRS.interval,
        ease: nextFSRS.ease,
        step: nextFSRS.repetitions,
        lastReviewed: nextFSRS.lastReviewed,
        nextReview: nextFSRS.nextReview,
      };
    } else {
      nextState = calculateSM2(rating, item.srs, now);
    }

    const vocabDocRef = doc(db, `users/${userId}/vocabulary`, item.id);
    const logDocRef = doc(collection(db, `users/${userId}/reviewLogs`));

    const status = this.determineNewStatus(item.status, nextState, rating);

    const updateData: any = {
      status,
      interval: nextState.interval,
      ease: nextState.ease,
      step: nextState.step,
      lastReviewed: nextState.lastReviewed,
      nextReview: nextState.nextReview,
      updatedAt: serverTimestamp(),
    };

    if (nextFSRS) {
      updateData.fsrsStability = nextFSRS.stability;
      updateData.fsrsDifficulty = nextFSRS.difficulty;
    }

    const wasCorrect = metadata?.wasCorrect ?? rating !== 'AGAIN';

    const batch = writeBatch(db);
    batch.update(vocabDocRef, updateData);
    batch.set(logDocRef, {
      vocabItemId: item.id,
      term: item.term,
      languageId: metadata?.languageId || item.languageId,
      cardType: metadata?.cardType || 'FORM_TO_MEANING',
      rating,
      responseMs,
      wasCorrect,
      intervalBefore: item.srs.interval,
      intervalAfter: nextState.interval,
      easeBefore: item.srs.ease,
      easeAfter: nextState.ease,
      timestamp: now.toISOString(),
      createdAt: serverTimestamp(),
      algorithm: USE_FSRS ? 'FSRS' : 'SM-2',
    });

    try {
      markPendingWrite();
      await batch.commit();
      markWriteSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Error saving review log:', e);
      markWriteFailure(msg);
      reportPersistenceError(e, {
        operation: 'review:log',
        path: `users/${userId}/vocabulary/${item.id}`,
        category: 'review',
        dataPreservedLocally: false,
      });
      throw e;
    }

    const milestoneLang = metadata?.languageId || item.languageId;
    if (milestoneLang && milestoneLang !== 'unknown') {
      recordMilestone(milestoneLang, 'firstReviewCompleted');
    }

    return nextState;
  }

  private static determineNewStatus(
    currentStatus: string,
    nextState: SRSState,
    rating: Rating
  ): string {
    if (rating === 'AGAIN') return WordState.LEARNING;
    if (nextState.interval > 21) return WordState.KNOWN;
    if (nextState.interval > 7) return WordState.FAMILIAR;
    return currentStatus === WordState.NEW ? WordState.LEARNING : currentStatus;
  }

  // ── Analytics ────────────────────────────────────────────────────────────

  static async getReviewSummary(
    userId: string,
    languageId: string
  ): Promise<{
    dueCount: number;
    reviewedToday: number;
    lastAccuracy: number | null;
    avgResponseMs: number | null;
  }> {
    try {
      const dueItems = await this.getDueItems(userId, 100, languageId);
      const today = new Date().toISOString().split('T')[0];
      const logRef = collection(db, `users/${userId}/reviewLogs`);
      const logSnap = await getDocs(query(logRef, orderBy('timestamp', 'desc'), limit(200)));

      let reviewedToday = 0;
      let correctToday = 0;
      let totalResponseMs = 0;
      let responseCount = 0;

      logSnap.forEach((d) => {
        const data = d.data();
        if (data.languageId !== languageId) return;
        const logDate =
          typeof data.timestamp === 'string' ? data.timestamp.split('T')[0] : undefined;
        if (logDate === today) {
          reviewedToday++;
          if (data.wasCorrect) correctToday++;
        }
        if (data.responseMs) {
          totalResponseMs += data.responseMs;
          responseCount++;
        }
      });

      return {
        dueCount: dueItems.length,
        reviewedToday,
        lastAccuracy: reviewedToday > 0 ? correctToday / reviewedToday : null,
        avgResponseMs: responseCount > 0 ? totalResponseMs / responseCount : null,
      };
    } catch {
      return { dueCount: 0, reviewedToday: 0, lastAccuracy: null, avgResponseMs: null };
    }
  }

  static async getWeakLemmas(
    userId: string,
    languageId: string,
    maxItems: number = 5
  ): Promise<{ lemma: string; failCount: number }[]> {
    try {
      const logRef = collection(db, `users/${userId}/reviewLogs`);
      const logSnap = await getDocs(query(logRef, orderBy('timestamp', 'desc'), limit(500)));
      const failMap = new Map<string, number>();
      logSnap.forEach((d) => {
        const data = d.data();
        if (data.languageId !== languageId) return;
        if (!data.wasCorrect) {
          const term = data.term || data.vocabItemId;
          failMap.set(term, (failMap.get(term) || 0) + 1);
        }
      });
      return Array.from(failMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxItems)
        .map(([lemma, failCount]) => ({ lemma, failCount }));
    } catch {
      return [];
    }
  }

  static async getWeakCardTypes(
    userId: string,
    languageId: string
  ): Promise<{ cardType: string; failRate: number; count: number }[]> {
    try {
      const logRef = collection(db, `users/${userId}/reviewLogs`);
      const logSnap = await getDocs(query(logRef, orderBy('timestamp', 'desc'), limit(500)));
      const typeMap = new Map<string, { total: number; failed: number }>();
      logSnap.forEach((d) => {
        const data = d.data();
        if (data.languageId !== languageId) return;
        const ct = data.cardType || 'FORM_TO_MEANING';
        const entry = typeMap.get(ct) || { total: 0, failed: 0 };
        entry.total++;
        if (!data.wasCorrect) entry.failed++;
        typeMap.set(ct, entry);
      });
      return Array.from(typeMap.entries())
        .map(([cardType, { total, failed }]) => ({
          cardType,
          failRate: total > 0 ? failed / total : 0,
          count: total,
        }))
        .sort((a, b) => b.failRate - a.failRate);
    } catch {
      return [];
    }
  }
}
