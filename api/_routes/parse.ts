import { Router } from 'express';
import multer from 'multer';
import { PDFParse, PasswordException } from 'pdf-parse';
import mammoth from 'mammoth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

router.post('/api/import/parse', upload.single('file'), async (req: any, res: any) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: 'No file uploaded or file type not supported.', code: 'NO_FILE' });
  }

  const { mimetype, buffer, originalname, size } = req.file;

  if (size === 0) {
    return res.status(400).json({ error: 'The uploaded file is empty.', code: 'EMPTY_FILE' });
  }

  try {
    let text = '';
    const warnings: string[] = [];

    if (mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result.text.trim();
        if (!text) {
          warnings.push(
            'PDF contained no extractable text. It may be a scanned image — try the Image OCR tab instead.'
          );
        }
        if (result.total > 200) {
          warnings.push(
            `Large document (${result.total} pages). Only the first 100,000 characters will be analyzed.`
          );
        }
      } finally {
        await parser.destroy();
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
      if (result.messages.length > 0) {
        warnings.push('Some DOCX elements could not be converted to plain text.');
      }
      if (!text) {
        warnings.push('The DOCX file appears to contain no text content.');
      }
    } else {
      text = buffer.toString('utf-8').trim();
    }

    const truncated = text.length > 100000;
    if (truncated) {
      warnings.push(
        `Text was truncated to 100,000 characters (document contained ${text.length.toLocaleString()}).`
      );
    }

    return res.status(200).json({
      text: text.slice(0, 100000),
      originalFilename: originalname,
      mimeType: mimetype,
      characterCount: Math.min(text.length, 100000),
      truncated,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err: unknown) {
    if (err instanceof PasswordException) {
      return res.status(422).json({
        error: 'This PDF is password-protected. Remove the password and try again.',
        code: 'PDF_ENCRYPTED',
      });
    }
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (msg.includes('central directory') || msg.includes('zip')) {
      return res.status(422).json({
        error: 'The DOCX file appears to be corrupt or is not a valid Word document.',
        code: 'DOCX_CORRUPT',
      });
    }
    console.error('[import/parse] Unexpected error:', err);
    return res
      .status(500)
      .json({ error: 'Failed to extract text from file.', code: 'PARSE_ERROR' });
  }
});

// Multer error handler (file too large, unsupported type from fileFilter)
router.use((err: unknown, _req: unknown, res: any, next: (e: unknown) => void) => {
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as NodeJS.ErrnoException).code === 'LIMIT_FILE_SIZE'
  ) {
    return res
      .status(413)
      .json({ error: 'File exceeds the 10 MB size limit.', code: 'FILE_TOO_LARGE' });
  }
  if (err instanceof Error && err.message.startsWith('Unsupported file type')) {
    return res.status(415).json({ error: err.message, code: 'UNSUPPORTED_TYPE' });
  }
  next(err);
});

export default router;
