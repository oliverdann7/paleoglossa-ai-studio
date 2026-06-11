/**
 * getDocsPaged — bounded pagination for boot-path collection scans
 * (roadmap § 11, item 0.8).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetDocs, mockQuery, mockOrderBy, mockLimit, mockStartAfter, mockDocumentId } =
  vi.hoisted(() => ({
    mockGetDocs: vi.fn(),
    mockQuery: vi.fn((...parts: unknown[]) => ({ _parts: parts })),
    mockOrderBy: vi.fn(() => ({ _orderBy: true })),
    mockLimit: vi.fn((n: number) => ({ _limit: n })),
    mockStartAfter: vi.fn((cursor: unknown) => ({ _startAfter: cursor })),
    mockDocumentId: vi.fn(() => '__name__'),
  }));

vi.mock('firebase/firestore', () => ({
  getDocs: mockGetDocs,
  query: mockQuery,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
  documentId: mockDocumentId,
}));

import { getDocsPaged } from '../firestorePaging.js';

const fakeDoc = (id: string) => ({ id, data: () => ({ id }) });
const fakeRef = {} as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getDocsPaged', () => {
  it('returns a single short page with one query', async () => {
    const docs = [fakeDoc('a'), fakeDoc('b')];
    mockGetDocs.mockResolvedValueOnce({ docs });

    const result = await getDocsPaged(fakeRef, 3);

    expect(result.map((d) => d.id)).toEqual(['a', 'b']);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(mockLimit).toHaveBeenCalledWith(3);
    expect(mockStartAfter).not.toHaveBeenCalled();
  });

  it('returns an empty array for an empty collection', async () => {
    mockGetDocs.mockResolvedValueOnce({ docs: [] });

    const result = await getDocsPaged(fakeRef, 3);

    expect(result).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });

  it('pages through a large collection, cursoring after each full page', async () => {
    const page1 = [fakeDoc('a'), fakeDoc('b'), fakeDoc('c')];
    const page2 = [fakeDoc('d'), fakeDoc('e'), fakeDoc('f')];
    const page3 = [fakeDoc('g')];
    mockGetDocs
      .mockResolvedValueOnce({ docs: page1 })
      .mockResolvedValueOnce({ docs: page2 })
      .mockResolvedValueOnce({ docs: page3 });

    const result = await getDocsPaged(fakeRef, 3);

    expect(result.map((d) => d.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expect(mockGetDocs).toHaveBeenCalledTimes(3);
    // Pages 2 and 3 must cursor from the last doc of the previous page.
    expect(mockStartAfter).toHaveBeenNthCalledWith(1, page1[2]);
    expect(mockStartAfter).toHaveBeenNthCalledWith(2, page2[2]);
  });

  it('issues one extra empty query when the total is an exact multiple of the page size', async () => {
    const page1 = [fakeDoc('a'), fakeDoc('b'), fakeDoc('c')];
    mockGetDocs.mockResolvedValueOnce({ docs: page1 }).mockResolvedValueOnce({ docs: [] });

    const result = await getDocsPaged(fakeRef, 3);

    expect(result.map((d) => d.id)).toEqual(['a', 'b', 'c']);
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
  });
});
