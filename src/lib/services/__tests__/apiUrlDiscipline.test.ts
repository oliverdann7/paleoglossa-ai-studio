import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guard: every /api call must go through getApiUrl()/apiFetch().
 *
 * In Capacitor native builds the WebView origin is https://localhost, so a
 * relative fetch('/api/…') never reaches the backend — the feature silently
 * dies on iOS/Android while working on web. This has regressed repeatedly
 * (17 call sites found in the 2026-07 native audit).
 */

const SRC_ROOT = join(__dirname, '..', '..', '..');

// The only modules allowed to build/issue relative /api requests.
const ALLOWED = new Set(['apiBaseUrl.ts', 'apiFetch.ts']);

const RAW_API_FETCH = /fetch\(\s*[`'"]\/api/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules') continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry) && !ALLOWED.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe('API URL discipline', () => {
  it('has no raw relative fetch("/api…") outside apiBaseUrl/apiFetch', () => {
    const offenders = walk(SRC_ROOT)
      .filter((file) => RAW_API_FETCH.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(SRC_ROOT.length + 1));
    expect(
      offenders,
      `Relative /api fetches break on native (WebView origin is https://localhost). ` +
        `Wrap the path in getApiUrl(...) from lib/services/apiBaseUrl.ts.`
    ).toEqual([]);
  });
});
