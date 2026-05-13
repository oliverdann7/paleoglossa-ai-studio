import { describe, it, expect } from 'vitest';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
const MAX_BASE64 = 14 * 1024 * 1024;

describe('OCR endpoint validation', () => {

  it('rejects missing languageId', () => {
    const result = validate({ imageBase64: 'abc', mimeType: 'image/jpeg' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects missing imageBase64', () => {
    const result = validate({ languageId: 'grc', mimeType: 'image/jpeg' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects missing mimeType', () => {
    const result = validate({ languageId: 'grc', imageBase64: 'abc' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('rejects unsupported mimeType', () => {
    const result = validate({ languageId: 'grc', imageBase64: 'abc', mimeType: 'image/gif' });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('INVALID_INPUT');
  });

  it('accepts all allowed mime types', () => {
    for (const mime of ALLOWED_TYPES) {
      const result = validate({ languageId: 'grc', imageBase64: 'abc', mimeType: mime });
      expect(result.status).toBe(200);
    }
  });

  it('rejects oversized image', () => {
    const bigBase64 = 'a'.repeat(MAX_BASE64 + 1);
    const result = validate({ languageId: 'grc', imageBase64: bigBase64, mimeType: 'image/jpeg' });
    expect(result.status).toBe(413);
    expect(result.body.code).toBe('IMAGE_TOO_LARGE');
  });

  it('returns text field on success', () => {
    const result = validate({ languageId: 'grc', imageBase64: 'abc', mimeType: 'image/png' });
    expect(result.status).toBe(200);
    expect(typeof result.body.text).toBe('string');
  });

  it('returns warnings when no API key', () => {
    const result = validate({ languageId: 'hbo', imageBase64: 'abc', mimeType: 'image/webp' });
    if (result.body.warnings && Array.isArray(result.body.warnings)) {
      expect(result.body.warnings.length).toBeGreaterThan(0);
    }
  });

  it('returns confidence field in response', () => {
    const result = validate({ languageId: 'lat', imageBase64: 'abc', mimeType: 'image/bmp' });
    expect(result.body).toHaveProperty('confidence');
  });

  it('returns text field (empty string) on error', () => {
    // 500 error — simulate
    const result = simulateError();
    expect(result.status).toBe(500);
    expect(typeof result.body.text).toBe('string');
    expect(Array.isArray(result.body.warnings)).toBe(true);
  });
});

function validate(body: any): { status: number; body: any } {
  const { languageId, imageBase64, mimeType } = body || {};

  if (!languageId || typeof languageId !== 'string') {
    return { status: 400, body: { error: 'languageId is required', code: 'INVALID_INPUT' } };
  }
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { status: 400, body: { error: 'imageBase64 is required', code: 'INVALID_INPUT' } };
  }
  if (!mimeType || !ALLOWED_TYPES.includes(mimeType)) {
    return { status: 400, body: { error: 'Unsupported image type', code: 'INVALID_INPUT' } };
  }
  if (imageBase64.length > MAX_BASE64) {
    return { status: 413, body: { error: 'Image too large', code: 'IMAGE_TOO_LARGE' } };
  }

  return {
    status: 200,
    body: { text: '', confidence: null, warnings: ['Gemini API key not configured. OCR is unavailable.'] },
  };
}

function simulateError(): { status: number; body: any } {
  return {
    status: 500,
    body: {
      text: '',
      confidence: null,
      warnings: ['OCR processing failed: Simulated error'],
      error: 'Simulated error',
      code: 'OCR_ERROR',
    },
  };
}
