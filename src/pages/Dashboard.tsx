import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Clock, TrendingUp, ArrowRight, Brain, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl premium-shadow group hover:border-gold-500/30 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 rounded-xl bg-gold-500/10 text-gold-600 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
          {trend}
        </span>
      )}
    </div>
    <div className="text-4xl font-serif font-bold mb-2 tracking-tight">{value}</div>
    <div className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-[0.2em]">{label}</div>
  </div>
);

const MasteryCard = ({ icon: Icon, label, value, colorClass, bgClass }: any) => (
  <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:border-black/10 dark:hover:border-white/10 transition-colors flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", bgClass)}>
        <Icon className={cn("w-5 h-5", colorClass)} strokeWidth={2} />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-obsidian-900/60 dark:text-vellum-100/60">{label}</span>
    </div>
    <span className="text-2xl font-serif font-bold">{value}</span>
  </div>
);

export const Dashboard = ({ onSelectText }: { onSelectText: (text: any) => void }) => {
    const recentTexts = [
      { id: 7, title: "The Tale of Sinuhe", author: "Unknown", language: "Egyptian", progress: 32, image: "https://images.unsplash.com/photo-1596700889247-49f3900ca5ae?auto=format&fit=crop&q=80&w=400" },
      { id: 1, title: "The Odyssey", author: "Homer", language: "Ancient Greek", progress: 12, image: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=400" },
      { id: 8, title: "The Rigveda", author: "Vedic Rishis", language: "Sanskrit", progress: 5, image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=400" }
    ];

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-serif font-bold tracking-tight mb-2"
        >
          Good morning, Scholar.
        </motion.h2>
        <p className="text-obsidian-900/60 dark:text-vellum-100/60 font-medium">
          You have <span className="text-gold-600">42 words</span> to review today.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard icon={TrendingUp} label="Study Streak" value="14 Days" trend="+2" />
        <StatCard icon={GraduationCap} label="Words Tracked" value="1,284" trend="+12" />
        <StatCard icon={Clock} label="Hours Studied" value="86.5" trend="+4.2" />
        <StatCard icon={BookOpen} label="Texts Read" value="12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Recent Texts Section */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-serif font-bold tracking-tight">Recent Texts</h3>
            <button className="text-sm font-bold text-gold-600 hover:text-gold-500 transition-colors uppercase tracking-widest flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentTexts.slice(0, 2).map((text, i) => (
              <motion.div
                key={text.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSelectText(text)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-lg border border-black/5 dark:border-white/5">
                  <img 
                    src={text.image} 
                    alt={text.title} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <button className="w-full py-3 bg-vellum-50 text-obsidian-950 rounded-lg font-bold text-sm shadow-xl">
                      Resume Reading
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold text-vellum-50 uppercase tracking-widest">
                    {text.progress}%
                  </div>
                </div>
                <h4 className="text-lg font-serif font-bold mb-1 group-hover:text-gold-600 transition-colors">{text.title}</h4>
                <p className="text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-widest">{text.language} • {text.author}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vocabulary Mastery Section */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-serif font-bold tracking-tight">Vocabulary Mastery</h3>
          </div>
          <div className="flex flex-col gap-4">
            <MasteryCard 
              icon={CheckCircle2} 
              label="Known" 
              value="843" 
              colorClass="text-green-500" 
              bgClass="bg-green-500/10" 
            />
            <MasteryCard 
              icon={Brain} 
              label="Familiar" 
              value="212" 
              colorClass="text-gold-500" 
              bgClass="bg-gold-500/10" 
            />
            <MasteryCard 
              icon={Eye} 
              label="Seen Once" 
              value="229" 
              colorClass="text-blue-500" 
              bgClass="bg-blue-500/10" 
            />
            <button className="mt-4 w-full py-4 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              Review Vocabulary
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
