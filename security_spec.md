# Security Specification

## Data Invariants
1. \`users\`
  - A user document can only be created by the user themselves.
  - \`email\` and \`createdAt\` are immutable.
  - A user can only edit their own \`displayName\` and \`currentPlan\`.

2. \`vocabulary\`
  - Items belong strictly to the \`userId\` indicated, and must match the authenticated user.
  - A vocabulary item must have an owner, term, and valid repetition state.
  - Certain fields are immutable after creation (\`userId\`, \`createdAt\`).

## The "Dirty Dozen" Payloads

1. **User - Identity Spoofing**: \`create\` a user document with someone else's UID.
2. **User - Email Modification**: \`update\` the \`email\` field of an existing user.
3. **User - Invalid Plan Update**: \`update\` the \`currentPlan\` to an invalid value (e.g. \`admin\`).
4. **Vocab - Cross-User Creation**: \`create\` a vocabulary item with a \`userId\` belonging to someone else.
5. **Vocab - Unauthorized Read**: \`get\` a vocabulary item belonging to someone else.
6. **Vocab - Unauthorized List**: \`list\` vocabulary items without restricting \`userId\` to the auth uid.
7. **Vocab - Modify Owner**: \`update\` to change the \`userId\` of an existing vocabulary item.
8. **Vocab - Invalid Status**: \`update\` a vocabulary item's \`status\` to an arbitrary string not in the enum.
9. **Vocab - Omit Required Field**: \`create\` a vocabulary item without \`nextReview\`.
10. **Vocab - Ghost Field**: \`create\` or \`update\` a vocabulary item injecting a ghost field (e.g., \`isAdmin: true\`).
11. **Vocab - Giant Payload Attack (Denial of Wallet)**: \`update\` a vocabulary \`term\` to a 10MB string.
12. **Vocab - Untrusted Client Timestamp**: \`create\` an item with a client-side timestamp for \`updatedAt\` instead of \`request.time\`.
