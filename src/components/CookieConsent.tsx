import { useState } from 'react';
import { optInAnalytics, optOutAnalytics } from '../lib/analytics.js';

const CONSENT_KEY = 'paleoglossa_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(CONSENT_KEY));

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    optInAnalytics();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    optOutAnalytics();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-parch2 border border-border shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-ink2 text-sm flex-1">
          We use cookies for authentication and analytics.{' '}
          <a href="/privacy" className="text-blue underline">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-lg border border-border text-ink2 hover:bg-parch3 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded-lg bg-blue text-white font-medium hover:bg-blue/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
