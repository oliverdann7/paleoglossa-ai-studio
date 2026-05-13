# Security Notes — Field Ownership

This document describes which Firestore fields are written by the client (Firebase
Client SDK) and which are written by the server (Firebase Admin SDK / Stripe webhook).

## User Profile

**Collection:** `users/{userId}`

### Client-Controlled Fields

| Field | Created By | Notes |
|---|---|---|
| `email` | `AuthContext` on sign-up | Set via `createUserWithEmailAndPassword`, written to profile doc |
| `displayName` | `AuthContext` / `SignUp` | User's display name |
| `createdAt` | `AuthContext` on sign-up | Server timestamp set by client SDK |
| `stats` | `AuthContext` on sign-up | Initial empty stats object |

### Server-Controlled Fields

> **Note:** In development mode (no Stripe configured), some of these fields
> may be written by the client as a fallback. In production, these fields
> must only be modified by the server.

| Field | Written By | Notes |
|---|---|---|
| `currentPlan` | Stripe webhook (`api/index.ts`) | Set on subscription create/update/cancel |
| `subscriptionStatus` | Stripe webhook | `active`, `past_due`, `canceled`, `trialing` |
| `stripeCustomerId` | Stripe webhook | Stripe customer ID (never from client) |
| `stripeSubscriptionId` | Stripe webhook | Stripe subscription ID |
| `selectedLanguageIds` | Stripe webhook | Updated when plan changes |
| `subscriptionUpdatedAt` | Stripe webhook | Timestamp |
| `trialEnd` | Stripe webhook | Trial expiry date |

## Vocabulary

**Collection:** `users/{userId}/vocabulary/{termId}`

| Field | Written By | Notes |
|---|---|---|
| `term` | Client (`VocabularyService`) | The lemma or word form |
| `normalizedTerm` | Client | Lowercase/trimmed version |
| `status` | Client | Word state |
| `languageId` | Client | Language code |
| `updatedAt` | Client | Server timestamp |
| `nextReview`, `interval`, `ease`, etc. | Client (`ReviewService`) | SRS scheduling data |
| `encounterCount` | Client | Incrementing counter |
| `lastSeenAt` | Client | Timestamp |
| `notes`, `contexts`, `userGloss` | Client | Optional annotations |

All vocabulary fields are client-controlled. The server does not write to this
collection directly.

## Imports

**Collection:** `users/{userId}/imports/{importId}`

| Field | Written By | Notes |
|---|---|---|
| `title` | Client | Imported text title |
| `languageId` | Client | Language code |
| `sourceType` | Client | `paste`, `file`, `url`, `image`, `pdf` |
| `visibility` | Client | `private`, `shared`, `public` |
| `rawContent` | Client | Full text content |
| `sentences` | Client | Tokenized sentences (after AI analysis) |
| `analysisStatus` | Client | `analyzed`, `raw`, `needs_ai` |
| `stats` | Client | Word counts |

**Note:** The `visibility` field can also be toggled by the server when the
share/unshare Admin SDK endpoints are used. The server writes to `publicTexts`
collection directly; the client updates `visibility` on the import document.

## Settings

**Collection:** `users/{userId}/settings/{documentId}`

All fields are client-controlled. Documents include `main` (stored under
`settings/main`) and `activeLanguage` (stored under `settings/activeLanguage`).

## Review Logs

**Collection:** `users/{userId}/reviewLogs/{logId}`

| Field | Written By | Notes |
|---|---|---|
| `vocabItemId` | Client | Reference to vocabulary term ID |
| `term` | Client | The word reviewed |
| `rating` | Client | Recall rating (0-5) |
| `responseMs` | Client | Response time in milliseconds |
| `intervalBefore` | Client | SRS interval before review |
| `intervalAfter` | Client | SRS interval after review |
| `easeBefore`, `easeAfter` | Client | SRS ease factors |
| `timestamp` | Client | ISO string of review time |
| `createdAt` | Client | Server timestamp |
| `algorithm` | Client | `SM-2` or `FSRS` |

Review logs are append-only from the client. The server does not write to this
collection. Deletion and updates are not allowed from client rules.

## Reading Progress

**Collection:** `users/{userId}/readingProgress/{textId}`

All fields are client-controlled. The server does not write to this collection directly.

## Language Stats

**Collection:** `users/{userId}/languageStats/{languageId}`

All fields are client-controlled. The server does not write to this collection directly.

## Public Texts

**Collection:** `publicTexts/{textId}`

| Field | Written By | Notes |
|---|---|---|
| All fields | **Server only** (Admin SDK) | Client writes are denied by security rules |

This collection is a read-only mirror of shared imports. The server (Admin SDK)
populates it when a user shares an import and removes entries when unsharing.
