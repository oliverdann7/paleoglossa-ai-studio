import { useState, useEffect } from "react";
import { ChevronLeft, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Concept {
  id: string; title: string; languageId: string; explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  relatedMorphKeys: string[]; status: string;
}

export const Grammar = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grammar/concepts').then(r => r.json()).then(data => { setConcepts(data); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" /></div>;

  if (selected) return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen">
      <button onClick={() => setSelected(null)} className="text-muted hover:text-ink flex items-center gap-1 mb-6"><ChevronLeft className="w-4 h-4" /> Back to Concepts</button>
      <h2 className="text-[24px] font-serif font-bold text-ink mb-2">{selected.title}</h2>
      <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full", selected.status === 'complete' ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber")}>{selected.status}</span>
      <span className="text-[12px] text-muted ml-2">{selected.languageId}</span>
      <div className="mt-6 text-[15px] text-ink2 leading-relaxed whitespace-pre-wrap">{selected.explanation}</div>
      {selected.examples.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[13px] font-bold text-ink mb-3">Examples</h3>
          <div className="space-y-3">
            {selected.examples.map((ex, i) => (
              <div key={i} className="card p-4">
                <div className="text-[17px] font-serif text-ink">{ex.surface}</div>
                <div className="text-[13px] text-ink2 italic mt-1">{ex.gloss}</div>
                {ex.translation && <div className="text-[13px] text-muted mt-1">{ex.translation}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-2">Grammar Atlas</h2>
      <p className="text-ink2 text-[15px] mb-6">Curated grammar concepts for classical languages.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} className="card p-5 hover:border-blue/30 transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-blue mt-1 shrink-0" />
              <div>
                <h3 className="text-[16px] font-bold text-ink mb-1">{c.title}</h3>
                <p className="text-[12px] text-muted mb-2">{c.languageId}</p>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full", c.status === 'complete' ? "bg-emerald-50 text-emerald-700" : "bg-amber/10 text-amber")}>{c.status}</span>
                  <span className="text-[11px] text-muted">{c.examples.length} examples</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-muted text-[13px] mt-8 italic">More concepts will be added as the corpus grows.</p>
    </div>
  );
};
