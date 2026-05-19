# Mobile QA Checklist

Manual QA checklist for native iOS/Android builds.  Run through every
scenario on a physical device **and** a simulator/emulator before
submitting to TestFlight or Google Play.

---

## First launch

- [ ] App icon appears correctly on the home screen.
- [ ] Splash screen displays (cream background #FFF8E7, centered logo).
- [ ] Landing / sign-in page loads without console errors.
- [ ] No blank white screen on cold start.
- [ ] No infinite loading spinner.
- [ ] App loads on a fresh install (no cached data).
- [ ] App responds to device orientation changes (if applicable).

---

## Login / logout

- [ ] Navigate to `/auth/signin`.
- [ ] Email/password sign-in works.
- [ ] "Forgot?" link navigates to password reset.
- [ ] After sign-in, user is redirected to `/app`.
- [ ] Logout from Settings (or Navbar) clears the session.
- [ ] After logout, signing in again with the same credentials works.
- [ ] Logout does not leave stale auth state (no brief flash of signed-in
      content).
- [ ] Sign-out + sign-in with a different account works cleanly.

---

## Google login

- [ ] "Continue with Google" opens the OAuth popup (web) or redirect
      (native).
- [ ] Sign-in with a Google account completes successfully.
- [ ] First-time Google sign-up creates a Firestore user profile.
- [ ] "Use another account" link triggers account selector prompt.
- [ ] Returning Google user signs in without re-consent.
- [ ] Cancel / close the OAuth popup — no error is shown, user stays on
      sign-in page.

---

## Apple login

- [ ] "Continue with Apple" opens the OAuth flow.
- [ ] Apple sign-in completes (requires Apple Developer account on iOS
      for full flow).
- [ ] Returning Apple user signs in without re-consent.
- [ ] Cancel / close the Apple OAuth — no error shown.

---

## Email login

- [ ] Sign-in with valid email + password succeeds.
- [ ] Incorrect password shows "Incorrect email or password" error.
- [ ] Non-existent email for email-password flow suggests Google sign-in
      if the email is linked to a Google account.
- [ ] Empty email or password does not crash — form validation works.
- [ ] "Too many requests" error shows friendly message after repeated
      failures.

---

## Reader

- [ ] Open a text from the Library.
- [ ] Text content renders with proper fonts and diacritics (Greek,
      Hebrew, Latin, etc.).
- [ ] Scrolling is smooth (no jank).
- [ ] Tap a word — lexicon popover appears with gloss / morphology.
- [ ] Tap "Save word" — word appears in Vocabulary.
- [ ] Sentence analysis panel opens and shows parsing data.
- [ ] Sentence analysis panel can be dismissed.
- [ ] TTS audio plays (if available for the language).
- [ ] Reader settings (font size, theme) apply immediately.

---

## Library

- [ ] Library page loads the list of available texts.
- [ ] Filtering by language works.
- [ ] Search (if present) finds texts.
- [ ] Text grid / list scrolls without jank.
- [ ] Tapping a text navigates to the Reader.
- [ ] Back navigation from Reader to Library works.

---

## Import

- [ ] Import page loads.
- [ ] Import from text input works.
- [ ] Import from file upload works (PDF, DOCX, TXT).
- [ ] Import from URL works.
- [ ] Imported text appears in the Library after processing.
- [ ] Error state shown for unsupported file types.
- [ ] Network error during import shows friendly message.
- [ ] Imported text can be opened in the Reader.

---

## Vocabulary

- [ ] Vocabulary page loads saved words.
- [ ] Saved words show lemma, gloss, and language.
- [ ] Words can be filtered by language.
- [ ] Words can be searched.
- [ ] "Unsave" / remove word works.
- [ ] SRS review cards are generated from vocabulary words.
- [ ] Vocabulary count matches saved words in Reader.

---

## Review

- [ ] Review page loads review cards.
- [ ] Card front shows text/question.
- [ ] Flipping card reveals answer.
- [ ] Self-rating (Again / Good / Easy) advances to next card.
- [ ] Review session completes with summary.
- [ ] SM-2 algorithm updates interval correctly.
- [ ] Session progress bar works.
- [ ] Empty state shown when no words due for review.

---

## Tutor

- [ ] Tutor page loads.
- [ ] New session can be started.
- [ ] Tutor responds to user messages.
- [ ] Tutor messages stream / render correctly.
- [ ] Session history is saved (visible after reload).
- [ ] Previous sessions can be resumed.
- [ ] Session can be deleted.

---

## Dictionary

- [ ] Dictionary page loads.
- [ ] Search by lemma or inflected form works.
- [ ] Dictionary entries show definitions, morphology, and usage.
- [ ] Filtering by language works.
- [ ] Tapping a result navigates to relevant details.
- [ ] No crash on empty search results.

---

## Offline / poor network

- [ ] App does not crash when network is removed (airplane mode).
- [ ] Previously loaded pages (Library, Reader text) show cached content
      where available.
- [ ] Offline fallback banner / message is displayed (if implemented).
- [ ] AI features (Tutor, pronunciation, sentence analysis) show
      appropriate "Network required" message.
- [ ] Sign-in works after network is restored.
- [ ] Sync queue processes pending writes when network returns.

---

## Account deletion

- [ ] Account deletion is accessible from Settings (if implemented).
- [ ] Deletion confirmation dialog is shown.
- [ ] After deletion, user is signed out and returned to sign-in page.
- [ ] Re-authenticating with the deleted account shows appropriate error.
- [ ] If not yet implemented, the "how to delete" message is shown.

---

## Community visibility

- [ ] Community page is only accessible when `VITE_ENABLE_COMMUNITY=true`.
- [ ] When community is disabled:
  - [ ] Community nav link is hidden.
  - [ ] Navigating to `/app/community` redirects to `/app`.
- [ ] When community is enabled:
  - [ ] Community page loads.
  - [ ] Public profiles appear (users who opted in via `isPublic` toggle).
  - [ ] Your own public profile appears after enabling `isPublic` in
        Settings.
  - [ ] Disabling `isPublic` removes your profile from the Community page.

---

## Subscription behavior on mobile

- [ ] Subscription page loads and displays plan tiers.
- [ ] Monthly / yearly toggle works.
- [ ] On **web**: "Subscribe" navigates to Stripe checkout.
- [ ] On **native (iOS/Android)**:
  - [ ] Paid plan buttons are disabled.
  - [ ] A neutral notice reads: "Subscription management is currently available on the web."
  - [ ] Existing paid users retain full entitlement access after login.
- [ ] Successful checkout redirects back to the app.
- [ ] Cancelled checkout returns to Subscription page gracefully.
- [ ] Manage subscription button opens Stripe Customer Portal (web only).
- [ ] Plan limits (language access) are enforced after subscription changes.
- [ ] Free plan allows the expected number of languages.
- [ ] Subscription status persists across app restarts.

---

## Analytics privacy behavior

- [ ] PostHog analytics initialize (check devtools network tab).
- [ ] Analytics are not sent in `import.meta.env.DEV` mode.
- [ ] Analytics respect `VITE_POSTHOG_API_KEY` being unset (silently
      disabled).
- [ ] Sentry error reporting respects `VITE_SENTRY_DSN` being unset.
- [ ] No analytics calls are made before user consent / opt-in
      (if consent flow is implemented).

---

## iOS safe area

- [ ] App content does not overlap the notch / Dynamic Island.
- [ ] Status bar area is not blocked by UI elements.
- [ ] Home indicator area on iPhone X+ does not overlap interactive
      controls.
- [ ] Navigation bar respects the safe area on all device sizes.
- [ ] Landscape orientation (if supported) does not clip content.

---

## Android back button

- [ ] Back button navigates to the previous page.
- [ ] Back button on the home screen (Library) closes the app.
- [ ] Back button in a modal / panel dismisses it.
- [ ] Back button during sign-in does not leave a broken state.
- [ ] Back button on the sign-in page (if no history) closes the app.

---

## Miscellaneous

- [ ] Page transitions are smooth (no flicker or stutter).
- [ ] Long text passages scroll without performance degradation.
- [ ] Large word lists (Vocabulary, Review) render without lag.
- [ ] Tab bar / navigation highlights the active route.
- [ ] Deep links (if configured) open the correct screen.
- [ ] Push notification permission prompt (if implemented) is not
      shown on first launch without user action.
- [ ] App size is within acceptable limits (< 50 MB for Android APK).
- [ ] Memory usage does not grow unbounded during extended use.
