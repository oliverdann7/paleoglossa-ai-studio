import { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { texts } from '../data/texts';

export const Library = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Specific filters requested: "All" + 4 languages + 3 difficulty bands
  const mainFilters = ['All', 'Ancient Greek', 'Biblical Hebrew', 'Egyptian Hieroglyphs', 'Classical Latin', 'Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)'];

  const filteredTexts = texts.filter(t => {
    let matchesFilter = false;
    if (activeFilter === 'All') matchesFilter = true;
    else if (activeFilter.includes('Beginner')) matchesFilter = t.level === 'A1' || t.level === 'A2';
    else if (activeFilter.includes('Intermediate')) matchesFilter = t.level === 'B1' || t.level === 'B2';
    else if (activeFilter.includes('Advanced')) matchesFilter = t.level === 'C1' || t.level === 'C2';
    else matchesFilter = t.language === activeFilter;

    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
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
          Eighty-three texts across four languages — from your first ten verses to the Septuagint
        </p>
      </header>

      <div className="flex flex-col gap-5 mb-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search texts or authors..." 
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
             className="card p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-colors min-h-[180px]"
           >
             <div>
               <div className="flex justify-between items-start mb-2">
                 <h4 className="text-[16px] font-serif font-medium text-ink leading-snug pr-4">{text.title}</h4>
                 <span className={cn("pill flex-shrink-0 font-medium", getCefrClass(text.level))}>{text.level}</span>
               </div>
               
               <div className="text-[10px] text-ink3 font-sans mb-3">
                 {text.author} <span className="mx-1 opacity-50">•</span> {text.era} <span className="mx-1 opacity-50">•</span> {text.language}
               </div>

               <p className="text-[13.5px] font-body italic text-ink2 line-clamp-2 leading-relaxed mb-4">
                 A foundational text from the {text.era} for students of {text.language}, exploring themes of {text.tags?.[0]?.toLowerCase() || 'history'} and {text.tags?.[1]?.toLowerCase() || 'literature'}.
               </p>
             </div>

             <div className="flex items-end justify-between border-t border-bdr/40 pt-4 mt-auto">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted">Length</span>
                  <span className="text-xs text-ink3 font-mono">14 Caps · ~2h</span>
                </div>
                <div className="text-[13px] font-bold text-blue font-sans group-hover:translate-x-1 transition-transform">
                  {text.knownCoverage ? `${text.knownCoverage}% read →` : 'Start →'}
                </div>
             </div>
           </motion.div>
        ))}
        {filteredTexts.length === 0 && (
          <div className="col-span-full py-12 text-center text-ink3 font-body italic">
            No texts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
