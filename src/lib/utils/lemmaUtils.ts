export function normalizeLemmaKey(lemma: string): string {
  return lemma.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
