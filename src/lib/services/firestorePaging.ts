import {
  CollectionReference,
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';

/**
 * Page size for boot-path collection scans. Bounds each Firestore query so a
 * heavy user's vocabulary/imports/progress load streams in capped chunks
 * instead of one unbounded snapshot (roadmap § 11, item 0.8).
 */
export const FIRESTORE_PAGE_SIZE = 500;

/**
 * Fetch every document in a collection in pages of `pageSize`, ordered by
 * document ID. Behaves like `getDocs(collection).docs` but never issues an
 * unbounded query.
 */
export async function getDocsPaged(
  ref: CollectionReference<DocumentData>,
  pageSize: number = FIRESTORE_PAGE_SIZE
): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const docs: QueryDocumentSnapshot<DocumentData>[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;
  for (;;) {
    const page: Query<DocumentData> = cursor
      ? query(ref, orderBy(documentId()), startAfter(cursor), limit(pageSize))
      : query(ref, orderBy(documentId()), limit(pageSize));
    const snap = await getDocs(page);
    docs.push(...snap.docs);
    if (snap.docs.length < pageSize) break;
    cursor = snap.docs[snap.docs.length - 1];
  }
  return docs;
}
