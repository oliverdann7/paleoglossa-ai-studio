// Minimal test: Express app with no dependencies
import express from 'express';

const app = express();

export default async function handler(req: any, res: any) {
  try {
    app(req, res, function next() {
      if (!res.headersSent) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'No route matched from minimal test' }));
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
