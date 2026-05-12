import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { calculateSM2, SRSState, Rating } from '../srs/sm2';
import { calculateFSRS, FSRSState, FSRRating } from '../srs/fsrs';
import { WordState } from '../constants/wordStates';

// Toggle to use FSRS algorithm
const USE_FSRS = true;

export interface ReviewItem {
  id: string; // The doc ID in users/userId/vocabulary
  term: string;
  languageId: string;
  userGloss?: string;
  contexts?: string[];
  notes?: string;
  status: string;
  srs: SRSState;
}

export interface ReviewSessionSummary {
  cardsReviewed: number;
  accuracy: number;
  ratings: Record<Rating, number>;
  nextDueEstimate: string | null;
}

export class ReviewService {
  static async getDueItems(userId: string, count: number = 50): Promise<ReviewItem[]> {
    const vocabRef = collection(db, `users/${userId}/vocabulary`);
    const now = new Date().toISOString();
    
    // We want items where nextReview <= now and status in [LEARNING, FAMILIAR]
    // Firestore composite queries might need indexes, but let's try a simple approach first
    // or fetch more and filter in memory if necessary
    const q = query(
      vocabRef,
      where('nextReview', '<=', now),
      orderBy('nextReview', 'asc'),
      limit(count)
    );
    
    try {
      const snap = await getDocs(q);
      const items: ReviewItem[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        // Only include if status is one we review
        if ([WordState.LEARNING, WordState.FAMILIAR, WordState.KNOWN].includes(data.status)) {
          items.push({
            id: doc.id,
            term: data.term,
            languageId: data.languageId,
            userGloss: data.userGloss,
            contexts: data.contexts,
            notes: data.notes,
            status: data.status,
            srs: {
              interval: data.interval || 0,
              ease: data.ease || 2.5,
              step: data.step || 0,
              lastReviewed: data.lastReviewed || null,
              nextReview: data.nextReview || now
            }
          });
        }
      });
      return items;
    } catch (e) {
      console.error("Error fetching due items", e);
      return [];
    }
  }

  static async logReview(
    userId: string,
    item: ReviewItem,
    rating: Rating,
    responseMs: number
  ): Promise<SRSState> {
    const now = new Date();
    
    let nextState: SRSState;
    
    if (USE_FSRS) {
      // Convert rating to FSRS format
      const fsrsRating: FSRRating = rating === 'AGAIN' ? 'again' 
        : rating === 'HARD' ? 'hard' 
        : rating === 'GOOD' ? 'good' 
        : 'easy';
      
      // Convert current state to FSRS format
      const fsrsState: FSRSState = {
        stability: item.srs.interval || 1,
        difficulty: 5, // Default
        interval: item.srs.interval || 0,
        dueDate: now,
        repetitions: item.srs.step || 0,
        ease: item.srs.ease || 2.5,
        step: item.srs.step || 0,
        lastReviewed: item.srs.lastReviewed,
        nextReview: item.srs.nextReview || now.toISOString()
      };
      
      const nextFSRS = calculateFSRS(fsrsRating, fsrsState, now);
      
      // Convert back to SRSState format
      nextState = {
        interval: nextFSRS.interval,
        ease: nextFSRS.ease,
        step: nextFSRS.repetitions,
        lastReviewed: nextFSRS.lastReviewed,
        nextReview: nextFSRS.nextReview
      };
    } else {
      nextState = calculateSM2(rating, item.srs, now);
    }
    
    const vocabDocRef = doc(db, `users/${userId}/vocabulary`, item.id);
    const logRef = collection(db, `users/${userId}/reviewLogs`);
    
    // 1. Update vocabulary item
    const status = this.determineNewStatus(item.status, nextState, rating);
    
    const updateData: any = {
      status,
      interval: nextState.interval,
      ease: nextState.ease,
      step: nextState.step,
      lastReviewed: nextState.lastReviewed,
      nextReview: nextState.nextReview,
      updatedAt: serverTimestamp()
    };
    
    // Add FSRS-specific fields if using FSRS
    if (USE_FSRS) {
      // Store FSRS metrics
      updateData.fsrsStability = nextState.interval;
      updateData.fsrsDifficulty = 5;
    }
    
    await updateDoc(vocabDocRef, updateData);
    
    // 2. Add log entry
    await addDoc(logRef, {
      vocabItemId: item.id,
      term: item.term,
      rating,
      responseMs,
      intervalBefore: item.srs.interval,
      intervalAfter: nextState.interval,
      easeBefore: item.srs.ease,
      easeAfter: nextState.ease,
      timestamp: now.toISOString(),
      createdAt: serverTimestamp(),
      algorithm: USE_FSRS ? 'FSRS' : 'SM-2'
    });
    
    return nextState;
  }

  private static determineNewStatus(currentStatus: string, nextState: SRSState, rating: Rating): string {
    if (rating === 'AGAIN') return WordState.LEARNING;
    
    // If interval > 21 days, it's pretty familiar
    if (nextState.interval > 21) return WordState.KNOWN;
    if (nextState.interval > 7) return WordState.FAMILIAR;
    
    return currentStatus === WordState.NEW ? WordState.LEARNING : currentStatus;
  }
}
