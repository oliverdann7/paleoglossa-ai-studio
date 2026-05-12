import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage';
import { getLanguageIcon } from '../lib/constants/languages';

export function LanguageSwitcher() {
  const { activeLanguageId, setActiveLanguageId, currentLanguage, availableLanguages } = useActiveLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const icon = currentLanguage ? getLanguageIcon(activeLanguageId) : '🌐';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-bdr/60 rounded-lg hover:border-blue/30 hover:shadow-sm transition-all text-[13px] font-sans font-medium text-ink"
      >
        <span className="text-[16px]">{icon}</span>
        <span className="hidden sm:inline">{currentLanguage?.shortName || currentLanguage?.name || 'Select Language'}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white border border-bdr rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-1.5">
              {availableLanguages.map(lang => {
                const isActive = lang.id === activeLanguageId;
                return (
                  <button
                    key={lang.id}
                    onClick={() => { setActiveLanguageId(lang.id); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-[13px]",
                      isActive
                        ? "bg-blue/10 text-blue font-bold"
                        : "text-ink2 hover:bg-parch2 font-medium"
                    )}
                  >
                    <span className="text-[18px] w-7 text-center">{getLanguageIcon(lang.id)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{lang.name}</div>
                      <div className={cn(
                        "text-[10px] uppercase tracking-wider",
                        isActive ? "text-blue/70" : "text-muted"
                      )}>
                        {lang.corpusStatus === 'available' ? 'Available' : lang.corpusStatus === 'partial' ? 'In Progress' : 'Sample'}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
