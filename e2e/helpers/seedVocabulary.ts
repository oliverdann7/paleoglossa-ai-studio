import { Page } from '@playwright/test';

const KNOWLEDGE_KEY = 'paleoglossa_knowledge';

export interface SeedWord {
  lemma: string;
  state: 'LEARNING' | 'FAMILIAR' | 'KNOWN' | 'SEEN' | 'NEW';
  languageId: string;
  gloss?: string;
  /** nextReview ISO string — defaults to yesterday (due now) */
  nextReview?: string;
}

/** Seed vocabulary into localStorage before the page initialises. */
export async function seedVocabulary(page: Page, words: SeedWord[]) {
  await page.addInitScript(
    ({ key, items }: { key: string; items: SeedWord[] }) => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString();
      const map: Record<string, object> = {};
      for (const w of items) {
        map[w.lemma] = {
          state: w.state,
          languageId: w.languageId,
          userGloss: w.gloss ?? '',
          srs:
            w.state === 'LEARNING' || w.state === 'FAMILIAR' || w.state === 'KNOWN'
              ? { nextReview: w.nextReview ?? yesterday, interval: 1, ease: 2.5, step: 1 }
              : undefined,
        };
      }
      localStorage.setItem(key, JSON.stringify(map));
    },
    { key: KNOWLEDGE_KEY, items: words }
  );
}
