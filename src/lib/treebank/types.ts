/**
 * Cross-source treebank types. The format is intentionally tiny —
 * just the fields the Syntax page renders — so that PROIEL, Gorman,
 * and Perseus exports can all converge on the same on-disk schema.
 */

export interface TreebankToken {
  /** 0-based index of the token within the sentence. */
  index: number;
  surface: string;
  lemma: string;
  /** Universal Dependencies relation label (or source-specific if not yet normalized). */
  relation: string;
  /** Index of the head token, or -1 for the sentence root. */
  head: number;
  /** Free-form morphology string ("noun.acc.sg.fem", PROIEL "-s---fa-", etc.). */
  morphology?: string | null;
  /** Optional short gloss for display. */
  gloss?: string | null;
}

export type TreebankSourceId = 'proiel' | 'gorman' | 'perseus';

export interface TreebankSentence {
  /** Provenance — which corpus this sentence was harvested from. */
  source: TreebankSourceId;
  /**
   * Source-internal sentence identifier. For PROIEL this is the
   * `<sentence id>` attribute, which lets us round-trip back to the
   * original XML if we ever need to re-import.
   */
  sourceSentenceId: string;
  /** Source citation, e.g. "Hom. Il. 1.1-7". Display-only. */
  citation?: string;
  tokens: TreebankToken[];
}

/**
 * On-disk sidecar format. One file per Paleoglossa text. Keyed by
 * `${textId}_${sentenceIndex}` so the API can do an O(1) lookup that
 * matches the existing Firestore key shape in `syntaxAnnotations`.
 */
export interface TreebankSidecar {
  /** Schema version — bump when token shape changes. */
  schemaVersion: 1;
  source: TreebankSourceId;
  /** Paleoglossa textId this sidecar attaches to. */
  textId: string;
  /** Map of `${textId}_${sentenceIndex}` → sentence. */
  sentences: Record<string, TreebankSentence>;
}
