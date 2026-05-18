import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const INTERFACE_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'zh', label: 'Chinese', native: '中文' },
];

const STORAGE_KEY = 'app_lang';

export function InterfaceLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang =
    INTERFACE_LANGUAGES.find((l) => l.code === i18n.language) || INTERFACE_LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-parch3 rounded-lg transition-colors text-left text-[12.5px] font-sans font-medium text-ink3"
      >
        <Globe className="w-4 h-4 text-muted shrink-0" />
        <span className="flex-1">{currentLang.native}</span>
        <ChevronDown
          className={cn('w-3 h-3 text-muted shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-bdr rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-1.5">
              {INTERFACE_LANGUAGES.map((lang) => {
                const isActive = lang.code === i18n.language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-[13px]',
                      isActive
                        ? 'bg-blue/10 text-blue font-bold'
                        : 'text-ink2 hover:bg-parch2 font-medium'
                    )}
                  >
                    <span className="flex-1">{lang.native}</span>
                    <span className="text-[10px] text-muted">{lang.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-blue shrink-0" />}
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
