import { useEffect } from 'react';
import { onPersistenceError } from '../errors/persistenceReporter.js';
import { useToast } from './useToast.js';

export function usePersistenceErrorToast(): void {
  const { addToast } = useToast();

  useEffect(() => {
    const unsub = onPersistenceError((info) => {
      if (info.suppressed) return;
      addToast(info.classification.userMessage, 'error');
    });
    return unsub;
  }, [addToast]);
}
