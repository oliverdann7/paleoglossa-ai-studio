/**
 * In-process circular error log.
 * Captures the last MAX_ENTRIES server errors across all routes.
 * Survives only as long as the process — no persistence.
 */

const MAX_ENTRIES = 200;

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
}

const buffer: ErrorLogEntry[] = [];
let seq = 0;

export function logError(
  err: Error | unknown,
  context?: {
    route?: string;
    method?: string;
    statusCode?: number;
    userId?: string;
  }
): void {
  const e = err instanceof Error ? err : new Error(String(err));
  const entry: ErrorLogEntry = {
    id: `${Date.now()}-${++seq}`,
    timestamp: new Date().toISOString(),
    message: e.message,
    stack: e.stack,
    ...context,
  };

  if (buffer.length >= MAX_ENTRIES) buffer.shift();
  buffer.push(entry);
}

export function getRecentErrors(limit = 100): ErrorLogEntry[] {
  return buffer.slice(-Math.min(limit, MAX_ENTRIES)).reverse();
}

export function clearErrors(): void {
  buffer.length = 0;
}

export function getErrorStats(): { total: number; last24h: number; lastHour: number } {
  const now = Date.now();
  const h24 = now - 24 * 60 * 60 * 1000;
  const h1 = now - 60 * 60 * 1000;
  return {
    total: buffer.length,
    last24h: buffer.filter((e) => new Date(e.timestamp).getTime() > h24).length,
    lastHour: buffer.filter((e) => new Date(e.timestamp).getTime() > h1).length,
  };
}
