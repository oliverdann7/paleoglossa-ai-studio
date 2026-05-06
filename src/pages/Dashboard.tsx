import { motion } from 'motion/react';
import { BookOpen, GraduationCap, ArrowRight, Brain, CheckCircle2, Eye, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { texts } from '../data/texts';

const StatCard = ({ icon: Icon, label, value, trend, trendLabel }: any) => (
  <div className="p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl premium-shadow hover:border-gold-500/30 transition-all duration-500 flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 rounded-xl bg-gold-500/10 text-gold-600">
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-widest text-right">
          {trend}
          {trendLabel && <span className="block text-[8px] opacity-70">{trendLabel}</span>}
        </span>
      )}
    </div>
    <div>
      <div className="text-4xl font-serif font-bold mb-2 tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-[0.2em]">{label}</div>
    </div>
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
    const recentTexts = texts.slice(3, 6);

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-serif font-bold tracking-tight mb-2"
        >
          My Competence
        </motion.h2>
        <p className="text-obsidian-900/60 dark:text-vellum-100/60 font-medium">
          Tracking your reading comprehension and vocabulary growth.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard icon={CheckCircle2} label="Known Lemmas" value="1,284" trend="+42" trendLabel="this week" />
        <StatCard icon={GraduationCap} label="Learning" value="315" trend="-12" trendLabel="mastered" />
        <StatCard icon={BookOpen} label="Tokens Read" value="14,092" trend="+840" />
        <StatCard icon={Flag} label="Review Accuracy" value="86%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Today Section */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-serif font-bold tracking-tight">Today</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-gold-500 text-vellum-50 relative overflow-hidden group cursor-pointer" onClick={() => onSelectText(recentTexts[0])}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-4 block">Recommended Reading</span>
                <h4 className="text-2xl font-serif font-bold tracking-tight mb-2 leading-tight">{recentTexts[0].title}</h4>
                <p className="text-sm opacity-90 mb-8">{recentTexts[0].author} • {recentTexts[0].language}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold font-serif">{recentTexts[0].knownCoverage || 64}%</span>
                    <span className="block text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Coverage</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-obsidian-900 border border-black/5 dark:border-white/5 text-vellum-50 dark:bg-white/5 dark:text-vellum-100 flex flex-col justify-between group cursor-pointer relative overflow-hidden">
               <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-4 block">Review Due</span>
                <div className="text-5xl font-serif font-bold mb-2">42</div>
                <div className="text-xs uppercase font-bold tracking-widest opacity-60">Words to Review</div>
               </div>
               <div className="relative z-10 mt-8 flex items-center justify-between text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                 <span>Start Session</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>
        </section>

        {/* Vocabulary Mastery Section */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-serif font-bold tracking-tight">Vocabulary Stats</h3>
          </div>
          <div className="flex flex-col gap-4">
            <MasteryCard 
              icon={CheckCircle2} 
              label="Known" 
              value="1,284" 
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
              label="Learning" 
              value="315" 
              colorClass="text-amber-500" 
              bgClass="bg-amber-500/10" 
            />
            <button className="mt-4 w-full py-4 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              Manage Vocabulary
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
