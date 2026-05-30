import { useMemo } from 'react';
import { Link2 } from 'lucide-react';
import { getCognates } from '../../lib/data/cognatePairs.js';
import { getLanguageById } from '../../lib/constants/languages.js';

interface Props {
  lemma: string;
  languageId: string;
}

const LANG_DISPLAY: Record<string, string> = {
  grc: 'Ancient Greek',
  lat: 'Latin',
  hbo: 'Hebrew',
  san: 'Sanskrit',
  arc: 'Aramaic',
  syr: 'Syriac',
  cop: 'Coptic',
};

function langName(id: string): string {
  const lang = getLanguageById(id);
  return lang ? lang.name : (LANG_DISPLAY[id] ?? id.toUpperCase());
}

export function CognateLinksSection({ lemma, languageId }: Props) {
  const result = useMemo(() => getCognates(lemma, languageId), [lemma, languageId]);

  if (!result || result.others.length === 0) return null;

  // Group by language for clean display
  const byLang = new Map<string, typeof result.others>();
  for (const c of result.others) {
    if (!byLang.has(c.languageId)) byLang.set(c.languageId, []);
    byLang.get(c.languageId)!.push(c);
  }

  return (
    <div className="mb-6">
      <div className="eyebrow mb-3 text-ink flex items-center gap-2">
        <Link2 className="w-3 h-3 opacity-60" aria-hidden />
        Related in Other Languages
      </div>

      {result.entry.note && (
        <p className="text-[11px] text-muted italic mb-3 leading-relaxed">
          Root: <span className="font-mono text-ink2">{result.entry.root}</span>
          {' — '}
          {result.entry.note}
        </p>
      )}

      <div className="space-y-2">
        {Array.from(byLang.entries()).map(([lid, cognates]) => (
          <div key={lid} className="card p-3 bg-parch2/60">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted mb-1.5">
              {langName(lid)}
            </div>
            <div className="flex flex-wrap gap-2">
              {cognates.map((c) => (
                <span key={`${lid}-${c.lemma}`} className="flex items-baseline gap-1.5">
                  <bdi
                    className="font-serif text-[15px] text-ink font-medium"
                    lang={lid}
                    dir={['hbo', 'arc', 'syr'].includes(lid) ? 'rtl' : 'ltr'}
                  >
                    {c.lemma}
                  </bdi>
                  <span className="text-[11px] text-muted italic">{c.gloss}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
