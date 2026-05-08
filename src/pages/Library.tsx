import { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorpusDB } from '../data/corpus';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { WordState } from '../lib/constants/wordStates';

export const Library = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { knowledge } = useKnowledge();
  
  const mainFilters = ['All', 'Ancient Greek', 'Biblical Hebrew', 'Classical Latin'];

  const allTexts = CorpusDB.getTexts().map(t => {
    // Calculate real stats for each text
    const sections = t.sectionsPreview?.map(p => CorpusDB.getSection(p.id)).filter(Boolean) || [];
    const allTokens = sections.flatMap(s => s?.sentences.flatMap(sent => sent.tokens) || []);
    const totalWords = allTokens.length;
    
    if (totalWords === 0) return { ...t, percentKnown: 0, percentLearning: 0, totalWords: 0, level: 'A1' };

    const knownWords = allTokens.filter(tok => knowledge[tok.lemma] === WordState.KNOWN).length;
    const learningWords = allTokens.filter(tok => 
      knowledge[tok.lemma] === WordState.LEARNING || 
      knowledge[tok.lemma] === WordState.FAMILIAR
    ).length;

    return {
      ...t,
      percentKnown: Math.round((knownWords / totalWords) * 100),
      percentLearning: Math.round((learningWords / totalWords) * 100),
      totalWords,
      level: t.id === 'Jn-1' ? 'A1' : t.id === 'Gen' ? 'A2' : 'B1' // Demo levels
    };
  });

  const filteredTexts = allTexts.filter(t => {
    let matchesFilter = true;
    if (activeFilter !== 'All') {
      const langMap: Record<string, string> = {
        'Ancient Greek': 'grc',
        'Biblical Hebrew': 'hbo',
        'Classical Latin': 'lat'
      };
      matchesFilter = t.language === langMap[activeFilter];
    }

    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCefrClass = (level: string) => {
    if (level.startsWith('A')) return 'cefr-a';
    if (level.startsWith('B')) return 'cefr-b';
    return 'cefr-c';
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">The Library</h2>
        <p className="font-body text-[15px] italic text-ink2">
          Ancient wisdom, now familiar. Every word tracked, every text a milestone.
        </p>
      </header>

      <div className="flex flex-col gap-5 mb-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-bdr rounded-[12px] text-sm font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {mainFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11.5px] font-medium font-sans transition-all duration-150 border",
                activeFilter === filter
                  ? "bg-blue text-white shadow-sm border-blue"
                  : "bg-parch text-ink3 border-bdr hover:bg-parch2"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredTexts.map((text, i) => (
           <motion.div
            key={text.id}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.03, duration: 0.3 }}
             onClick={() => onSelectText(text)}
             className="card p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-all min-h-[220px]"
           >
             <div>
               <div className="flex justify-between items-start mb-2">
                 <h4 className="text-[18px] font-serif font-medium text-ink leading-snug pr-4">{text.title}</h4>
                 <span className={cn("pill flex-shrink-0 font-bold", getCefrClass(text.level))}>{text.level}</span>
               </div>
               
               <div className="text-[10px] text-ink3 font-sans mb-4 uppercase tracking-[0.1em] font-bold">
                 {text.author} <span className="mx-1 opacity-50">•</span> {text.language === 'grc' ? 'Ancient Greek' : text.language === 'hbo' ? 'Biblical Hebrew' : 'Classical Latin'}
               </div>

               {/* Stats & Progress Bars */}
               <div className="space-y-4 mb-6">
                 <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-500 uppercase tracking-tight">{text.totalWords} Total Words</span>
                    <span className="text-blue">{text.percentKnown}% Known</span>
                 </div>
                 <div className="flex h-1.5 w-full bg-parch3 rounded-full overflow-hidden">
                    <div className="bg-blue h-full transition-all duration-500" style={{ width: `${text.percentKnown}%` }} />
                    <div className="bg-amber h-full transition-all duration-500 opacity-60" style={{ width: `${text.percentLearning}%` }} />
                 </div>
                 <div className="flex gap-4">
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-ink leading-none">{text.percentKnown}%</span>
                       <span className="text-[8px] uppercase font-bold text-muted tracking-widest">Known</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-amber leading-none">{text.percentLearning}%</span>
                       <span className="text-[8px] uppercase font-bold text-muted tracking-widest">Learning</span>
                    </div>
                 </div>
               </div>
             </div>

             <div className="flex items-end justify-between pt-4 mt-auto">
                <span className="text-[11px] font-body italic text-muted">Original Scripture</span>
                <div className="bg-blue/5 text-blue px-3 py-1 rounded-full text-[11px] font-bold group-hover:bg-blue group-hover:text-white transition-all">
                  Read Text
                </div>
             </div>
           </motion.div>
        ))}
      </div>
    </div>
  );
};
