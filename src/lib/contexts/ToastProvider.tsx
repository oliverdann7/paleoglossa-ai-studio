import { useState, useCallback } from 'react';
import { ToastContext, Toast } from './ToastContext';

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = String(++toastId);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-slide-up ${
              toast.type === 'success' ? 'bg-jade text-white border-jade/50' :
              toast.type === 'error' ? 'bg-ruby text-white border-ruby/50' :
              toast.type === 'warning' ? 'bg-amber text-white border-amber/50' :
              'bg-blue text-white border-blue/50'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}