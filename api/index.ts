// Test: can we import server.ts safely?
import { createApiApp } from '../server';

let app: any = null;

try {
  app = createApiApp();
} catch (err: any) {
  // Capture initialization error
}

export default async function handler(req: any, res: any) {
  if (!app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'App failed to initialize' }));
    return;
  }

  try {
    app(req, res, function next() {
      if (!res.headersSent) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'No route matched' }));
      }
    });
  } catch (err: any) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}
