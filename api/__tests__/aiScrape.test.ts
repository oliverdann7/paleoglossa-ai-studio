import { describe, it, expect } from 'vitest';

// Replicate the validation from the route
function isPrivateIP(hostname: string): boolean {
  return /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|0\.0\.0\.0$|localhost$|.*\.local$)/.test(hostname);
}

function isValidScrapeUrl(urlString: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try { parsed = new URL(urlString); } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only http and https URLs are allowed' };
  }
  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    return { valid: false, reason: 'Localhost URLs are not allowed' };
  }
  if (isPrivateIP(parsed.hostname)) {
    return { valid: false, reason: 'Private IP ranges are not allowed' };
  }
  return { valid: true };
}

describe('Scrape URL validation', () => {

  it('rejects empty URL', () => {
    const result = isValidScrapeUrl('');
    expect(result.valid).toBe(false);
  });

  it('rejects invalid URL format', () => {
    const result = isValidScrapeUrl('not a url');
    expect(result.valid).toBe(false);
  });

  it('rejects file:// protocol', () => {
    const result = isValidScrapeUrl('file:///etc/passwd');
    expect(result.valid).toBe(false);
  });

  it('rejects ftp:// protocol', () => {
    const result = isValidScrapeUrl('ftp://example.com/file');
    expect(result.valid).toBe(false);
  });

  it('rejects localhost', () => {
    const result = isValidScrapeUrl('http://localhost:3000/admin');
    expect(result.valid).toBe(false);
  });

  it('rejects 127.0.0.1', () => {
    const result = isValidScrapeUrl('http://127.0.0.1:3000/');
    expect(result.valid).toBe(false);
  });

  it('rejects private IP 10.x.x.x', () => {
    const result = isValidScrapeUrl('http://10.0.0.1/admin');
    expect(result.valid).toBe(false);
  });

  it('rejects private IP 192.168.x.x', () => {
    const result = isValidScrapeUrl('http://192.168.1.1/');
    expect(result.valid).toBe(false);
  });

  it('accepts public HTTPS URL', () => {
    const result = isValidScrapeUrl('https://example.com/text');
    expect(result.valid).toBe(true);
  });

  it('accepts public HTTP URL', () => {
    const result = isValidScrapeUrl('http://example.com/text');
    expect(result.valid).toBe(true);
  });
});
