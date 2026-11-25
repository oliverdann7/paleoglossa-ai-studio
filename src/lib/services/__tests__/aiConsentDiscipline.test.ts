import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guard: every request to /api/ai/* must wait for AI consent.
 *
 * Those endpoints forward user content to a third-party model, which the
 * native apps may only do after the user has explicitly agreed (App Store
 * guideline 5.1.2(i)). `apiFetch` and `aiFetch` both call `ensureAiConsent()`;
 * a bare `fetch(getApiUrl('/api/ai/…'))` silently bypasses it.
 */

const SRC_ROOT = join(__dirname, '..', '..', '..');
const ALLOWED = new Set(['aiConsent.ts', 'apiFetch.ts']);
const UNGATED_AI_URL = /getApiUrl\(\s*[`'"]\/api\/ai\//;

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

describe('AI consent discipline', () => {
  it('has no /api/ai request that bypasses the consent gate', () => {
    const offenders = walk(SRC_ROOT)
      .filter((file) => UNGATED_AI_URL.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(SRC_ROOT.length + 1));
    expect(
      offenders,
      `AI endpoints must be called through apiFetch(...) or aiFetch(...) from ` +
        `lib/services/aiConsent.ts so the user is asked before content is sent to the AI provider.`
    ).toEqual([]);
  });
});
