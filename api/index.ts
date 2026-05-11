import { createApiApp } from '../server';

let app: any = null;

try {
  app = createApiApp();
} catch (err: any) {
  console.error('App init failed:', err.message);
}

export default function handler(req: any, res: any) {
  if (!app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'App initialization failed' }));
    return;
  }

  app(req, res, function next() {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No route matched' }));
    }
  });
}
