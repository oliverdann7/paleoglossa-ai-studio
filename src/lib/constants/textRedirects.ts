/**
 * Reader deep-link redirects for retired bundled texts.
 *
 * These bundled excerpts were removed from the corpus (their content was an
 * inauthentic paraphrase); the ids redirect to the authentic served full
 * works so old bookmarks and deep links keep resolving.
 */
export const TEXT_ID_REDIRECTS: Record<string, string> = {
  'Plato-Apology-1': 'grc-plato-apology-full',
  'Cic-Catilina-1': 'lat-cicero-in-catilinam-full',
  'Ovid-Metamorphoses-1': 'lat-ovid-metamorphoses-full',
};
