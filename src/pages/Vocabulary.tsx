import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, GraduationCap, Clock, TrendingUp, Star, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Vocabulary = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Learning', 'Mastered', 'New'];

  const words = [
    { id: 1, text: "λόγος", lemma: "λόγος", gloss: "word, reason, account", language: "Greek", status: "Mastered", lastSeen: "2 days ago", frequency: "High" },
    { id: 2, text: "ἀρχῇ", lemma: "ἀρχή", gloss: "beginning, origin", language: "Greek", status: "Learning", lastSeen: "Today", frequency: "Medium" },
    { id: 3, text: "בְּרֵאשִׁית", lemma: "רֵאשִׁית", gloss: "in the beginning", language: "Hebrew", status: "New", lastSeen: "1 week ago", frequency: "High" },
    { id: 4, text: "θεὸς", lemma: "θεός", gloss: "God, deity", language: "Greek", status: "Mastered", lastSeen: "3 days ago", frequency: "High" },
    { id: 5, text: "ἦν", lemma: "εἰμί", gloss: "was, existed", language: "Greek", status: "Learning", lastSeen: "Today", frequency: "High" },
  ];

  const filteredWords = activeFilter === 'All' ? words : words.filter(w => w.status === activeFilter);

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
          filteredWords.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-gold-500/30 transition-all duration-300 flex items-center justify-between"
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

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-widest mb-1">Status</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    word.status === 'Mastered' ? "bg-green-500/10 text-green-600" : 
                    word.status === 'Learning' ? "bg-gold-500/10 text-gold-600" : 
                    "bg-blue-500/10 text-blue-600"
                  )}>
                    {word.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <ExternalLink className="w-4 h-4 text-obsidian-900/40 dark:text-vellum-100/40" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-obsidian-900/20 dark:text-vellum-100/20" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">Your lexicon is a blank slate.</h3>
            <p className="text-obsidian-900/40 dark:text-vellum-100/40 max-w-xs">
              Start reading texts and saving words to build your personal vocabulary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
