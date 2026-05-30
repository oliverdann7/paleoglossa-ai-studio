import type { TreebankSentence, TreebankToken } from './types.js';

/**
 * Parse a PROIEL XML string into normalized treebank sentences.
 *
 * PROIEL XML shape (simplified):
 *   <proiel>
 *     <source id="...">
 *       <div>
 *         <sentence id="123" citation-part="Il. 1.1-7" status="reviewed">
 *           <token id="1" form="μῆνιν" lemma="μῆνις" part-of-speech="Nb"
 *                  morphology="-s---fa-" head-id="2" relation="obj"/>
 *           ...
 *         </sentence>
 *       </div>
 *     </source>
 *   </proiel>
 *
 * We do NOT use a full XML library here: the subset PROIEL actually emits
 * is attribute-only on `<sentence>` and `<token>` (no CDATA, no nested
 * elements inside tokens), and a dedicated dep would only run at import
 * time. The regex pair below pulls sentences, then tokens within each.
 *
 * Token `id` values are PROIEL-internal and may be non-contiguous; we
 * remap them to a 0-based per-sentence `index` while preserving head
 * references through an id→index lookup.
 */
export function parseProielXml(xml: string): TreebankSentence[] {
  const sentences: TreebankSentence[] = [];

  const sentenceRe = /<sentence\b([^>]*)>([\s\S]*?)<\/sentence>/g;
  let sentenceMatch: RegExpExecArray | null;

  while ((sentenceMatch = sentenceRe.exec(xml)) !== null) {
    const attrs = parseAttrs(sentenceMatch[1]);
    const inner = sentenceMatch[2];
    const sourceSentenceId = attrs.id;
    if (!sourceSentenceId) continue;

    // Two passes over tokens: first to build the id→index map,
    // then to materialize tokens with remapped head pointers.
    const tokenAttrs: Record<string, string>[] = [];
    const tokenRe = /<token\b([^/>]*)\/?>/g;
    let tokenMatch: RegExpExecArray | null;
    while ((tokenMatch = tokenRe.exec(inner)) !== null) {
      const a = parseAttrs(tokenMatch[1]);
      if (a.id) tokenAttrs.push(a);
    }

    const idToIndex = new Map<string, number>();
    tokenAttrs.forEach((a, i) => idToIndex.set(a.id, i));

    const tokens: TreebankToken[] = tokenAttrs.map((a, i) => {
      const headId = a['head-id'];
      const head =
        headId && idToIndex.has(headId)
          ? (idToIndex.get(headId) as number)
          : -1;
      return {
        index: i,
        surface: a.form ?? '',
        lemma: a.lemma ?? a.form ?? '',
        relation: a.relation ?? 'dep',
        head,
        morphology: a.morphology ?? null,
        gloss: null,
      };
    });

    if (tokens.length === 0) continue;

    sentences.push({
      source: 'proiel',
      sourceSentenceId,
      citation: attrs['citation-part'] || undefined,
      tokens,
    });
  }

  return sentences;
}

/**
 * Parse a flat run of `key="value"` attribute pairs. Handles single or
 * double quotes and entity-escaped quotes (`&quot;`, `&apos;`), which is
 * all PROIEL emits inside its attribute values. Anything else falls
 * through as-is — fine for display fields like `lemma`.
 */
function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const attrRe = /([\w:-]+)\s*=\s*"([^"]*)"|([\w:-]+)\s*=\s*'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(s)) !== null) {
    const key = m[1] ?? m[3];
    const rawVal = m[2] ?? m[4] ?? '';
    out[key] = rawVal
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
  return out;
}
