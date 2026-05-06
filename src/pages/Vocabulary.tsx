import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Settings2, Trash2, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Vocabulary = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [srsIntervals, setSrsIntervals] = useState({
    seenOnce: '1 day',
    familiar: '3 days',
    known: '1 week',
    multiplier: '1.5x'
  });

  const filters = ['All', 'Known', 'Familiar', 'Learning', 'Seen Once'];

  const words = [
    { id: 1, text: "λόγος", lemma: "λόγος", translit: "logos", gloss: "word, reason, account", language: "Greek", status: "Known", lastSeen: "2 days ago", pos: "N-NSM" },
    { id: 2, text: "ἀρχῇ", lemma: "ἀρχή", translit: "arche", gloss: "beginning, origin", language: "Greek", status: "Familiar", lastSeen: "Today", pos: "N-DSF" },
    { id: 3, text: "בְּרֵאשִׁית", lemma: "רֵאשִׁית", translit: "bereshit", gloss: "in the beginning", language: "Hebrew", status: "Learning", lastSeen: "1 week ago", pos: "N-f" },
    { id: 4, text: "θεὸς", lemma: "θεός", translit: "theos", gloss: "God, deity", language: "Greek", status: "Known", lastSeen: "3 days ago", pos: "N-NSM" },
    { id: 5, text: "ἦν", lemma: "εἰμί", translit: "en", gloss: "was, existed", language: "Greek", status: "Familiar", lastSeen: "Today", pos: "V-IAI-3S" },
    { id: 6, text: "אֱלֹהִים", lemma: "אֱלֹהִים", translit: "elohim", gloss: "God, god", language: "Hebrew", status: "Seen Once", lastSeen: "1 day ago", pos: "N-mp" }
  ];

  const filteredWords = words.filter(w => {
    const matchesFilter = activeFilter === 'All' || w.status === activeFilter;
    const matchesSearch = w.text.includes(searchQuery) || w.lemma.includes(searchQuery) || w.gloss.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Known': return "bg-bluexl text-blue border-blue/20";
      case 'Familiar': return "bg-jadexl text-jade border-jade/20";
      case 'Learning': return "bg-amberxl text-amber border-amber/20";
      case 'Seen Once': return "bg-parch3 text-ink3 border-bdr";
      default: return "bg-parch text-ink3 border-bdr";
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">Lexicon</h2>
          <p className="font-body text-[15px] italic text-ink2">
            Your personal collection of {words.length} classical forms and definitions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-full bg-parch border border-bdr hover:bg-parch2 transition-colors text-ink2"
            title="Spaced Repetition Configuration"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button className="btn-hero px-6 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all">
            Start Review
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 mb-10">
        <div className="flex items-center justify-between">
           <div className="flex flex-wrap gap-2">
             {filters.map(filter => (
               <button
                 key={filter}
                 onClick={() => setActiveFilter(filter)}
                 className={cn(
                   "px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase transition-all duration-150 border",
                   activeFilter === filter
                     ? "bg-blue text-white shadow-sm border-blue"
                     : "bg-parch text-ink3 border-bdr hover:bg-parch2"
                 )}
               >
                 {filter}
               </button>
             ))}
           </div>
           
           <div className="relative w-full max-w-[240px] hidden md:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
             <input 
               type="text" 
               placeholder="Search lexicon..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-1.5 bg-white border border-bdr rounded-full text-[13px] font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
             />
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20">
        {filteredWords.length > 0 ? (
          filteredWords.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:border-blue/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-32 flex-shrink-0">
                  <div className={cn("text-[26px] font-serif text-ink leading-tight", word.language === 'Hebrew' ? "font-hebrew" : "")} dir={word.language === 'Hebrew' ? "rtl" : "ltr"}>
                    {word.text}
                  </div>
                  <div className="font-mono text-[11px] italic text-muted mt-0.5">{word.translit}</div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-serif text-[15px] font-medium text-blue" dir={word.language === 'Hebrew' ? "rtl" : "ltr"}>{word.lemma}</span>
                     <span className="font-mono text-[9px] text-muted border border-bdr/50 bg-parch px-1 rounded uppercase">{word.pos}</span>
                  </div>
                  <div className="font-body text-[13.5px] italic text-ink2">
                    {word.gloss}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-bdr/50 md:border-none">
                <div className="flex flex-col items-start md:items-end w-32">
                   <div className={cn("pill font-mono tracking-wider", getStatusClass(word.status))}>
                     {word.status}
                   </div>
                   <div className="text-[10px] text-muted font-sans mt-2">
                     Last seen {word.lastSeen}
                   </div>
                </div>
                
                <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded text-muted hover:text-ink hover:bg-parch3 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded text-ruby/50 hover:text-ruby hover:bg-rubyxl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="text-[40px] text-muted mb-4 font-serif">❧</div>
             <h3 className="font-serif text-lg text-ink mb-1">No words found</h3>
             <p className="font-body text-[14px] italic text-ink3">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-[#1A1410]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FEFAF4] w-full max-w-md rounded-[16px] shadow-[0_20px_40px_-20px_rgba(26,20,16,0.15)] border border-bdr overflow-hidden"
              >
                <div className="p-5 border-b border-bdr flex items-center justify-between bg-parch">
                  <h3 className="font-serif text-[19px] text-ink font-medium">Spaced Repetition Configuration</h3>
                  <button onClick={() => setShowSettings(false)} className="text-muted hover:text-ink transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <p className="font-body text-[13.5px] leading-relaxed text-ink2 mb-6">
                    Adjust the base intervals for vocabulary reviews. These determine how long a word waits before resurfacing based on its current mastery level.
                  </p>

                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <label className="eyebrow block mb-2">"Seen Once" Interval</label>
                      <input 
                        type="text" 
                        value={srsIntervals.seenOnce}
                        onChange={(e) => setSrsIntervals({...srsIntervals, seenOnce: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2">"Familiar" Interval</label>
                      <input 
                        type="text" 
                        value={srsIntervals.familiar}
                        onChange={(e) => setSrsIntervals({...srsIntervals, familiar: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2">"Known" Interval</label>
                      <input 
                        type="text" 
                        value={srsIntervals.known}
                        onChange={(e) => setSrsIntervals({...srsIntervals, known: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="eyebrow block mb-2">Ease Multiplier (Hard/Good/Easy)</label>
                      <input 
                        type="text" 
                        value={srsIntervals.multiplier}
                        onChange={(e) => setSrsIntervals({...srsIntervals, multiplier: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-bdr rounded-[8px] text-[13px] font-sans focus:outline-none focus:border-blue"
                      />
                      <p className="font-mono text-[9px] text-muted mt-2">Default: 1.5x scaling on successful review.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 font-sans font-medium text-[13.5px] text-ink3 hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="btn-primary px-5 py-2 font-medium"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
