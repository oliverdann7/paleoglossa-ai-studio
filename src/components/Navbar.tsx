import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Library,
  BookOpen,
  GraduationCap,
  Settings,
  Brain,
  Search,
  PlusCircle,
  MoreHorizontal,
  Crown,
  BarChart3,
  FileText,
  MessageCircle,
  GitBranch,
  ScanLine,
  Users,
  Headphones,
  BookMarked,
  BookText,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher.js';
import { PaleoIcon } from './PaleoIcon.js';
import { InterfaceLanguageSwitcher } from './InterfaceLanguageSwitcher.js';
import { UserProfileCard } from './UserProfileCard.js';
import { SyncStatusBadge } from './SyncStatusBadge.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { features } from '../lib/features.js';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  to: string;
}

const DesktopNavItem = ({ icon: Icon, label, isActive, to }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-2 transition-all duration-150 group text-[12.5px] font-sans font-medium w-full text-left',
      isActive
        ? 'bg-bluexl text-blue border-l-2 border-blue font-bold shadow-sm'
        : 'text-ink3 hover:bg-parch3 hover:text-ink border-l-2 border-transparent'
    )}
  >
    <Icon
      className={cn(
        'w-4 h-4',
        isActive ? 'scale-110 text-blue' : 'group-hover:scale-110 text-muted'
      )}
      strokeWidth={isActive ? 2 : 1.5}
    />
    <span>{label}</span>
  </Link>
);


const MobileNavItem = ({ icon: Icon, label, isActive, to }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      'flex flex-col items-center gap-0.5 py-1 px-1 flex-1 transition-all duration-150 min-h-[52px] justify-center',
      isActive ? 'text-blue' : 'text-muted hover:text-ink3'
    )}
  >
    <div
      className={cn(
        'flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200',
        isActive ? 'bg-blue/12' : ''
      )}
    >
      <Icon
        className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')}
        strokeWidth={isActive ? 2.2 : 1.5}
      />
    </div>
    <span
      className={cn(
        'text-[10px] font-sans transition-all duration-150 leading-none',
        isActive ? 'font-bold' : 'font-medium'
      )}
    >
      {label}
    </span>
  </Link>
);

export const Navbar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation();
  const { isAdmin } = useSubscription();

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-[220px] border-r border-bdr bg-parch2 flex-col z-50 overflow-y-auto">
        <div className="p-5 flex flex-col gap-1">
          <Link to="/app" className="flex items-center gap-2.5">
            <PaleoIcon className="w-7 h-7 flex-shrink-0" />
            <span className="text-[17px] font-serif font-semibold text-blue">Παλαιόγλωσσα</span>
          </Link>
          <span className="eyebrow" style={{ fontSize: '9px', textTransform: 'none' }}>
            {t('nav.slogan', 'Where ancient texts come alive')}
          </span>
        </div>

        {/* Active Language Switcher */}
        <div className="px-4 mb-4">
          <LanguageSwitcher />
        </div>

        <div className="px-4 mb-6">
          <button className="w-full flex items-center justify-between px-3 py-1.5 bg-parch border border-bdr rounded-md text-ink3 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-ink3" />
              <span className="text-[12.5px] font-sans">{t('nav.search', 'Search...')}</span>
            </div>
            <span className="font-mono text-[10px] text-muted">⌘K</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 flex-1 px-2">
          <div className="nav-label px-3 mb-1 mt-2">{t('nav.study', 'Study')}</div>
          <DesktopNavItem
            icon={BookOpen}
            label={t('nav.dashboard', 'Dashboard')}
            isActive={path === '/app'}
            to="/app"
          />
          <DesktopNavItem
            icon={Library}
            label={t('nav.library', 'Library')}
            isActive={path.startsWith('/app/library') || path.startsWith('/app/reader')}
            to="/app/library"
          />
          <DesktopNavItem
            icon={Brain}
            label={t('nav.review', 'Review')}
            isActive={path === '/app/review'}
            to="/app/review"
          />
          <DesktopNavItem
            icon={GraduationCap}
            label={t('nav.vocabulary', 'Vocabulary')}
            isActive={path === '/app/vocabulary'}
            to="/app/vocabulary"
          />
          <DesktopNavItem
            icon={BookText}
            label={t('nav.dictionary', 'Dictionary')}
            isActive={path.startsWith('/app/dictionary')}
            to="/app/dictionary"
          />
          <DesktopNavItem
            icon={Search}
            label={t('nav.search', 'Search')}
            isActive={path.startsWith('/app/search')}
            to="/app/search"
          />
          <DesktopNavItem
            icon={MessageCircle}
            label={t('nav.tutor', 'Tutor')}
            isActive={path.startsWith('/app/tutor')}
            to="/app/tutor"
          />
          <DesktopNavItem
            icon={FileText}
            label={t('nav.notes', 'Notes')}
            isActive={path === '/app/notes'}
            to="/app/notes"
          />
          <DesktopNavItem
            icon={BookMarked}
            label={t('nav.notebooks', 'Notebooks')}
            isActive={path.startsWith('/app/notebooks')}
            to="/app/notebooks"
          />
          <DesktopNavItem
            icon={BarChart3}
            label={t('nav.statistics', 'Statistics')}
            isActive={path === '/app/statistics'}
            to="/app/statistics"
          />

          <div className="nav-label px-3 mb-1 mt-6">{t('nav.tools', 'Tools')}</div>
          <DesktopNavItem
            icon={GraduationCap}
            label={t('nav.grammar', 'Grammar')}
            isActive={path.startsWith('/app/grammar')}
            to="/app/grammar"
          />
          <DesktopNavItem
            icon={GitBranch}
            label={t('nav.syntax', 'Syntax')}
            isActive={path.startsWith('/app/syntax')}
            to="/app/syntax"
          />
          <DesktopNavItem
            icon={ScanLine}
            label={t('nav.manuscripts', 'Manuscripts')}
            isActive={path.startsWith('/app/manuscripts')}
            to="/app/manuscripts"
          />
          <DesktopNavItem
            icon={Headphones}
            label={t('nav.audioLab', 'Audio Lab')}
            isActive={path.startsWith('/app/audio-lab')}
            to="/app/audio-lab"
          />
          <DesktopNavItem
            icon={GraduationCap}
            label={t('nav.courses', 'Courses')}
            isActive={path.startsWith('/app/courses')}
            to="/app/courses"
          />

          <div className="nav-label px-3 mb-1 mt-6">{t('nav.discover', 'Discover')}</div>
          {features.isCommunityEnabled() && (
            <DesktopNavItem
              icon={Users}
              label={t('nav.community', 'Community')}
              isActive={path.startsWith('/app/community')}
              to="/app/community"
            />
          )}

          <div className="nav-label px-3 mb-1 mt-6">{t('nav.manage', 'Manage')}</div>
          <DesktopNavItem
            icon={PlusCircle}
            label={t('nav.import', 'Import')}
            isActive={path === '/app/import'}
            to="/app/import"
          />
          <DesktopNavItem
            icon={Settings}
            label={t('nav.settings', 'Settings')}
            isActive={path === '/app/settings'}
            to="/app/settings"
          />
          <DesktopNavItem
            icon={Crown}
            label={t('nav.upgrade', 'Upgrade')}
            isActive={path === '/app/subscription'}
            to="/app/subscription"
          />
          {isAdmin && (
            <DesktopNavItem
              icon={ShieldAlert}
              label={t('nav.admin', 'Admin')}
              isActive={path.startsWith('/admin') && path !== '/admin/import'}
              to="/admin"
            />
          )}
        </div>

        <div className="p-2 border-t border-bdr space-y-1">
          <div className="flex justify-end px-2">
            <SyncStatusBadge />
          </div>
          <InterfaceLanguageSwitcher />
          <UserProfileCard />
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full border-t border-bdr bg-parch2/90 backdrop-blur-md pb-safe z-50 flex justify-around px-2 py-1">
        <MobileNavItem
          icon={BookOpen}
          label={t('nav.home', 'Home')}
          isActive={path === '/app'}
          to="/app"
        />
        <MobileNavItem
          icon={Library}
          label={t('nav.library', 'Library')}
          isActive={path.startsWith('/app/library')}
          to="/app/library"
        />
        <MobileNavItem
          icon={Brain}
          label={t('nav.review', 'Review')}
          isActive={path.startsWith('/app/review')}
          to="/app/review"
        />
        <MobileNavItem
          icon={GraduationCap}
          label={t('nav.words', 'Words')}
          isActive={path.startsWith('/app/vocabulary')}
          to="/app/vocabulary"
        />
        <MobileNavItem
          icon={MoreHorizontal}
          label={t('nav.more', 'More')}
          isActive={
            path === '/app/more' ||
            path === '/app/settings' ||
            path === '/app/subscription' ||
            path === '/app/import' ||
            path.startsWith('/app/search') ||
            path.startsWith('/app/dictionary') ||
            path.startsWith('/app/tutor') ||
            path.startsWith('/app/grammar') ||
            path.startsWith('/app/syntax') ||
            path.startsWith('/app/courses') ||
            path.startsWith('/app/notes') ||
            path.startsWith('/app/notebooks') ||
            path.startsWith('/app/statistics') ||
            path.startsWith('/app/audio-lab') ||
            path.startsWith('/app/community')
          }
          to="/app/more"
        />
      </nav>
    </>
  );
};
