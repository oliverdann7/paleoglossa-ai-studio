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
      const { tokens, languageId } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Translate the following text in ${languageId || 'ancient language'} into clear, fluent English. Just provide the English translation, and nothing else:\n${tokens.join(" ")}`;
      
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

  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { languageId, rawText } = req.body;
      if (!rawText) throw new Error("No text provided");
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze the following text in ${languageId}.
        1. Segment it into sentences.
        2. For each sentence, tokenize it into words, punctuation, and whitespace.
        3. For each word token:
           - Provide the lemma (dictionary form).
           - Provide a normalized form (lowercase, potentially stripped of some diacritics if appropriate for ${languageId}).
           - Provide a brief gloss/translation.
           - Provide the part of speech (pos).
           - Provide a transliteration if the script is not Latin.
           - Provide a confidence score (0.0 to 1.0).
        4. For each sentence, provide a fluent English translation.

        Return the result as a JSON object with this structure:
        {
          "sentences": [
            {
              "tokens": [
                { "text": "...", "lemma": "...", "normalized": "...", "type": "word|punctuation|number|whitespace", "transliteration": "...", "gloss": "...", "pos": "...", "confidence": 0.95 }
              ],
              "translation": "..."
            }
          ]
        }

        Text:
        ${rawText}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("AI Analyze Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/ocr', async (req, res) => {
    try {
      const { languageId, imageBase64, mimeType } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: `Extract the text from this image in ${languageId}. Preservation of script and accents is critical. Return ONLY the extracted text.` }
        ]
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI OCR Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { languageId, word, lemma, phrase, type } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let prompt = "";
      if (type === 'word') {
        prompt = `
          Explain the following word in ${languageId}: "${word}" (lemma: "${lemma}").
          Provide a detailed linguistic explanation including:
          1. Common meanings.
          2. Grammatical notes (morphology, usage).
          3. Etymological hints if interesting.
          4. A few example short phrases.
          
          Format as clean Markdown.
        `;
      } else {
        prompt = `
          Explain the following phrase in ${languageId}: "${phrase}".
          Provide a translation and linguistic breakdown of why it means what it means.
          
          Format as clean Markdown.
        `;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      
      res.json({ explanation: response.text });
    } catch (error: any) {
      console.error("AI Explain Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/scrape', async (req, res) => {
    try {
      const { url } = req.body;
      const response = await fetch(url);
      const html = await response.text();
      
      // Basic text extraction from HTML - in a real app we'd use a library like JSDOM or Cheerio
      // But here we can use Gemini to extract the main content
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Extract the main article text from this HTML content. Ignore navigation, ads, and footers. Return ONLY the article text:\n\n${html.slice(0, 10000)}`;
      
      const aiResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      
      res.json({ text: aiResponse.text });
    } catch (error: any) {
      console.error("Scrape Error:", error);
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
    app.get('/*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
