import { Navigate } from 'react-router-dom';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { Loader2 } from 'lucide-react';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoaded } = useSubscription();

  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parch">
        <Loader2 className="w-8 h-8 animate-spin text-blue" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return <>{children}</>;
}
