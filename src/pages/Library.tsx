import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { texts } from '../data/texts';

export const Library = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const filters = ['All', 'Egyptian', 'Sanskrit', 'Greek', 'Koine Greek', 'Hebrew', 'Aramaic', 'Coptic', 'Akkadian', 'Latin', 'Syriac', 'Hittite'];

  const allTags = Array.from(new Set(texts.flatMap(t => t.tags || []))).sort();

  const filteredTexts = texts.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.language === activeFilter;
    const matchesTag = !activeTagFilter || (t.tags && t.tags.includes(activeTagFilter));
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesTag && matchesSearch;
  });

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-2">The Library</h2>
          <p className="text-obsidian-900/60 dark:text-vellum-100/60 font-medium">
            Explore the foundational texts of human civilization.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-900/40 dark:text-vellum-100/40" />
            <input 
              type="text" 
              placeholder="Search texts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all w-64"
            />
          </div>
          <button className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 mb-12">
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                activeFilter === filter
                  ? "bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 shadow-lg"
                  : "bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        
        {allTags.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap pb-2">
            <span className="py-1.5 pr-2 text-xs font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40">Tags:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                className={cn(
                  "px-3 py-1 bg-black/5 dark:bg-white/5 rounded text-[10px] font-bold uppercase tracking-widest border transition-colors",
                  activeTagFilter === tag 
                    ? "border-gold-600/50 text-gold-600 bg-gold-500/10" 
                    : "border-transparent hover:border-black/10 dark:hover:border-white/10 text-obsidian-900/60 dark:text-vellum-100/60"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-24">
        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
          const textsInLevel = filteredTexts.filter(t => t.level === level);
          if (textsInLevel.length === 0) return null;
          
          return (
            <div key={level}>
              <h3 className="text-2xl font-bold font-serif mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-gold-500/10 text-gold-600 flex items-center justify-center text-sm font-sans tracking-widest">{level}</span>
                {level === 'A1' ? 'Foundations & Alphabet' : 
                 level === 'A2' ? 'Beginner' : 
                 level === 'B1' ? 'Intermediate' : 
                 level === 'B2' ? 'Upper Intermediate' : 
                 level === 'C1' ? 'Advanced' : 'Mastery'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {textsInLevel.map((text, i) => (
                  <motion.div
                    key={text.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelectText(text)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-xl border border-black/5 dark:border-white/5">
                      <img 
                        src={text.image} 
                        alt={text.title} 
                        className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-vellum-50/60 uppercase tracking-widest mb-1">Level</span>
                            <span className="text-xs font-bold text-vellum-50">{text.level}</span>
                          </div>
                          <div className="w-px h-8 bg-white/20" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-vellum-50/60 uppercase tracking-widest mb-1">Era</span>
                            <span className="text-xs font-bold text-vellum-50">{text.era}</span>
                          </div>
                        </div>
                        <button className="w-full py-4 bg-gold-500 text-vellum-50 rounded-xl font-bold text-sm shadow-2xl hover:bg-gold-600 transition-colors">
                          Open Text
                        </button>
                      </div>
                      <div className="absolute top-6 left-6 flex flex-wrap gap-2 pr-6">
                        <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-vellum-50 uppercase tracking-widest border border-white/10">
                          {text.language}
                        </span>
                        {text.tags && text.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-bold text-vellum-50/80 uppercase tracking-widest border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-2xl font-serif font-bold mb-1 group-hover:text-gold-600 transition-colors">{text.title}</h4>
                        <p className="text-sm font-medium text-obsidian-900/40 dark:text-vellum-100/40">{text.author}</p>
                      </div>
                      <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <Star className="w-5 h-5 text-obsidian-900/20 dark:text-vellum-100/20" />
                      </button>
                    </div>

                    {text.knownCoverage !== undefined && (
                      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-900/60 dark:text-vellum-100/60">Readability</span>
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400">{text.knownCoverage}% Known</span>
                        </div>
                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${text.knownCoverage}%` }}></div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40">New Words</span>
                            <span className="text-sm font-bold">{text.unknownLemmas}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40">Learning</span>
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{text.learningWords}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
