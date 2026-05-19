import { describe, it, expect } from 'vitest';
import { reportPersistenceError } from '../persistenceReporter.js';

// Test the classification and return value without mocking everything
describe('reportPersistenceError', () => {
  it('returns correct structure', () => {
    const error = new Error('Test error');
    const context = {
      operation: 'test:op',
      path: 'test/path',
      category: 'vocabulary' as const,
      userId: 'user-123',
      dataPreservedLocally: true,
    };

    const result = reportPersistenceError(error, context);

    expect(typeof result).toBe('object');
    expect(result.operation).toBe('test:op');
    expect(result.path).toBe('test/path');
    expect(result.category).toBe('vocabulary');
    expect(result.userId).toBe('user-123');
    expect(result.dataPreservedLocally).toBe(true);
    expect(typeof result.classification).toBe('object');
    expect(typeof result.classification.code).toBe('string');
    expect(typeof result.classification.userMessage).toBe('string');
    expect(typeof result.classification.retryable).toBe('boolean');
    expect(typeof result.classification.technical).toBe('string');
    expect(typeof result.suppressed).toBe('boolean');
  });
});
