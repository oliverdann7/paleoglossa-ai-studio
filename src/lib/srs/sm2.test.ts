import { calculateSM2, SRSState } from './sm2';

/**
 * Tests for the SM-2 scheduling algorithm.
 */
export function runSRSTests() {
  console.log("--- Starting SRS Algorithm Tests ---");
  
  const now = new Date();
  
  // Test Case 1: New card, EASY rating
  const state1 = calculateSM2('EASY', null, now);
  console.assert(state1.interval === 4, "New card EASY should have 4 day interval");
  console.assert(state1.step === 1, "New card EASY should have step 1");
  console.assert(state1.ease === 2.6, "New card EASY should increase ease");

  // Test Case 2: New card, AGAIN rating
  const state2 = calculateSM2('AGAIN', null, now);
  console.assert(state2.interval === 1, "New card AGAIN should have 1 day interval");
  console.assert(state2.step === 0, "New card AGAIN should have step 0");
  
  // Test Case 3: Existing card, GOOD rating
  const existing: SRSState = {
    interval: 10,
    ease: 2.5,
    step: 3,
    lastReviewed: now.toISOString(),
    nextReview: now.toISOString()
  };
  const state3 = calculateSM2('GOOD', existing, now);
  console.assert(state3.interval === 25, "Interval should multiply by ease (10 * 2.5 = 25)");
  console.assert(state3.step === 4, "Step should increment");
  
  // Test Case 4: Existing card, AGAIN rating (lapse)
  const state4 = calculateSM2('AGAIN', existing, now);
  console.assert(state4.interval === 1, "Interval should reset to 1 on failure");
  console.assert(state4.step === 0, "Step should reset to 0 on failure");
  console.assert(state4.ease < 2.5, "Ease should decrease on failure");

  console.log("--- SRS Algorithm Tests Complete ---");
}

// In a real project we'd use Vitest, but here we can just export this for manual verification if needed.
