import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Library = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const filters = ['All', 'Egyptian', 'Sanskrit', 'Greek', 'Koine Greek', 'Hebrew', 'Aramaic', 'Coptic', 'Akkadian', 'Latin', 'Syriac', 'Hittite'];

  const texts = [
    // Greek
    { id: 101, title: "Greek Alphabet & Sounds", author: "Foundations", language: "Greek", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    { id: 102, title: "Basic Greetings & Phrasing", author: "Foundations", language: "Greek", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    { id: 103, title: "Aesop's Fables", author: "Aesop", language: "Greek", level: "A2", era: "6th c. BC", image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=400" },
    { id: 104, title: "Gospel of John", author: "John", language: "Greek", level: "B1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 105, title: "Anabasis", author: "Xenophon", language: "Greek", level: "B2", era: "4th c. BC", image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=400" },
    { id: 106, title: "Iliad", author: "Homer", language: "Greek", level: "C1", era: "8th c. BC", image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=400" },
    { id: 107, title: "The Odyssey", author: "Homer", language: "Greek", level: "C2", era: "8th c. BC", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    
    // Hebrew
    { id: 201, title: "The Aleph-Bet & Vowels", author: "Foundations", language: "Hebrew", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 202, title: "Basic Vocabulary", author: "Foundations", language: "Hebrew", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 203, title: "Book of Ruth", author: "Unknown", language: "Hebrew", level: "A2", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 204, title: "Genesis", author: "Moses (Trad.)", language: "Hebrew", level: "B1", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 205, title: "Psalms", author: "David & Others", language: "Hebrew", level: "B2", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 206, title: "Isaiah", author: "Isaiah", language: "Hebrew", level: "C1", era: "8th c. BC", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 207, title: "Job", author: "Unknown", language: "Hebrew", level: "C2", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },

    // Egyptian
    { id: 301, title: "Uniliteral Signs & Sounds", author: "Foundations", language: "Egyptian", level: "A1", era: "Old Kingdom", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 302, title: "Basic Offering Formula", author: "Tradition", language: "Egyptian", level: "A2", era: "Old Kingdom", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 303, title: "Shipwrecked Sailor", author: "Unknown", language: "Egyptian", level: "B1", era: "Middle Kingdom", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 304, title: "The Tale of Sinuhe", author: "Unknown", language: "Egyptian", level: "B2", era: "19th c. BC", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 305, title: "Great Hymn to the Aten", author: "Akhenaten", language: "Egyptian", level: "C1", era: "14th c. BC", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 306, title: "Pyramid Texts", author: "Unknown", language: "Egyptian", level: "C2", era: "24th c. BC", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },

    // Sanskrit
    { id: 401, title: "Devanagari Script & Matras", author: "Foundations", language: "Sanskrit", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 402, title: "Hitopadesha (Selections)", author: "Narayana", language: "Sanskrit", level: "A2", era: "12th c. AD", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 403, title: "Bhagavad Gita", author: "Vyasa", language: "Sanskrit", level: "B1", era: "2nd c. BC", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 404, title: "Ramayana", author: "Valmiki", language: "Sanskrit", level: "B2", era: "5th c. BC", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 405, title: "Upanishads", author: "Vedic Rishis", language: "Sanskrit", level: "C1", era: "8th c. BC", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },
    { id: 406, title: "The Rigveda", author: "Vedic Rishis", language: "Sanskrit", level: "C2", era: "15th c. BC", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" },

    // Latin
    { id: 501, title: "Latin Alphabet & Pronunciation", author: "Foundations", language: "Latin", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
    { id: 502, title: "Vulgate", author: "Jerome", language: "Latin", level: "A2", era: "4th c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 503, title: "Gallic War", author: "Julius Caesar", language: "Latin", level: "B1", era: "1st c. BC", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
    { id: 504, title: "Odes", author: "Horace", language: "Latin", level: "B2", era: "1st c. BC", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" },
    { id: 505, title: "Metamorphoses", author: "Ovid", language: "Latin", level: "C1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" },
    { id: 506, title: "Aeneid", author: "Virgil", language: "Latin", level: "C2", era: "1st c. BC", image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
    // Koine Greek
    { id: 601, title: "Koine Alphabet & Sounds", author: "Foundations", language: "Koine Greek", level: "A1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    { id: 602, title: "Basic Vocabulary", author: "Foundations", language: "Koine Greek", level: "A1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
    { id: 603, title: "Didache", author: "Early Church", language: "Koine Greek", level: "A2", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 604, title: "Gospel of Mark", author: "Mark", language: "Koine Greek", level: "B1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 605, title: "Gospel of John", author: "John", language: "Koine Greek", level: "B2", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 606, title: "Epistles of Paul", author: "Paul", language: "Koine Greek", level: "C1", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },
    { id: 607, title: "Revelation", author: "John of Patmos", language: "Koine Greek", level: "C2", era: "1st c. AD", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400" },

    // Aramaic
    { id: 701, title: "Aramaic Alphabet", author: "Foundations", language: "Aramaic", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 702, title: "Basic Vocabulary", author: "Foundations", language: "Aramaic", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 703, title: "Elephantine Papyri", author: "Various", language: "Aramaic", level: "A2", era: "5th c. BC", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 704, title: "Book of Daniel", author: "Daniel", language: "Aramaic", level: "B1", era: "2nd c. BC", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 705, title: "Book of Ezra", author: "Ezra", language: "Aramaic", level: "B2", era: "5th c. BC", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 706, title: "Targum Onqelos", author: "Onqelos", language: "Aramaic", level: "C1", era: "2nd c. AD", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
    { id: 707, title: "Genesis Apocryphon", author: "Unknown", language: "Aramaic", level: "C2", era: "1st c. BC", image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },

    // Coptic
    { id: 801, title: "Coptic Alphabet", author: "Foundations", language: "Coptic", level: "A1", era: "Late Antiquity", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 802, title: "Basic Vocabulary", author: "Foundations", language: "Coptic", level: "A1", era: "Late Antiquity", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 803, title: "Sayings of the Desert Fathers", author: "Various", language: "Coptic", level: "A2", era: "4th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 804, title: "Gospel of Thomas", author: "Unknown", language: "Coptic", level: "B1", era: "2nd c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 805, title: "Sahidic New Testament", author: "Various", language: "Coptic", level: "B2", era: "3rd c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 806, title: "Shenoute of Atripe", author: "Shenoute", language: "Coptic", level: "C1", era: "5th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 807, title: "Pistis Sophia", author: "Unknown", language: "Coptic", level: "C2", era: "3rd c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },

    // Akkadian
    { id: 901, title: "Cuneiform Signs", author: "Foundations", language: "Akkadian", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 902, title: "Basic Vocabulary", author: "Foundations", language: "Akkadian", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 903, title: "Amarna Letters", author: "Various", language: "Akkadian", level: "A2", era: "14th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 904, title: "Code of Hammurabi", author: "Hammurabi", language: "Akkadian", level: "B1", era: "18th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 905, title: "Enuma Elish", author: "Unknown", language: "Akkadian", level: "B2", era: "12th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 906, title: "Epic of Gilgamesh", author: "Sin-leqi-unninni", language: "Akkadian", level: "C1", era: "13th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 907, title: "Atra-Hasis", author: "Unknown", language: "Akkadian", level: "C2", era: "18th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },

    // Syriac
    { id: 1001, title: "Estrangelo Alphabet", author: "Foundations", language: "Syriac", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1002, title: "Basic Vocabulary", author: "Foundations", language: "Syriac", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1003, title: "Peshitta Gospels", author: "Various", language: "Syriac", level: "A2", era: "5th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1004, title: "Odes of Solomon", author: "Unknown", language: "Syriac", level: "B1", era: "2nd c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1005, title: "Hymns of Ephrem", author: "Ephrem the Syrian", language: "Syriac", level: "B2", era: "4th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1006, title: "Chronicle of Edessa", author: "Unknown", language: "Syriac", level: "C1", era: "6th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
    { id: 1007, title: "Isaac of Nineveh", author: "Isaac of Nineveh", language: "Syriac", level: "C2", era: "7th c. AD", image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },

    // Hittite
    { id: 1101, title: "Cuneiform Basics", author: "Foundations", language: "Hittite", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1102, title: "Basic Vocabulary", author: "Foundations", language: "Hittite", level: "A1", era: "Ancient", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1103, title: "Ritual of Tunnawiya", author: "Tunnawiya", language: "Hittite", level: "A2", era: "14th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1104, title: "Illuyanka Myth", author: "Unknown", language: "Hittite", level: "B1", era: "15th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1105, title: "Song of Kumarbi", author: "Unknown", language: "Hittite", level: "B2", era: "14th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1106, title: "Annals of Mursili II", author: "Mursili II", language: "Hittite", level: "C1", era: "14th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
    { id: 1107, title: "Apology of Hattusili III", author: "Hattusili III", language: "Hittite", level: "C2", era: "13th c. BC", image: "https://images.unsplash.com/photo-1563216839-44439c09bf8f?auto=format&fit=crop&q=80&w=400" },
  ];

  const filteredTexts = texts.filter(t => {
    const matchesFilter = activeFilter === 'All' || t.language === activeFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
        })}
      </div>
    </div>
  );
};
