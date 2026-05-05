import React from 'react';
import { motion } from 'motion/react';
import { Library, BookOpen, GraduationCap, Settings, User, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group",
      isActive 
        ? "bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 shadow-lg" 
        : "text-obsidian-900/60 hover:text-obsidian-900 dark:text-vellum-100/60 dark:hover:text-vellum-100 hover:bg-black/5 dark:hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive ? "scale-110" : "group-hover:scale-110")} strokeWidth={1.5} />
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </button>
);

export const Navbar = ({ 
  activeTab, 
  onTabChange, 
  isDarkMode, 
  onToggleDarkMode 
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void,
  isDarkMode: boolean,
  onToggleDarkMode: () => void
}) => {
  return (
    <nav className="fixed left-0 top-0 h-full w-72 border-r border-black/5 dark:border-white/5 p-8 flex flex-col gap-12 z-50 bg-vellum-50/80 dark:bg-obsidian-950/80 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
            <span className="text-vellum-50 font-serif font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tighter">Paleoglossa</h1>
        </div>
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="text-[10px] font-bold text-obsidian-900/30 dark:text-vellum-100/30 uppercase tracking-[0.3em] mb-2 px-4">Main Menu</div>
        <NavItem icon={BookOpen} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Library} label="Library" isActive={activeTab === 'library'} onClick={() => onTabChange('library')} />
        <NavItem icon={GraduationCap} label="Vocabulary" isActive={activeTab === 'vocabulary'} onClick={() => onTabChange('vocabulary')} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-gold-500/5 border border-gold-500/10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600">Daily Goal</span>
            <span className="text-xs font-bold">85%</span>
          </div>
          <div className="h-1.5 w-full bg-gold-500/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              className="h-full bg-gold-500"
            />
          </div>
          <p className="text-[10px] text-obsidian-900/40 dark:text-vellum-100/40 mt-3 font-medium">15 mins left to reach your goal.</p>
        </div>

        <div className="flex flex-col gap-2 pt-6 border-t border-black/5 dark:border-white/5">
          <NavItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
          <NavItem icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => onTabChange('profile')} />
        </div>
      </div>
    </nav>
  );
};
