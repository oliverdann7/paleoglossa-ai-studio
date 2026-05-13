import type { Request, Response, NextFunction } from 'express';
import { getAdminAuth, isAdminAvailable } from './firebaseAdmin';

export interface AuthUser {
  uid: string;
  email: string | null;
  claims: Record<string, any>;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header', code: 'UNAUTHORIZED' });
    return;
  }

  if (!isAdminAvailable()) {
    res.status(503).json({ error: 'Authentication service unavailable', code: 'SERVICE_UNAVAILABLE' });
    return;
  }

  const auth = getAdminAuth();
  if (!auth) {
    res.status(503).json({ error: 'Authentication service unavailable', code: 'SERVICE_UNAVAILABLE' });
    return;
  }

  auth.verifyIdToken(token)
    .then(decoded => {
      req.user = {
        uid: decoded.uid,
        email: decoded.email || null,
        claims: decoded as unknown as Record<string, any>,
      };
      next();
    })
    .catch(err => {
      const message = err.code === 'auth/id-token-expired'
        ? 'Token expired'
        : 'Invalid authentication token';
      res.status(401).json({ error: message, code: 'UNAUTHORIZED' });
    });
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = getBearerToken(req);

  if (!token || !isAdminAvailable()) {
    next();
    return;
  }

  const auth = getAdminAuth();
  if (!auth) {
    next();
    return;
  }

  auth.verifyIdToken(token)
    .then(decoded => {
      req.user = {
        uid: decoded.uid,
        email: decoded.email || null,
        claims: decoded as unknown as Record<string, any>,
      };
      next();
    })
    .catch(() => {
      next();
    });
}
