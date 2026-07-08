import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkError: boolean;
}

const CHUNK_ERROR_PATTERNS = [
  'text/html',
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Unable to preload CSS',
  'Importing a module script failed',
];

function isChunkLoadError(message: string) {
  return CHUNK_ERROR_PATTERNS.some((p) => message.includes(p));
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    const chunkError = isChunkLoadError(error.message);
    return { hasError: true, error, isChunkError: chunkError };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    if (!isChunkLoadError(error.message)) {
      Sentry.captureException(error, {
        contexts: { react: { componentStack: info.componentStack ?? '' } },
      });
    }

    if (isChunkLoadError(error.message)) {
      const alreadyReloaded = sessionStorage.getItem('chunk-error-reload');
      if (!alreadyReloaded) {
        sessionStorage.setItem('chunk-error-reload', '1');
        window.location.reload();
      }
    } else {
      // Render crashes on stale PWA clients (the SW serves an old precached
      // bundle until the user accepts the update toast) are unfixable by
      // re-rendering — activate any waiting SW and reload once per session.
      const alreadyReloaded = sessionStorage.getItem('render-error-reload');
      if (!alreadyReloaded) {
        sessionStorage.setItem('render-error-reload', '1');
        void ErrorBoundary.activateWaitingSWAndReload();
      }
    }
  }

  /** If a new service worker is installed-but-waiting, activate it so the
   *  reload actually serves fresh assets instead of the stale precache. */
  private static async activateWaitingSWAndReload() {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg?.waiting) {
        const reloadOnControl = () => window.location.reload();
        navigator.serviceWorker.addEventListener('controllerchange', reloadOnControl, {
          once: true,
        });
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Fallback in case controllerchange never fires
        setTimeout(reloadOnControl, 2000);
        return;
      }
    } catch {
      // fall through to plain reload
    }
    window.location.reload();
  }

  private handleReload = () => {
    sessionStorage.removeItem('chunk-error-reload');
    window.location.reload();
  };

  private handleRetry = () => {
    // A full reload (after activating any waiting SW) beats resetting state:
    // re-rendering the same broken tree crashes again immediately.
    sessionStorage.removeItem('render-error-reload');
    void ErrorBoundary.activateWaitingSWAndReload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-parch p-8">
          <div className="card p-8 max-w-md text-center">
            <h2 className="text-xl font-bold text-ink mb-2">
              {this.state.isChunkError ? 'App Updated' : 'Something went wrong'}
            </h2>
            <p className="text-ink3 text-sm mb-6">{this.state.error?.message}</p>
            {this.state.isChunkError ? (
              <>
                <p className="text-ink3 text-xs mb-4">
                  A new version of the app was deployed. Reloading will fix this.
                </p>
                <button
                  onClick={this.handleReload}
                  className="btn-primary px-6 py-2 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload page
                </button>
              </>
            ) : (
              <button onClick={this.handleRetry} className="btn-primary px-6 py-2">
                Try again
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
