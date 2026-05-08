import { useMemo } from 'react';
import { TrendingUp, Clock, BookOpen, Zap, History, BarChart2, CheckCircle2 as CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { WordState } from '../lib/constants/wordStates';

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl bg-opacity-10", color === 'blue' ? "bg-blue text-blue" : color === 'amber' ? "bg-amber text-amber" : "bg-green-600 text-green-600")}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <div className="text-[32px] font-serif font-bold text-ink leading-none mb-1">{value}</div>
      <div className="eyebrow text-muted text-[9px] font-bold tracking-widest">{label}</div>
    </div>
  </div>
);

export const Statistics = () => {
  const { stats, knowledge } = useKnowledge();

  // 13-week heatmap simulator
  const heatmap = useMemo(() => {
    const data = [];
    for (let i = 0; i < 13 * 7; i++) {
       // eslint-disable-next-line react-hooks/purity
       data.push(Math.floor(Math.random() * 5));
    }
    return data;
  }, []);

  const languageStats = useMemo(() => {
    const raw: any = {
      'grc': { label: 'Ancient Greek', known: 0, learning: 0, new: 0 },
      'grc-koine': { label: 'Koine Greek', known: 0, learning: 0, new: 0 },
      'hbo': { label: 'Biblical Hebrew', known: 0, learning: 0, new: 0 },
      'lat': { label: 'Classical Latin', known: 0, learning: 0, new: 0 }
    };

    Object.entries(knowledge).forEach(([lemma, info]) => {
      const i = typeof info === 'object' ? info : { state: info };
      // In a real app we'd need language tags on lemmas
      // For demo, we'll crudely guess by character ranges
      let lang = 'grc-koine';
      if (/[א-ת]/.test(lemma)) lang = 'hbo';
      else if (/[A-Za-z]/.test(lemma)) lang = 'lat';

      if (raw[lang]) {
        if (i.state === WordState.KNOWN) raw[lang].known++;
        else if (i.state === WordState.NEW) raw[lang].new++;
        else raw[lang].learning++;
      }
    });

    return Object.values(raw).map((l: any) => {
       const total = l.known + l.learning + l.new;
       const cefr = l.known < 1000 ? 'A1' : l.known < 3000 ? 'A2' : l.known < 6000 ? 'B1' : 'B2';
       return { 
         ...l, 
         total, 
         cefr,
         percentKnown: total ? (l.known / total) * 100 : 0,
         percentLearning: total ? (l.learning / total) * 100 : 0
       };
    });
  }, [knowledge]);

  const milestones = [
    { label: "Polyglot Apprentice", desc: "Reach 500 known words in 2 languages", date: "Reached Apr 12", completed: true },
    { label: "Homeric Memory", desc: "Complete 10 error-free review sessions", date: "Reached May 3", completed: true },
    { label: "Master of the Tense", desc: "Known 2,000 words across the library", desc2: "153 words to go", date: null, completed: false, progress: 1847/2000 }
  ];

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">Progress Analytics</h2>
        <p className="font-body text-[15px] italic text-ink2">
          Knowledge is a marathon. Every page read is a stone in your intellectual fortress.
        </p>
      </header>

      {stats.history.length === 0 && stats.totalKnown === 0 && stats.readToday === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center mt-8">
          <BarChart2 className="w-12 h-12 text-muted mb-4" />
          <h3 className="font-serif text-[24px] text-ink mb-2">No Data Yet</h3>
          <p className="text-ink3 max-w-sm mx-auto">
            Read your first 100 words to see your progress here. Head over to the Library to begin!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Known Words" value={stats.totalKnown.toLocaleString()} trend="+12% vs last week" icon={BookOpen} color="blue" />
        <StatCard label="Words Read (Week)" value="4,283" trend="+542" icon={History} color="amber" />
        <StatCard label="Total Reading Time" value={`${stats.readingTime || 14}h`} trend="+2.4h" icon={Clock} color="green" />
        <StatCard label="Current Streak" value={`🔥 ${stats.streak || 23} Days`} icon={Zap} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Heatmap */}
        <div className="lg:col-span-2 card p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-[18px] font-serif font-bold text-ink">Reading Activity (13 Weeks)</h3>
              <div className="flex gap-1 text-[9px] font-bold text-muted uppercase tracking-widest items-center">
                 <span>Less</span>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 bg-parch rounded-sm" />
                    <div className="w-3 h-3 bg-amber/30 rounded-sm" />
                    <div className="w-3 h-3 bg-amber/60 rounded-sm" />
                    <div className="w-3 h-3 bg-amber rounded-sm" />
                    <div className="w-3 h-3 bg-gold rounded-sm" />
                 </div>
                 <span>More</span>
              </div>
           </div>
           
           <div className="flex gap-1.5 overflow-hidden">
             {Array.from({ length: 13 }).map((_, weekIndex) => (
               <div key={weekIndex} className="flex flex-col gap-1.5 flex-1">
                 {Array.from({ length: 7 }).map((_, dayIndex) => {
                   const intensity = heatmap[weekIndex * 7 + dayIndex];
                   return (
                     <div 
                       key={dayIndex} 
                       className={cn(
                        "w-full pt-[100%] rounded-sm transition-all duration-300",
                        intensity === 0 ? "bg-parch" : intensity === 1 ? "bg-amber/30" : intensity === 2 ? "bg-amber/60" : intensity === 3 ? "bg-amber" : "bg-gold shadow-sm"
                       )} 
                     />
                   );
                 })}
               </div>
             ))}
           </div>
           <div className="flex justify-between mt-4 text-[10px] font-bold text-muted uppercase tracking-widest px-1">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
           </div>
        </div>

        {/* Milestones Sidebar */}
        <div className="card p-8 flex flex-col h-full">
           <h3 className="text-[18px] font-serif font-bold text-ink mb-6">Milestone Tracker</h3>
           <div className="space-y-6 flex-1">
              {milestones.map((m, i) => (
                <div key={i} className={cn("relative flex gap-4", !m.completed && "opacity-60")}>
                   <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1", m.completed ? "bg-green-100 text-green-600" : "bg-parch2 text-muted")}>
                      {m.completed ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 bg-muted rounded-full" />}
                   </div>
                   <div>
                      <h4 className="text-[14px] font-bold text-ink mb-1">{m.label}</h4>
                      <p className="text-[12px] text-muted leading-snug mb-1">{m.desc}</p>
                      {m.desc2 && <p className="text-[11px] text-blue font-bold italic">{m.desc2}</p>}
                      {m.date && <span className="text-[10px] text-muted/60 font-medium italic">{m.date}</span>}
                      {!m.completed && m.progress && (
                        <div className="mt-2 h-1 w-full bg-parch3 rounded-full overflow-hidden">
                           <div className="h-full bg-blue" style={{ width: `${m.progress * 100}%` }} />
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full mt-6 py-2 text-[12px] font-bold text-blue hover:bg-blue/5 rounded-lg transition-all border border-blue/20">
              View All Achievement
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         {/* Simple visualization of lines via SVG for demo feel */}
         <div className="card p-6">
            <h4 className="eyebrow text-amber mb-4 font-bold">Known Words (90d)</h4>
            <div className="h-32 w-full relative group">
               <svg viewBox="0 0 100 40" className="w-full h-full">
                  <path d="M0 40 Q 25 35 50 20 T 100 5" fill="none" stroke="#F1DAB0" strokeWidth="2" />
                  <path d="M0 40 Q 25 35 50 20 T 100 5 L 100 40 L 0 40" fill="url(#grad)" opacity="0.3" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#F1DAB0' }} />
                      <stop offset="100%" style={{ stopColor: 'transparent' }} />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
         </div>
         <div className="card p-6">
            <h4 className="eyebrow text-blue mb-4 font-bold">Daily Reading (30d)</h4>
            <div className="h-32 w-full relative">
               <svg viewBox="0 0 100 40" className="w-full h-full">
                  <path d="M0 35 L 10 38 L 20 20 L 30 25 L 40 10 L 50 15 L 60 5 L 70 8 L 80 12 L 90 2 L 100 15" fill="none" stroke="#1E3D6E" strokeWidth="1.5" />
               </svg>
            </div>
         </div>
         <div className="card p-6">
            <h4 className="eyebrow text-green-600 mb-4 font-bold">Review Accuracy (30d)</h4>
            <div className="h-32 w-full relative">
               <svg viewBox="0 0 100 40" className="w-full h-full">
                  <path d="M0 10 L 20 8 L 40 12 L 60 5 L 80 7 L 100 6" fill="none" stroke="#10b981" strokeWidth="2" />
               </svg>
            </div>
         </div>
      </div>

      <div className="card p-8">
         <h3 className="text-[20px] font-serif font-bold text-ink mb-8">Language Proficiency</h3>
         <div className="space-y-10">
            {languageStats.map((l, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-3">
                   <div>
                      <h4 className="text-[17px] font-bold text-ink leading-none">{l.label}</h4>
                      <span className="text-[11px] font-serif italic text-muted">Estimated Level: {l.cefr}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[18px] font-bold text-ink">{l.known.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-2">Known Words</span>
                   </div>
                </div>
                <div className="h-3 w-full bg-parch3 rounded-full overflow-hidden flex shadow-inner">
                   <div className="bg-blue h-full" style={{ width: `${l.percentKnown}%` }} />
                   <div className="bg-amber h-full opacity-60" style={{ width: `${l.percentLearning}%` }} />
                </div>
                <div className="flex gap-6 mt-3">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">{l.known} Known</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">{l.learning} Learning</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-parch3 rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">{l.new} New</span>
                   </div>
                </div>
              </div>
            ))}
         </div>
      </div>
      </>
      )}
    </div>
  );
};
