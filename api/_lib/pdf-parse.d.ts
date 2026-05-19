// Type shim for the internal sub-path import that bypasses pdf-parse's
// auto-run test code (which would fail on Vercel's read-only filesystem).
declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdfParse(
    dataBuffer: Buffer,
    options?: { max?: number; version?: string }
  ): Promise<{ text: string; numpages: number; numrender: number; info: unknown; metadata: unknown }>;
  export = pdfParse;
}
