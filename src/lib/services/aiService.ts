export class AIService {
  static async explainWord(text: string, lemma: string, language: string, onToken: (t: string) => void) {
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lemma, language })
      });

      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              onToken(data.text);
            } catch {
              // Ignore parse error on streaming partials
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  static async translateSentence(tokens: string[]): Promise<string> {
    const res = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    return data.text;
  }
}
