import path from 'path';
import express from 'express';
import http from 'http';

// Import the Express app built for Vercel
import handler, { expressApp } from './api/index';

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // We need access to the Express app, not the Vercel handler.
    // Since api/index.ts exports the handler as default, we use
    // app._expressApp or recreate the Express app here.
    // For local dev, just use the handler directly — it wraps the Express app.
    const expressAppInstance = expressApp || (handler as any).__expressApp;
    if (expressAppInstance) expressAppInstance.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // We already have `handler` and `expressApp` from the top import.
    // For production server (non-Vercel), start Express directly
    const distApp = expressApp || (handler as any).__expressApp;
    if (distApp) {
      distApp.use(express.static(distPath, { maxAge: '1y', immutable: true }));
      distApp.get('/*all', (_req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (process.env.VERCEL) return;

  // In local dev, start listening
  const server = http.createServer(handler);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (!process.env.VERCEL) {
  startServer();
}
