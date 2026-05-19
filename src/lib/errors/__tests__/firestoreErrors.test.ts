import { describe, it, expect } from 'vitest';
import { classifyFirestoreError } from '../firestoreErrors.js';

describe('classifyFirestoreError', () => {
  it('classifies permission-denied from Firebase error code', () => {
    const err = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('PERMISSION_DENIED');
    expect(result.retryable).toBe(false);
    expect(result.userMessage).toContain('Permission denied');
  });

  it('classifies permission-denied from error message', () => {
    const err = new Error('PERMISSION_DENIED: The caller does not have permission');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('PERMISSION_DENIED');
  });

  it('classifies unauthenticated', () => {
    const err = { code: 'unauthenticated', message: 'Not authenticated.' };
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('UNAUTHENTICATED');
    expect(result.userMessage).toContain('Authentication failed');
  });

  it('classifies unavailable/offline', () => {
    const err = new Error('Unavailable: The service is currently unavailable');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('UNAVAILABLE');
    expect(result.userMessage).toContain('offline');
    expect(result.retryable).toBe(true);
  });

  it('classifies not-found', () => {
    const err = { code: 'not-found', message: 'Document not found.' };
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.userMessage).toContain('not found');
  });

  it('classifies resource-exhausted', () => {
    const err = new Error('Resource has been exhausted (e.g. quota exceeded)');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('RESOURCE_EXHAUSTED');
    expect(result.userMessage).toContain('Quota');
  });

  it('classifies resource-exhausted via rate limit message', () => {
    const err = new Error('Rate limit exceeded. Please try again later.');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('RESOURCE_EXHAUSTED');
  });

  it('classifies invalid-argument', () => {
    const err = { code: 'invalid-argument', message: 'Invalid argument.' };
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('INVALID_ARGUMENT');
    expect(result.retryable).toBe(true);
  });

  it('classifies network errors', () => {
    const err = new Error('Network error: Failed to fetch');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('UNAVAILABLE');
  });

  it('classifies unknown errors as UNKNOWN', () => {
    const err = new Error('Something completely unexpected happened');
    const result = classifyFirestoreError(err);
    expect(result.code).toBe('UNKNOWN');
    expect(result.retryable).toBe(true);
    expect(result.userMessage).toContain('save');
  });

  it('stores technical message', () => {
    const err = new Error('Specific technical details here');
    const result = classifyFirestoreError(err);
    expect(result.technical).toBe('Specific technical details here');
  });

  it('handles non-Error objects', () => {
    const result = classifyFirestoreError('string error');
    expect(result.code).toBe('UNKNOWN');
    expect(result.technical).toBe('string error');
  });
});
