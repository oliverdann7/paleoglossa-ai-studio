# Paleoglossa API Reference

> **Base URL (production):** `https://paleoglossa.com/api`  
> **Base URL (dev):** `http://localhost:3000/api`

All authenticated routes require an `Authorization: Bearer <firebase-id-token>` header or an `X-User-Id` header for admin calls. Tokens are obtained from Firebase Auth.

---

## Authentication

### `POST /api/auth/register`
Register a new user with email + password.

**Body:** `{ email: string, password: string, displayName?: string }`  
**Response:** `{ uid: string, email: string }`

---

## AI

### `POST /api/ai/word-info`
Explain a word in context via Gemini.

**Auth:** required  
**Body:** `{ word: string, sentence?: string, languageId: string, context?: string }`  
**Response:** `{ gloss: string, morphology?: string, etymology?: string, examples?: string[] }`

### `POST /api/ai/sentence-analysis`
Morphological and syntactic analysis of a full sentence.

**Auth:** required  
**Body:** `{ sentence: string, languageId: string }`  
**Response:** `{ tokens: TokenAnalysis[], syntaxNotes?: string }`

### `POST /api/ai/tutor`
Stream a tutor chat response (Gemini). Returns `text/event-stream`.

**Auth:** required  
**Body:** `{ messages: { role: 'user'|'assistant', content: string }[], languageId: string, mode: string, textContext?: string }`  
**Response:** Server-Sent Events with `data:` chunks

### `POST /api/ai/pronunciation`
Generate IPA transcription for a word.

**Auth:** required  
**Body:** `{ word: string, languageId: string, mode?: string }`  
**Response:** `{ ipa: string, notes?: string }`

### `POST /api/ai/historical-context`
Generate historical/geographical context for a text section.

**Auth:** required  
**Body:** `{ textTitle: string, languageId: string, sectionLabel: string, excerpt: string }`  
**Response:** `{ period?: string, geography?: string, figures?: string[], background: string, cacheKey: string }`

### `POST /api/ai/concept-summary`
Generate a semantic concept summary for a theologically/philosophically significant lemma.

**Auth:** required  
**Body:** `{ lemma: string, languageId: string, gloss: string }`  
**Response:** `{ summary: string, domains: string[], cognates: string[] }`

### `POST /api/ai/paradigm`
Generate a declension or conjugation paradigm table for a lemma.

**Auth:** required  
**Body:** `{ lemma: string, partOfSpeech: string, languageId: string }`  
**Response:** `{ html: string, forms: ParadigmForm[] }`

---

## Audio

### `GET /api/audio/tts`
Text-to-Speech synthesis with server-side caching.

**Auth:** required  
**Query:** `text=string&languageId=string&mode=restored|erasmian|modern`  
**Response:** `audio/mpeg` binary stream

### `GET /api/audio/pronunciation-guide`
Return a static or AI-generated pronunciation guide for a language.

**Auth:** required  
**Query:** `languageId=string&mode=string`  
**Response:** `{ sections: GuideSection[] }`

---

## Courses

### `GET /api/courses`
List all public courses + courses owned by the user.

**Auth:** required  
**Response:** `Course[]`

### `POST /api/courses`
Create a new course.

**Auth:** required  
**Body:** `{ title: string, description: string, languageId: string, isPublic?: boolean }`  
**Response:** `{ id: string } & Course`

### `GET /api/courses/:courseId`
Get course details including members and text assignments.

**Auth:** required  
**Response:** `Course & { members: CourseMember[] }`

### `PUT /api/courses/:courseId`
Update course metadata or text assignments.

**Auth:** required (owner only)  
**Body:** `Partial<Course>`  
**Response:** `{ ok: true }`

### `DELETE /api/courses/:courseId`
Delete a course.

**Auth:** required (owner only)  
**Response:** `{ ok: true }`

### `POST /api/courses/:courseId/join`
Enroll with an invite code.

**Auth:** required  
**Body:** `{ inviteCode: string }`  
**Response:** `{ ok: true, courseId: string }`

### `DELETE /api/courses/:courseId/members/:memberId`
Remove a student from a course.

**Auth:** required (owner only)  
**Response:** `{ ok: true }`

---

## Lexicon

### `GET /api/lexicon/:languageId/:lemma`
Look up a lemma in the static dictionary.

**Auth:** optional  
**Response:** `{ lemma: string, gloss: string, partOfSpeech: string, forms: InflectedForm[] }`

### `GET /api/lexicon/:languageId/search`
Search lemmas by prefix or substring.

**Auth:** optional  
**Query:** `q=string&limit=number`  
**Response:** `LemmaEntry[]`

---

## Notes

### `GET /api/notes`
List the current user's notes.

**Auth:** required  
**Query:** `notebookId?=string&textId?=string&limit?=number`  
**Response:** `ResearchNote[]`

### `POST /api/notes`
Create a new note.

**Auth:** required  
**Body:** `{ content: string, notebookId?: string, textId?: string, token?: string, lemma?: string, tags?: string[] }`  
**Response:** `{ id: string } & ResearchNote`

### `PUT /api/notes/:noteId`
Update a note.

**Auth:** required (owner only)  
**Body:** `Partial<ResearchNote>`  
**Response:** `{ ok: true }`

### `DELETE /api/notes/:noteId`
Delete a note.

**Auth:** required (owner only)  
**Response:** `{ ok: true }`

---

## Search

### `GET /api/search`
Full-text and lemma search across the corpus.

**Auth:** required  
**Query:** `q=string&languageId?=string&lemma?=string&page?=number&pageSize?=number`  
**Response:** `{ results: SearchResult[], total: number, page: number }`

---

## Parse

### `POST /api/parse`
Morphological parse of a raw text string.

**Auth:** required  
**Body:** `{ text: string, languageId: string }`  
**Response:** `{ tokens: ParsedToken[] }`

---

## Billing (Stripe)

### `POST /api/stripe/checkout`
Create a Stripe Checkout session.

**Auth:** required  
**Body:** `{ priceId: string, successUrl: string, cancelUrl: string }`  
**Response:** `{ url: string }`

### `POST /api/stripe/portal`
Create a Stripe Customer Portal session.

**Auth:** required  
**Response:** `{ url: string }`

### `POST /api/stripe/webhook`
Stripe webhook receiver (signature verified via `STRIPE_WEBHOOK_SECRET`).

**Auth:** none (Stripe signature header)  
**Body:** raw Stripe event JSON

---

## Admin

All admin routes require `isAdmin: true` on the user's Firebase custom claims.

### `GET /api/admin/overview`
Site-wide stats: total users, paid/free split, open reports, AI calls.

### `GET /api/admin/users`
List all users with plan/subscription/admin status.

### `POST /api/admin/users/:uid/set-plan`
Override a user's subscription plan. Body: `{ plan: string }`.

### `POST /api/admin/users/:uid/set-admin`
Grant or revoke admin. Body: `{ grant: boolean }`.

### `GET /api/admin/reports`
List all content reports.

### `POST /api/admin/publicTexts/:textId/hide`
Hide a public text after a content report.

### `POST /api/admin/publicTexts/:textId/restore`
Restore a hidden public text.

### `GET /api/admin/activities`
Recent site-wide activity log.

### `GET /api/admin/courses`
List all courses across all users.

### `DELETE /api/admin/courses/:courseId`
Delete any course.

### `GET /api/admin/corpus-quality`
Per-language corpus quality metrics (gloss, POS, lemma, morph coverage).

### `GET /api/admin/errors`
Retrieve recent server-side 500 errors from the in-process circular buffer.

### `DELETE /api/admin/errors`
Clear the error buffer.

---

## Error format

All error responses follow:

```json
{ "error": "Human-readable error message" }
```

HTTP status codes used: `200`, `400`, `401`, `403`, `404`, `409`, `429`, `500`.
