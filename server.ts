import path from 'path';

// Import the Express app built for Vercel
import app from './api/index';

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
    const expressApp = (app as any).__expressApp || require('./api/index').expressApp;
    if (expressApp) expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const { default: handler } = await import('./api/index');
    // For production server (non-Vercel), start Express directly
    const distApp = (handler as any).__expressApp || require('./api/index').expressApp;
    if (distApp) {
      distApp.use(require('express').static(distPath));
      distApp.get('/*all', (_req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (process.env.VERCEL) return;

  // In local dev, start listening
  const http = require('http');
  const server = http.createServer(app);
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
