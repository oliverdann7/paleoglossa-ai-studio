import React from 'react';
import { motion } from 'motion/react';
import { Library, BookOpen, GraduationCap, Settings, User, Brain, Search, PlusCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const DesktopNavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 transition-all duration-150 group text-[12.5px] font-sans font-medium w-full text-left",
      isActive 
        ? "bg-bluexl text-blue border-l-2 border-blue font-bold shadow-sm" 
        : "text-ink3 hover:bg-parch3 hover:text-ink border-l-2 border-transparent"
    )}
  >
    <Icon className={cn("w-4 h-4", isActive ? "scale-110 text-blue" : "group-hover:scale-110 text-muted")} strokeWidth={isActive ? 2 : 1.5} />
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 p-2 flex-1 transition-all duration-150",
      isActive ? "text-blue" : "text-muted hover:text-ink3"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive && "fill-bluexl")} strokeWidth={isActive ? 2 : 1.5} />
    <span className="text-[10px] font-medium font-sans">{label}</span>
  </button>
);

export const Navbar = ({ 
  activeTab, 
  onTabChange, 
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void,
}) => {
  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[220px] border-r border-bdr bg-parch2 flex-col z-50 overflow-y-auto">
        <div className="p-5 flex flex-col gap-1">
          <h1 className="text-[17px] font-serif font-semibold text-blue flex items-center gap-2">
            Παλαιόγλωσσα
          </h1>
          <span className="eyebrow" style={{fontSize: '9px', textTransform: 'none'}}>Where ancient texts come alive</span>
        </div>

        <div className="px-4 mb-6">
          <button className="w-full flex items-center justify-between px-3 py-1.5 bg-parch border border-bdr rounded-md text-ink3 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-ink3" />
              <span className="text-[12.5px] font-sans">Search...</span>
            </div>
            <span className="font-mono text-[10px] text-muted">⌘K</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 flex-1 px-2">
          <div className="nav-label px-3 mb-1 mt-2">Study</div>
          <DesktopNavItem icon={BookOpen} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
          <DesktopNavItem icon={Library} label="Library" isActive={activeTab === 'library'} onClick={() => onTabChange('library')} />
          <DesktopNavItem icon={Brain} label="Review" isActive={activeTab === 'review'} onClick={() => onTabChange('review')} />
          <DesktopNavItem icon={GraduationCap} label="Vocabulary" isActive={activeTab === 'vocabulary'} onClick={() => onTabChange('vocabulary')} />
          
          <div className="nav-label px-3 mb-1 mt-6">Manage</div>
          <DesktopNavItem icon={PlusCircle} label="Import" isActive={activeTab === 'import'} onClick={() => onTabChange('import')} />
          <DesktopNavItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        </div>

        <div className="p-4 border-t border-bdr">
          <div className="card shadow-none border-amberxl bg-[#FFF8E1] p-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber">Reading Level</span>
              <span className="pill cefr-b" style={{fontSize: '9px', padding: '1px 4px'}}>B1</span>
            </div>
            <div className="h-1 w-full bg-amberxl rounded-full overflow-hidden mb-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-amber"
              />
            </div>
            <p className="text-[10px] text-ink3 font-sans">2.4k words to B2</p>
          </div>
          
          <button onClick={() => onTabChange('profile')} className="flex items-center gap-3 w-full p-2 hover:bg-parch3 rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded-full bg-parch3 border border-bdr flex items-center justify-center overflow-hidden">
               <User className="w-4 h-4 text-ink3 group-hover:text-blue" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[12.5px] font-bold font-sans text-ink">E. L. Scholar</span>
              <span className="text-[10px] font-sans text-muted">Free Plan</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full border-t border-bdr bg-parch2/90 backdrop-blur-md pb-safe z-50 flex justify-around px-2 py-1">
        <MobileNavItem icon={BookOpen} label="Home" isActive={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <MobileNavItem icon={Library} label="Library" isActive={activeTab === 'library'} onClick={() => onTabChange('library')} />
        <MobileNavItem icon={Brain} label="Review" isActive={activeTab === 'review'} onClick={() => onTabChange('review')} />
        <MobileNavItem icon={GraduationCap} label="Words" isActive={activeTab === 'vocabulary'} onClick={() => onTabChange('vocabulary')} />
        <MobileNavItem icon={MoreHorizontal} label="More" isActive={['import', 'settings', 'profile'].includes(activeTab)} onClick={() => onTabChange('settings')} />
      </nav>
    </>
  );
};
