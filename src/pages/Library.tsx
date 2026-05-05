import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Library = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Egyptian', 'Sanskrit', 'Greek', 'Hebrew', 'Latin', 'Syriac', 'Hittite'];

  const texts = [
    { id: 1, title: "The Odyssey", author: "Homer", language: "Greek", difficulty: "Advanced", era: "8th c. BC", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    { id: 2, title: "Genesis", author: "Moses", language: "Hebrew", difficulty: "Intermediate", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 3, title: "Aeneid", author: "Virgil", language: "Latin", difficulty: "Advanced", era: "1st c. BC", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
    { id: 4, title: "Gospel of John", author: "John", language: "Greek", difficulty: "Beginner", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 5, title: "Iliad", author: "Homer", language: "Greek", difficulty: "Advanced", era: "8th c. BC", image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=400" },
    { id: 6, title: "Odes", author: "Horace", language: "Latin", difficulty: "Intermediate", era: "1st c. BC", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" },
    { id: 7, title: "The Tale of Sinuhe", author: "Unknown (Middle Kingdom)", language: "Egyptian", difficulty: "Intermediate", era: "19th c. BC", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 8, title: "The Rigveda", author: "Vedic Rishis", language: "Sanskrit", difficulty: "Advanced", era: "15th c. BC", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 9, title: "Annals of Mursili II", author: "Mursili II", language: "Hittite", difficulty: "Advanced", era: "14th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" }
  ];

  const filteredTexts = activeFilter === 'All' ? texts : texts.filter(t => t.language === activeFilter);

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
              className="pl-12 pr-6 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all w-64"
            />
          </div>
          <button className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredTexts.map((text, i) => (
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
                    <span className="text-[10px] font-bold text-vellum-50/60 uppercase tracking-widest mb-1">Difficulty</span>
                    <span className="text-xs font-bold text-vellum-50">{text.difficulty}</span>
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
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-vellum-50 uppercase tracking-widest border border-white/10">
                  {text.language}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-serif font-bold mb-1 group-hover:text-gold-600 transition-colors">{text.title}</h4>
                <p className="text-sm font-medium text-obsidian-900/40 dark:text-vellum-100/40">{text.author}</p>
              </div>
              <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Star className="w-5 h-5 text-obsidian-900/20 dark:text-vellum-100/20" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
