// jsdom is loaded lazily inside parseTeiXml: a static import puts it (and its
// large dependency tree) in api/index.ts's eager init graph, where an
// incompatible transitive dep once crashed every serverless invocation
// (ERR_REQUIRE_ESM under Vercel's Node launcher — the July 2026 API outage).
// Parsing failures must stay contained to the /api/parse route.

export interface TeiParseResult {
  text: string;
  title?: string;
  author?: string;
  languageHint?: string;
  warnings: string[];
}

const TEI_NS = 'http://www.tei-c.org/ns/1.0';

/** Extract all text nodes from an element, joining with whitespace. */
function extractText(el: Element): string {
  const parts: string[] = [];

  function walk(node: Node) {
    if (node.nodeType === node.TEXT_NODE) {
      const t = node.textContent?.trim();
      if (t) parts.push(t);
    } else if (node.nodeType === node.ELEMENT_NODE) {
      const tag = (node as Element).localName.toLowerCase();
      // Skip header metadata elements
      if (['teiheader', 'encodingdesc', 'profiledesc', 'revisiondesc', 'note', 'ref'].includes(tag)) {
        return;
      }
      // Line/paragraph breaks
      if (['l', 'lb', 'p', 'ab', 'seg', 'div', 'div1', 'div2', 'sp'].includes(tag)) {
        if (parts.length > 0 && parts[parts.length - 1] !== '\n') {
          parts.push('\n');
        }
      }
      for (const child of Array.from(node.childNodes)) {
        walk(child);
      }
      if (['l', 'p', 'ab', 'sp'].includes(tag)) {
        parts.push('\n');
      }
    }
  }

  walk(el);
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/ \n /g, '\n')
    .replace(/\n +/g, '\n')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getTextContent(el: Element | null): string {
  return el?.textContent?.trim() ?? '';
}

/** Extract title from TEI header. */
function extractTitle(doc: Document): string | undefined {
  // Try with namespace first, then without (some TEI files omit namespace)
  const titleStmt =
    doc.getElementsByTagNameNS(TEI_NS, 'titleStmt')[0] ??
    doc.getElementsByTagName('titleStmt')[0];

  if (titleStmt) {
    const titleEl =
      titleStmt.getElementsByTagNameNS(TEI_NS, 'title')[0] ??
      titleStmt.getElementsByTagName('title')[0];
    const t = getTextContent(titleEl);
    if (t) return t;
  }

  // Fallback: first <title> anywhere
  const anyTitle =
    doc.getElementsByTagNameNS(TEI_NS, 'title')[0] ??
    doc.getElementsByTagName('title')[0];
  return getTextContent(anyTitle) || undefined;
}

/** Extract author from TEI header. */
function extractAuthor(doc: Document): string | undefined {
  const authorEl =
    doc.getElementsByTagNameNS(TEI_NS, 'author')[0] ??
    doc.getElementsByTagName('author')[0];
  return getTextContent(authorEl) || undefined;
}

/** Extract language hint from xml:lang or langUsage. */
function extractLanguage(doc: Document): string | undefined {
  const bodyEl =
    doc.getElementsByTagNameNS(TEI_NS, 'body')[0] ??
    doc.getElementsByTagName('body')[0];

  const lang =
    bodyEl?.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang') ??
    bodyEl?.getAttribute('xml:lang');
  if (lang) return lang;

  const langUsage =
    doc.getElementsByTagNameNS(TEI_NS, 'language')[0] ??
    doc.getElementsByTagName('language')[0];
  return langUsage?.getAttribute('ident') ?? undefined;
}

export async function parseTeiXml(xmlString: string): Promise<TeiParseResult> {
  const warnings: string[] = [];

  // @ts-ignore — jsdom ships no bundled types; resolves at runtime
  const { JSDOM } = await import('jsdom');

  let dom: InstanceType<typeof JSDOM>;
  try {
    dom = new JSDOM(xmlString, { contentType: 'application/xml' });
  } catch (e: any) {
    return { text: '', warnings: [`XML parse error: ${e.message}`] };
  }

  const doc = dom.window.document;

  // Check for parse errors (jsdom puts them in <parsererror>)
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    warnings.push('TEI XML has syntax errors — text extraction may be incomplete.');
  }

  // Find root TEI element
  const teiRoot =
    doc.getElementsByTagNameNS(TEI_NS, 'TEI')[0] ??
    doc.getElementsByTagName('TEI')[0] ??
    doc.documentElement;

  if (!teiRoot) {
    return { text: '', warnings: ['Could not find TEI root element.'] };
  }

  const title = extractTitle(doc);
  const author = extractAuthor(doc);
  const languageHint = extractLanguage(doc);

  // Extract body text
  const bodyEl =
    doc.getElementsByTagNameNS(TEI_NS, 'body')[0] ??
    doc.getElementsByTagName('body')[0];

  if (!bodyEl) {
    warnings.push('No <body> element found — extracting from entire document.');
    const text = extractText(teiRoot);
    return { text, title, author, languageHint, warnings };
  }

  const text = extractText(bodyEl);

  if (!text.trim()) {
    warnings.push('No text content found in TEI <body>.');
  }

  return { text, title, author, languageHint, warnings };
}
