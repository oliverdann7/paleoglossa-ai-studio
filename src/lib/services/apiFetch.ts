import { auth } from '../firebase';

export class ApiError extends Error {
  status: number;
  code: string;
  body: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code || 'UNKNOWN';
    this.body = body;
  }
}

export class AuthRequiredError extends ApiError {
  constructor() {
    super('Authentication required. Sign in or enable demo mode.', 401, { code: 'AUTH_REQUIRED' });
    this.name = 'AuthRequiredError';
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized — check your authentication',
  403: 'Forbidden — you do not have access',
  404: 'Not found',
  408: 'Request timed out',
  429: 'Too many requests — try again later',
  500: 'Server error — try again later',
  502: 'Server unreachable — try again later',
  503: 'Service temporarily unavailable',
  504: 'Server timed out — try again later',
};

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new AuthRequiredError();
    }
    headers['Authorization'] = 'Bearer ' + token;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr: any) {
    const msg = networkErr?.name === 'AbortError'
      ? 'Request timed out'
      : (networkErr?.message || 'Network error — check your connection');
    throw new ApiError(msg, 0, { code: 'NETWORK_ERROR' });
  }

  if (!res.ok) {
    let parsed: any;
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
    const message = parsed?.error || STATUS_MESSAGES[res.status] || `Request failed (HTTP ${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  try {
    return await res.json() as T;
  } catch {
    return undefined as T;
  }
}
