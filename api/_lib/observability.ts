import type { Request, Response, NextFunction } from 'express';

// ─── Correlation ID ───────────────────────────────────────────────────────────

const CORRELATION_ID_HEADER = 'X-Correlation-Id';

let seqId = 0;

function generateCorrelationId(): string {
  seqId = (seqId + 1) % 100000;
  const ts = Date.now().toString(36);
  const seq = seqId.toString(36).padStart(3, '0');
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}-${rand}-${seq}`;
}

const correlationIds = new WeakMap<Request, string>();

export function correlationIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  const id =
    (req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string) || generateCorrelationId();
  correlationIds.set(req, id);
  next();
}

export function getCorrelationId(req: Request): string {
  return correlationIds.get(req) || 'unknown';
}

// ─── Safe Error Shape ─────────────────────────────────────────────────────────

export interface SafeErrorShape {
  message: string;
  code: string;
  correlationId?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export function toSafeError(err: unknown, correlationId?: string): SafeErrorShape {
  if (err && typeof err === 'object' && 'code' in err && 'status' in err) {
    const apiErr = err as Record<string, unknown>;
    return {
      message: typeof apiErr.message === 'string' ? apiErr.message : 'Unknown error',
      code: typeof apiErr.code === 'string' ? apiErr.code : 'UNKNOWN',
      correlationId,
      status: typeof apiErr.status === 'number' ? apiErr.status : undefined,
      details:
        apiErr.details && typeof apiErr.details === 'object'
          ? (apiErr.details as Record<string, unknown>)
          : undefined,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message.slice(0, 500),
      code: 'INTERNAL_ERROR',
      correlationId,
    };
  }

  return {
    message: 'Unknown error',
    code: 'UNKNOWN',
    correlationId,
  };
}

// ─── Route Error Wrapper ──────────────────────────────────────────────────────

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function wrapRouteError(handler: AsyncRouteHandler): AsyncRouteHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      const correlationId = getCorrelationId(req);
      const safe = toSafeError(err, correlationId);
      console.error(`[route] ${req.method} ${req.path} — ${safe.message}`, {
        correlationId,
        code: safe.code,
      });
      res.status(safe.status || 500).json({
        error: safe.message,
        code: safe.code,
        correlationId,
      });
    }
  };
}
