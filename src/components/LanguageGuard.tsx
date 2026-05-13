import { Navigate } from 'react-router-dom';
import { useSubscription } from '../lib/contexts/SubscriptionContext';
import { Loader2 } from 'lucide-react';

interface Props {
  languageId: string;
  children: React.ReactNode;
}

export function LanguageGuard({ languageId, children }: Props) {
  const { canAccessLanguage, isLoaded } = useSubscription();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parch">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!canAccessLanguage(languageId)) {
    return <Navigate to="/app/subscription" state={{ locked: languageId }} replace />;
  }

  return <>{children}</>;
}
