import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, GraduationCap, Star, Trash2, ExternalLink, Brain, CheckCircle2, Eye, Settings2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Vocabulary = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [srsIntervals, setSrsIntervals] = useState({
    seenOnce: '1 day',
    familiar: '3 days',
    known: '1 week'
  });
  const filters = ['All', 'Known', 'Familiar', 'Seen Once'];

  const words = [
    { id: 1, text: "λόγος", lemma: "λόγος", gloss: "word, reason, account", language: "Greek", status: "Known", lastSeen: "2 days ago", frequency: "High" },
    { id: 2, text: "ἀρχῇ", lemma: "ἀρχή", gloss: "beginning, origin", language: "Greek", status: "Familiar", lastSeen: "Today", frequency: "Medium" },
    { id: 3, text: "בְּרֵאשִׁית", lemma: "רֵאשִׁית", gloss: "in the beginning", language: "Hebrew", status: "Seen Once", lastSeen: "1 week ago", frequency: "High" },
    { id: 4, text: "θεὸς", lemma: "θεός", gloss: "God, deity", language: "Greek", status: "Known", lastSeen: "3 days ago", frequency: "High" },
    { id: 5, text: "ἦν", lemma: "εἰμί", gloss: "was, existed", language: "Greek", status: "Familiar", lastSeen: "Today", frequency: "High" },
    { id: 6, text: "bꜣ", lemma: "bꜣ", gloss: "soul, spirit", language: "Egyptian", status: "Seen Once", lastSeen: "1 day ago", frequency: "Medium" }
  ];

  const filteredWords = activeFilter === 'All' ? words : words.filter(w => w.status === activeFilter);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Known': return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" };
      case 'Familiar': return { icon: Brain, color: "text-gold-600", bg: "bg-gold-500/10" };
      case 'Seen Once': return { icon: Eye, color: "text-blue-600", bg: "bg-blue-500/10" };
      default: return { icon: Star, color: "text-obsidian-900/40", bg: "bg-black/5" };
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight mb-2">Your Lexicon</h2>
          <p className="text-obsidian-900/60 dark:text-vellum-100/60 font-medium">
            Manage your personal collection of ancient words.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-gold-500/30 transition-all text-obsidian-900/60 dark:text-vellum-100/60"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-900/40 dark:text-vellum-100/40" />
            <input 
              type="text" 
              placeholder="Search lexicon..." 
              className="pl-12 pr-6 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all w-64"
            />
          </div>
          <button className="px-6 py-3 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform">
            Start Review
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300",
              activeFilter === filter
                ? "bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 shadow-lg"
                : "bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredWords.length > 0 ? (
          filteredWords.map((word, i) => {
            const statusConfig = getStatusConfig(word.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-gold-500/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "text-3xl font-serif font-bold w-32",
                    word.language === 'Hebrew' ? "font-hebrew" : "font-greek"
                  )}>
                    {word.text}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-widest mb-1">Lemma</span>
                    <span className="text-sm font-bold">{word.lemma}</span>
                  </div>
                  <div className="flex flex-col max-w-xs">
                    <span className="text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-widest mb-1">Gloss</span>
                    <span className="text-sm font-medium italic text-obsidian-900/60 dark:text-vellum-100/60">"{word.gloss}"</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto">
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-widest mb-1">Mastery</span>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full flex items-center gap-2",
                      statusConfig.bg
                    )}>
                      <StatusIcon className={cn("w-3 h-3", statusConfig.color)} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", statusConfig.color)}>
                        {word.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <ExternalLink className="w-5 h-5 text-obsidian-900/40 dark:text-vellum-100/40" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-obsidian-900/20 dark:text-vellum-100/20" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">No words found.</h3>
            <p className="text-obsidian-900/40 dark:text-vellum-100/40 max-w-xs">
              Try adjusting your filters or read more texts to discover new words.
            </p>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-vellum-50 dark:bg-obsidian-900 rounded-3xl p-8 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-serif font-bold mb-2">SRS Settings</h3>
            <p className="text-sm font-medium text-obsidian-900/60 dark:text-vellum-100/60 mb-8">
              Customize the spaced repetition intervals for your vocabulary mastery levels.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40 mb-2 block">Seen Once Interval</label>
                <select 
                  value={srsIntervals.seenOnce}
                  onChange={(e) => setSrsIntervals(prev => ({...prev, seenOnce: e.target.value}))}
                  className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-gold-500 text-obsidian-900 dark:text-vellum-50"
                >
                  <option value="12 hours">12 hours</option>
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40 mb-2 block">Familiar Interval</label>
                <select 
                  value={srsIntervals.familiar}
                  onChange={(e) => setSrsIntervals(prev => ({...prev, familiar: e.target.value}))}
                  className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-gold-500 text-obsidian-900 dark:text-vellum-50"
                >
                  <option value="3 days">3 days</option>
                  <option value="5 days">5 days</option>
                  <option value="1 week">1 week</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40 mb-2 block">Known Interval</label>
                <select 
                  value={srsIntervals.known}
                  onChange={(e) => setSrsIntervals(prev => ({...prev, known: e.target.value}))}
                  className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-gold-500 text-obsidian-900 dark:text-vellum-50"
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
