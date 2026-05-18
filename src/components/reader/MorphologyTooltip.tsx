import { motion, AnimatePresence } from 'motion/react';

interface Props {
  word: string;
  lemma: string;
  gloss?: string;
  morphology?: string;
  pos?: string;
  x: number;
  y: number;
  visible: boolean;
}

/** Maps abbreviated morphology codes to human-readable labels. */
function parseMorphFields(morphology: string): string[] {
  if (!morphology) return [];
  const labels: string[] = [];

  // POS prefixes (Greek/Hebrew/Latin patterns)
  const posMap: Record<string, string> = {
    'V-': 'Verb',
    'N-': 'Noun',
    'A-': 'Adjective',
    'P-': 'Pronoun',
    'D-': 'Adverb',
    'C-': 'Conjunction',
    CONJ: 'Conj.',
    PREP: 'Prep.',
    ADJ: 'Adj.',
    ADV: 'Adv.',
    PRON: 'Pron.',
  };
  for (const [prefix, label] of Object.entries(posMap)) {
    if (morphology.startsWith(prefix) || morphology.includes(prefix)) {
      labels.push(label);
      break;
    }
  }

  // Tense
  if (/\bP(res)?\b|PAI|PAP|PPI|-P-/.test(morphology)) labels.push('Pres.');
  else if (/\bA(or)?\b|AAI|AAS|AAP|-A-/.test(morphology)) labels.push('Aor.');
  else if (/\bI(mp)?\b|IAI|-I-/.test(morphology)) labels.push('Impf.');
  else if (/\bF(ut)?\b|FAI|-F-/.test(morphology)) labels.push('Fut.');
  else if (/\bPF\b|PFA|PFI/.test(morphology)) labels.push('Perf.');

  // Voice
  if (/\bA(ct)?\b|AI|-A-A/.test(morphology)) labels.push('Act.');
  else if (/\bM(id)?\b|MI|-M-/.test(morphology)) labels.push('Mid.');
  else if (/\bP(as)?\b|PI|-P-P/.test(morphology)) labels.push('Pass.');

  // Mood
  if (/\bI(nd)?\b|-I$/.test(morphology)) labels.push('Ind.');
  else if (/\bS(ub)?\b|-S$/.test(morphology)) labels.push('Subj.');
  else if (/\bO(pt)?\b|-O$/.test(morphology)) labels.push('Opt.');
  else if (/\bP(tc)?\b|PTCP/.test(morphology)) labels.push('Ptc.');
  else if (/\bInf?\b|INF/.test(morphology)) labels.push('Inf.');

  // Case
  if (/Nom|NOM/.test(morphology)) labels.push('Nom.');
  else if (/Gen|GEN/.test(morphology)) labels.push('Gen.');
  else if (/Dat|DAT/.test(morphology)) labels.push('Dat.');
  else if (/Acc|ACC/.test(morphology)) labels.push('Acc.');
  else if (/Voc|VOC/.test(morphology)) labels.push('Voc.');

  // Number
  if (/\bS(g|ing)?\b|-S$|1S|2S|3S/.test(morphology)) labels.push('Sg.');
  else if (/\bP(l)?\b|-P$|1P|2P|3P/.test(morphology)) labels.push('Pl.');

  // Person
  if (/\b1\b|1[SP]/.test(morphology)) labels.push('1st');
  else if (/\b2\b|2[SP]/.test(morphology)) labels.push('2nd');
  else if (/\b3\b|3[SP]/.test(morphology)) labels.push('3rd');

  return [...new Set(labels)]; // deduplicate
}

export function MorphologyTooltip({ word, lemma, gloss, morphology, x, y, visible }: Props) {
  const fields = morphology ? parseMorphFields(morphology) : [];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.14 }}
          className="fixed z-50 pointer-events-none"
          style={{ left: x, top: y - 8, transform: 'translateX(-50%) translateY(-100%)' }}
        >
          <div className="bg-ink text-parch2 rounded-xl shadow-2xl px-3 py-2.5 min-w-[140px] max-w-[240px]">
            <div className="text-[15px] font-serif font-semibold leading-tight mb-0.5">{word}</div>
            {lemma && lemma !== word && (
              <div className="text-[10px] text-parch/50 uppercase tracking-widest mb-1">
                ← {lemma}
              </div>
            )}
            {gloss && <div className="text-[12px] italic text-parch/80 mb-1.5">{gloss}</div>}
            {fields.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {fields.map((f) => (
                  <span
                    key={f}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-parch/70"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            {!gloss && fields.length === 0 && morphology && (
              <div className="text-[10px] text-parch/50 font-mono">{morphology}</div>
            )}
          </div>
          <div className="w-2.5 h-2.5 bg-ink rotate-45 mx-auto -mt-1.5" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
