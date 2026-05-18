import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  BookText,
  MessageCircle,
  FileText,
  BookMarked,
  BarChart3,
  Headphones,
  PlusCircle,
  Users,
  Settings,
  Crown,
  ShieldAlert,
  ChevronRight,
  GraduationCap,
  GitBranch,
} from 'lucide-react';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';

interface MoreCardProps {
  icon: React.ElementType;
  label: string;
  to: string;
}

const MoreCard = ({ icon: Icon, label, to }: MoreCardProps) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="w-full flex items-center gap-4 px-5 py-4 bg-parch2 hover:bg-parch3 active:bg-parch3 transition-colors rounded-xl border border-bdr text-left min-h-[52px]"
    >
      <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-blue" />
      </div>
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted shrink-0" />
    </button>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="mb-6">
    <h2 className="text-xs font-bold text-muted uppercase tracking-widest px-1 mb-3">{title}</h2>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

export const More = () => {
  const { t } = useTranslation();
  const { isAdmin } = useSubscription();

  return (
    <div className="min-h-screen bg-parch pb-safe">
      <div className="sticky top-0 z-10 bg-parch/90 backdrop-blur-md border-b border-bdr">
        <div className="px-5 py-4">
          <h1 className="text-xl font-serif font-semibold text-ink">{t('more.title', 'More')}</h1>
        </div>
      </div>

      <div className="px-4 pt-5 pb-8 max-w-lg mx-auto">
        <Section title={t('more.study', 'Study')}>
          <MoreCard icon={Search} label={t('nav.search', 'Search')} to="/app/search" />
          <MoreCard
            icon={BookText}
            label={t('nav.dictionary', 'Dictionary')}
            to="/app/dictionary"
          />
          <MoreCard icon={MessageCircle} label={t('nav.tutor', 'Tutor')} to="/app/tutor" />
          <MoreCard icon={GraduationCap} label={t('nav.grammar', 'Grammar')} to="/app/grammar" />
          <MoreCard icon={GitBranch} label={t('nav.syntax', 'Syntax')} to="/app/syntax" />
          <MoreCard icon={GraduationCap} label={t('nav.courses', 'Courses')} to="/app/courses" />
        </Section>

        <Section title={t('more.personal', 'Personal')}>
          <MoreCard icon={FileText} label={t('nav.notes', 'Notes')} to="/app/notes" />
          <MoreCard icon={BookMarked} label={t('nav.notebooks', 'Notebooks')} to="/app/notebooks" />
          <MoreCard
            icon={BarChart3}
            label={t('nav.statistics', 'Statistics')}
            to="/app/statistics"
          />
        </Section>

        <Section title={t('more.tools', 'Tools')}>
          <MoreCard icon={PlusCircle} label={t('nav.import', 'Import')} to="/app/import" />
          <MoreCard icon={Headphones} label={t('nav.audioLab', 'Audio Lab')} to="/app/audio-lab" />
        </Section>

        <Section title={t('more.community', 'Community')}>
          <MoreCard icon={Users} label={t('nav.community', 'Community')} to="/app/community" />
        </Section>

        <Section title={t('more.account', 'Account')}>
          <MoreCard icon={Settings} label={t('nav.settings', 'Settings')} to="/app/settings" />
          <MoreCard icon={Crown} label={t('nav.upgrade', 'Upgrade')} to="/app/subscription" />
        </Section>

        {isAdmin && (
          <Section title={t('more.admin', 'Admin')}>
            <MoreCard icon={ShieldAlert} label={t('nav.admin', 'Admin')} to="/admin" />
          </Section>
        )}
      </div>
    </div>
  );
};
