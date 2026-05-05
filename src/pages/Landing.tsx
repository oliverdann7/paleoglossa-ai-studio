import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export const Landing = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="relative min-h-screen bg-vellum-50 dark:bg-obsidian-950 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 rounded-sm flex items-center justify-center">
            <span className="text-vellum-50 font-serif font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight">Paleoglossa</h1>
        </div>
        <button 
          onClick={onEnter}
          className="text-sm font-medium hover:text-gold-600 transition-colors"
        >
          Sign In
        </button>
      </header>

      <main className="editorial-container pt-48 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-10 border border-gold-500/20">
                <Sparkles className="w-3 h-3" />
                The Future of Philology
              </span>
              <h2 className="text-7xl md:text-9xl font-serif font-bold leading-[0.95] tracking-tighter mb-10">
                Read the <br />
                ancient world. <br />
                <span className="text-gold-500 italic">Word by word.</span>
              </h2>
              <p className="text-xl text-obsidian-900/60 dark:text-vellum-100/60 max-w-xl leading-relaxed mb-14 font-medium">
                Paleoglossa is an editorial-grade platform for studying archaic languages through real texts. 
                Precision morphology, immersive typography, and scholarly clarity.
              </p>
              
              <div className="flex flex-wrap gap-8">
                <button 
                  onClick={onEnter}
                  className="group relative px-10 py-5 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-full font-bold overflow-hidden transition-all duration-500 hover:scale-105 premium-shadow"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Enter Paleoglossa
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-10 py-5 border border-black/10 dark:border-white/10 rounded-full font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95">
                  View Library
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] rounded-[32px] overflow-hidden premium-shadow border border-black/5 dark:border-white/5"
            >
              <img 
                src="https://images.unsplash.com/photo-1544640808-32ca72ac7f37?auto=format&fit=crop&q=80&w=1000" 
                alt="Ancient Manuscript" 
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.6] hover:grayscale-0 transition-all duration-1000 ease-in-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/20 to-transparent flex flex-col justify-end p-10">
                <div className="flex items-center gap-3 text-gold-400 mb-3">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Currently Reading</span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-vellum-50 mb-1">Homer's Odyssey</h3>
                <p className="text-vellum-50/60 text-sm italic font-serif">Book I: The Council of the Gods</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-32 flex flex-col items-center gap-4 text-obsidian-900/20 dark:text-vellum-100/20">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-gold-500/50 to-transparent"
          />
        </div>

        <section className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { icon: BookOpen, title: "Immersive Reading", desc: "Typography optimized for ancient scripts and deep focus." },
            { icon: GraduationCap, title: "Morphology Aware", desc: "Instant parsing, lemma analysis, and root tracking for every word." },
            { icon: Sparkles, title: "Intelligent Review", desc: "Spaced repetition system designed for lexical mastery." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
            >
              <feature.icon className="w-8 h-8 text-gold-500 mb-6" strokeWidth={1.5} />
              <h4 className="text-xl font-serif font-bold mb-4">{feature.title}</h4>
              <p className="text-obsidian-900/60 dark:text-vellum-100/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="editorial-container py-12 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs font-bold tracking-widest uppercase text-obsidian-900/40 dark:text-vellum-100/40">
        <span>© 2026 Paleoglossa Philology</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gold-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-gold-500 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};
