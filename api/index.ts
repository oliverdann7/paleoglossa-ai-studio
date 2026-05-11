import { createApiApp } from '../server';

const app = createApiApp();

export default function handler(req: any, res: any) {
  app(req, res, function next() {
    if (!res.headersSent) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}
