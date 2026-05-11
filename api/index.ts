import { createApiApp } from '../server';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set');
}

const app = createApiApp();

export default function handler(req: any, res: any) {
  app(req, res);
}
