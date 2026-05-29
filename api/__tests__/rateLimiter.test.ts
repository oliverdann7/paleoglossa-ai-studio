import { describe, it, expect } from 'vitest';
import { rateLimiter } from '../_lib/rateLimiter.js';

function makeReq(ip = '1.2.3.4', auth?: string): any {
  return {
    headers: { ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
    socket: { remoteAddress: ip },
  };
}
function makeRes(): any {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  return {
    setHeader: (k: string, v: string) => { headers[k] = v; },
    status(c: number) { statusCode = c; return this; },
    json(b: any) { body = b; return this; },
    _status: () => statusCode,
    _body: () => body,
    _header: (k: string) => headers[k],
  };
}

describe('rateLimiter', () => {
  it('allows requests within the limit', () => {
    const mw = rateLimiter({ windowMs: 10_000, max: 3 });
    for (let i = 0; i < 3; i++) {
      const res = makeRes();
      let called = false;
      mw(makeReq(), res, () => { called = true; });
      expect(called).toBe(true);
      expect(res._status()).toBe(200);
    }
  });

  it('blocks the (max+1)th request', () => {
    const mw = rateLimiter({ windowMs: 10_000, max: 2 });
    const req = makeReq('5.5.5.5');
    for (let i = 0; i < 2; i++) mw(req, makeRes(), () => {});
    const res = makeRes();
    let called = false;
    mw(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res._status()).toBe(429);
    expect(res._body()?.code).toBe('RATE_LIMITED');
  });

  it('tracks different IPs independently', () => {
    const mw = rateLimiter({ windowMs: 10_000, max: 1 });
    const res1 = makeRes(); let c1 = false;
    mw(makeReq('10.0.0.1'), res1, () => { c1 = true; });
    const res2 = makeRes(); let c2 = false;
    mw(makeReq('10.0.0.2'), res2, () => { c2 = true; });
    expect(c1).toBe(true);
    expect(c2).toBe(true);
  });

  it('skips authenticated requests when skipAuthenticated=true', () => {
    const mw = rateLimiter({ windowMs: 10_000, max: 0, skipAuthenticated: true });
    const res = makeRes(); let called = false;
    mw(makeReq('1.2.3.4', 'mytoken'), res, () => { called = true; });
    expect(called).toBe(true);
  });

  it('sets RateLimit response headers', () => {
    const mw = rateLimiter({ windowMs: 10_000, max: 5 });
    const res = makeRes();
    mw(makeReq('2.3.4.5'), res, () => {});
    expect(res._header('X-RateLimit-Limit')).toBe('5');
    expect(res._header('X-RateLimit-Remaining')).toBeDefined();
  });
});
