import { Component, ReactNode } from 'react';
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
  "text/html",
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Unable to preload CSS",
  "Importing a module script failed",
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

    // Auto-reload once on chunk/module load failures (stale deploy cache).
    // Session flag prevents infinite reload loops.
    if (isChunkLoadError(error.message)) {
      const alreadyReloaded = sessionStorage.getItem('chunk-error-reload');
      if (!alreadyReloaded) {
        sessionStorage.setItem('chunk-error-reload', '1');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('chunk-error-reload');
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isChunkError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-parch p-8">
          <div className="card p-8 max-w-md text-center">
            <h2 className="text-xl font-bold text-ink mb-2">{this.state.isChunkError ? 'App Updated' : 'Something went wrong'}</h2>
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
              <button
                onClick={this.handleRetry}
                className="btn-primary px-6 py-2"
              >
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
