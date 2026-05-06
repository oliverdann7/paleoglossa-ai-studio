import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, ArrowRight, Brain, CheckCircle2, Eye, Flag, Flame, Target, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { texts } from '../data/texts';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const StatCard = ({ label, value, colorType }: { label: string, value: string | number, colorType?: 'gold' | 'jade' | 'amber' | 'blue' | 'ruby' }) => (
  <div className="card px-6 py-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
    <div className="text-[32px] font-serif font-light mb-1 tracking-tight text-ink">
      {value}
    </div>
    <div className="eyebrow truncate">{label}</div>
  </div>
);

const VocabChip = ({ form, translit, gloss, status, language }: { form: string, translit: string, gloss: string, status: 'known' | 'learning' | 'familiar' | 'new', language: string }) => {
  const isHebrew = language.includes('Hebrew') || language.includes('Aramaic') || language.includes('Syriac');
  
  let statusBadge = null;
  if (status === 'known') statusBadge = <span className="pill bg-jadexl text-jade border-jade/20">Known</span>;
  if (status === 'familiar') statusBadge = <span className="pill bg-jadexl text-jade border-jade/20">Familiar</span>;
  if (status === 'learning') statusBadge = <span className="pill bg-amberxl text-amber border-amber/20">Learning</span>;
  if (status === 'new') statusBadge = <span className="pill bg-bluexl text-blue border-blue/20">New</span>;

  return (
    <div className="bg-parch border border-bdr rounded-xl p-3 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={cn("text-xl tracking-tight", isHebrew ? "font-hebrew" : "font-serif text-blue")}>
          {form}
        </div>
        {statusBadge}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[11px] text-muted italic">{translit}</span>
        <span className="font-body text-[13.5px] text-ink2 truncate">{gloss}</span>
      </div>
    </div>
  );
};

export const Dashboard = ({ onSelectText, onNavigate }: { onSelectText: (text: any) => void, onNavigate?: (path: string) => void }) => {
  const recentTexts = texts.slice(3, 6);
  const hour = new Date().getHours();
  const [dueCount, setDueCount] = useState<number | string>("...");
  const [learningCount, setLearningCount] = useState<number | string>("...");
  const [knownCount, setKnownCount] = useState<number | string>("...");
  
  useEffect(() => {
    if (!auth.currentUser) {
      setDueCount(142);
      setLearningCount(315);
      setKnownCount("1,284");
      return;
    }
    
    // Fetch counts realtime
    const vocabQuery = query(collection(db, 'vocabulary'), where('userId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(vocabQuery, (snap) => {
      let due = 0;
      let learning = 0;
      let known = 0;
      const now = new Date();
      snap.forEach(d => {
        const data = d.data();
        if (data.status === 'Learning') learning++;
        if (data.status === 'Known' || data.status === 'Familiar') known++;
        if (data.nextReview && data.nextReview.toDate() <= now) due++;
      });
      setDueCount(due);
      setLearningCount(learning);
      setKnownCount(known);
    });
    return () => unsub();
  }, []);

  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[28px] font-serif font-light tracking-tight text-ink"
          >
            {greeting}, Scholar.
          </motion.h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="card border-amber/20 bg-amberxl p-3 flex items-center gap-3">
             <div className="flex items-center gap-2">
               <span className="text-xl">🔥</span>
               <div className="flex flex-col">
                 <span className="font-serif text-2xl leading-none text-amber font-medium">12</span>
                 <span className="eyebrow text-amber/70 mt-1">Day Streak</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3 card p-3 border-bdr bg-parch">
            <div className="relative w-[42px] h-[42px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="18" fill="none" className="stroke-parch2" strokeWidth="4" />
                <circle cx="21" cy="21" r="18" fill="none" className="stroke-gold" strokeWidth="4" strokeDasharray="113" strokeDashoffset="45" strokeLinecap="round" />
              </svg>
              <span className="font-mono text-xs font-medium text-ink relative z-10">24<span className="text-[9px] text-muted">m</span></span>
            </div>
            <div className="flex flex-col">
              <span className="eyebrow">Daily Goal</span>
              <span className="text-[11px] font-medium text-ink2">30 mins</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="rounded-[18px] p-8 relative overflow-hidden group shadow-lg flex flex-col justify-between min-h-[220px]"
             style={{ background: 'linear-gradient(140deg, #1E3D6E 0%, #0F2040 100%)' }}>
          <div className="relative z-10">
            <span className="eyebrow text-bluexl opacity-70 mb-2 block">Review queue</span>
            <div className="text-[48px] font-serif font-light text-white leading-none mb-3">{dueCount}</div>
            <p className="text-sm text-bluexl opacity-80 font-body">{dueCount} due</p>
          </div>
          <div className="relative z-10 mt-6 md:mt-0">
             <button onClick={() => onNavigate && onNavigate('review')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2 px-5 rounded-xl font-bold font-sans text-sm transition-all focus:outline-none">
               Start review →
             </button>
          </div>
        </div>

        <div className="card p-8 group cursor-pointer flex flex-col justify-between min-h-[220px]" onClick={() => onSelectText(recentTexts[0])}>
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="eyebrow">Continue reading</span>
              <span className="pill cefr-b" style={{fontSize: '10px', padding: '2px 6px'}}>B1</span>
            </div>
            <h4 className="text-[26px] font-serif font-medium text-ink leading-tight mb-2">{recentTexts[0].title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-body italic text-ink3">{recentTexts[0].language}</span>
              <span className="text-[10px] text-muted font-mono">•</span>
              <span className="text-xs font-mono text-muted">Book I, Ch 1</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-1 w-full bg-parch3 rounded-full overflow-hidden mb-2">
              <motion.div initial={{ width: 0 }} animate={{ width: '38%' }} className="h-full bg-blue" />
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-blue">
              <span>Continue →</span>
              <span>38% read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Known" value={knownCount} />
        <StatCard label="Learning" value={learningCount} />
        <StatCard label="Read This Week" value="4,092" />
        <StatCard label="Accuracy" value="86%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="col-span-1 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xl font-serif text-ink font-medium">Recent Vocabulary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <VocabChip form="λόγος" translit="logos" gloss="word, reason, account" status="learning" language="Ancient Greek" />
            <VocabChip form="θεὀς" translit="theos" gloss="god, deity" status="known" language="Ancient Greek" />
            <VocabChip form="ἀρχή" translit="archē" gloss="beginning, origin, ruler" status="familiar" language="Ancient Greek" />
            <VocabChip form="בָּרָא" translit="bara" gloss="to create, shape" status="new" language="Biblical Hebrew" />
            <VocabChip form="אֱלֹהִים" translit="elohim" gloss="God, gods" status="known" language="Biblical Hebrew" />
            <VocabChip form="אֶרֶץ" translit="erets" gloss="earth, land" status="learning" language="Biblical Hebrew" />
          </div>
        </section>

        <section className="col-span-1">
          <div className="mb-4">
            <h3 className="text-xl font-serif text-ink font-medium">Active Path</h3>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🏛️</span>
              <div>
                <h4 className="font-serif font-medium text-ink text-[17px]">Attic Greek I</h4>
                <p className="text-xs font-body text-ink3 mt-0.5">Focus: Core vocabulary & present active verbs</p>
              </div>
            </div>
            <div className="mt-2">
               <div className="h-1 w-full bg-parch3 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-gold w-[40%]" />
               </div>
               <span className="font-mono text-xs text-muted">Step 4 / 10</span>
            </div>
             <button className="mt-5 w-full btn-secondary py-2 text-sm text-ink2 border-bdr">
               Continue Path
             </button>
          </div>
        </section>
      </div>
    </div>
  );
};
