import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { text, lemma, language } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Give a brief, scholarly explanation of the etymology and morphological usage of the word '${text}' (lemma: '${lemma}') in '${language}'. Keep it concise (under 150 words).`;
      
      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of response) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { tokens } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Translate the following text into clear, fluent English. Just provide the English translation, and nothing else:\n${tokens.join(" ")}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Translate Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
