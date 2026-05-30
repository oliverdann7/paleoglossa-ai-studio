import { Router } from 'express';
import { requireAuth } from '../_lib/auth.js';
import { getAdminDb } from '../_lib/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../_lib/auth.js';

const router = Router();

// Recordings are stored inline in Firestore (base64). Firestore caps a single
// document at ~1 MiB, so we cap recordings well under that to leave room for
// metadata and base64 overhead. Clients that need longer clips should upgrade
// to Firebase Storage and post a download URL here instead.
const MAX_RECORDING_BYTES = 700_000;
const MAX_RECORDINGS_PER_USER = 50;

// In-memory LRU cache: key = `${languageId}::${text}`, value = base64 audio data URL
// Capped at 200 entries (~40 MB assuming ~200 KB per audio) to bound memory usage.
const TTS_CACHE_MAX = 200;
const ttsCache = new Map<string, string>();

function cachePut(key: string, value: string) {
  if (ttsCache.size >= TTS_CACHE_MAX) {
    // Evict oldest entry (Map preserves insertion order)
    ttsCache.delete(ttsCache.keys().next().value!);
  }
  ttsCache.set(key, value);
}

const TTS_SUPPORTED_LANGUAGES: Record<string, { code: string; voice: string; note: string }> = {
  grc: { code: 'el-GR', voice: 'el-GR-Standard-A', note: 'Ancient Greek accent reconstruction' },
  lat: { code: 'it-IT', voice: 'it-IT-Standard-A', note: 'Restored Classical pronunciation' },
  'grc-koine': {
    code: 'el-GR',
    voice: 'el-GR-Standard-B',
    note: 'Koine pronunciation approximation',
  },
  hbo: { code: 'he-IL', voice: 'he-IL-Standard-A', note: 'Biblical Hebrew (Tiberian tradition)' },
  syr: { code: 'ar-XA', voice: 'ar-XA-Standard-A', note: 'Syriac (Western tradition)' },
};

const PRONUNCIATION_MODE_OVERRIDES: Record<string, Record<string, { voice: string; note: string }>> = {
  grc: {
    restored: { voice: 'el-GR-Standard-A', note: 'Restored Classical Greek (5th–4th c. BCE)' },
    erasmian: { voice: 'el-GR-Standard-B', note: 'Erasmian academic pronunciation' },
    modern: { voice: 'el-GR-Standard-A', note: 'Modern Greek pronunciation' },
  },
  'grc-koine': {
    restored: { voice: 'el-GR-Standard-B', note: 'Reconstructed Koine (1st c. CE)' },
    erasmian: { voice: 'el-GR-Standard-A', note: 'Erasmian academic pronunciation' },
    modern: { voice: 'el-GR-Standard-A', note: 'Modern Greek pronunciation' },
  },
  lat: {
    restored: { voice: 'it-IT-Standard-A', note: 'Restored Classical Latin (1st c. BCE)' },
    modern: { voice: 'it-IT-Standard-B', note: 'Ecclesiastical (Italianate) Latin' },
  },
  hbo: {
    restored: { voice: 'he-IL-Standard-A', note: 'Tiberian (Masoretic) tradition' },
    modern: { voice: 'he-IL-Standard-B', note: 'Modern Israeli Hebrew pronunciation' },
  },
};

const LANGUAGE_RECONSTRUCTION_NOTES: Record<string, string> = {
  grc: 'Ancient Greek pronunciation is reconstructed. The exact phonetics of the classical period (5th–4th c. BCE) are scholarly approximations based on meter, spelling errors, and comparative linguistics.',
  'grc-koine':
    'Koine Greek pronunciation shifted from classical. This synthesis uses the reconstructed Erasmian-influenced system common in academic contexts.',
  lat: 'Restored Classical pronunciation (1st c. BCE–1st c. CE) based on consensus of historical linguists. Medieval/Ecclesiastical pronunciation differs.',
  hbo: 'Biblical Hebrew pronunciation follows the Tiberian tradition. Vowel quality and some consonants are reconstructed.',
  syr: 'Syriac pronunciation follows the Western (Serto) tradition. Eastern and Western traditions differ significantly.',
  cop: 'Coptic pronunciation follows the Bohairic tradition used in liturgical contexts. Ancient phonetics are partially reconstructed.',
  arc: 'Aramaic pronunciation is reconstructed from vocalized manuscripts and comparative Semitic data.',
  akk: 'Akkadian pronunciation is reconstructed from cuneiform writing, which does not record vowels fully. Significant uncertainty remains.',
  san: 'Sanskrit pronunciation follows the Paninian tradition preserved in oral recitation. Ancient phonetics are well understood.',
  egy: 'Egyptian pronunciation is highly uncertain. The conventional Egyptological pronunciation used in the field bears unknown resemblance to ancient speech.',
  hit: 'Hittite pronunciation is partially reconstructed from cuneiform spelling. Significant gaps remain.',
};

router.post('/api/audio/tts', async (req: any, res: any) => {
  try {
    const { languageId, text, pronunciationMode } = req.body;

    if (!languageId) {
      return res.status(400).json({
        audioUrl: null,
        supported: false,
        reason: 'languageId is required',
        code: 'INVALID_INPUT',
      });
    }

    if (!text) {
      return res.status(400).json({
        audioUrl: null,
        supported: false,
        reason: 'text is required',
        code: 'INVALID_INPUT',
      });
    }

    const langConfig = TTS_SUPPORTED_LANGUAGES[languageId];
    if (!langConfig) {
      return res.status(200).json({
        audioUrl: null,
        supported: false,
        reason: `TTS is not available for ${languageId}. ${LANGUAGE_RECONSTRUCTION_NOTES[languageId] || ''}`,
      });
    }

    const modeOverride = pronunciationMode && PRONUNCIATION_MODE_OVERRIDES[languageId]?.[pronunciationMode];
    const voice = modeOverride?.voice ?? langConfig.voice;
    const note = modeOverride?.note ?? langConfig.note;

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        audioUrl: null,
        supported: false,
        reason: 'Audio playback is not available in this environment.',
        provider: `Google Cloud Text-to-Speech (${note})`,
      });
    }

    const cacheKey = `${languageId}::${pronunciationMode || 'default'}::${text}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ audioUrl: cached, supported: true, cached: true, provider: `Google Cloud Text-to-Speech (${note})` });
    }

    const requestBody = {
      input: { text: text.substring(0, 5000) },
      voice: {
        languageCode: langConfig.code,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.9,
      },
    };

    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error('[TTS] API error:', response.status, await response.text());
      return res.status(200).json({
        audioUrl: null,
        supported: true,
        reason: 'TTS service temporarily unavailable',
        provider: `Google Cloud Text-to-Speech (${note})`,
      });
    }

    const data = (await response.json()) as any;
    const audioContent = data.audioContent;

    if (!audioContent) {
      return res.status(200).json({
        audioUrl: null,
        supported: true,
        reason: 'No audio content generated',
        provider: `Google Cloud Text-to-Speech (${note})`,
      });
    }

    const audioBase64 = `data:audio/mpeg;base64,${audioContent}`;
    cachePut(cacheKey, audioBase64);
    return res.status(200).json({
      audioUrl: audioBase64,
      supported: true,
      provider: `Google Cloud Text-to-Speech (${langConfig.note})`,
    });
  } catch (err) {
    console.error('[TTS] Error:', err);
    return res.status(500).json({
      audioUrl: null,
      supported: false,
      reason: 'Internal server error generating audio',
    });
  }
});

// ─── User recordings ─────────────────────────────────────────────────────────
// POST: persist a recording (base64 audio data URL) under the caller's uid.
// GET:  list the caller's recordings (most recent first).
// DELETE /:id: remove one recording.

router.post(
  '/api/audio/recordings',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) {
      return res
        .status(503)
        .json({ supported: false, reason: 'Firestore backend not configured.' });
    }

    const userId = req.user!.uid;
    const body = (req.body ?? {}) as {
      audioBase64?: string;
      languageId?: string;
      textId?: string;
      sentenceIndex?: number;
      transcript?: string;
      durationMs?: number;
    };

    const audio = (body.audioBase64 ?? '').trim();
    if (!audio.startsWith('data:audio/')) {
      return res
        .status(400)
        .json({ supported: false, reason: 'audioBase64 must be a data:audio/* URL.' });
    }
    // Approximate byte size of the base64 payload portion.
    const payload = audio.split(',', 2)[1] ?? '';
    const approxBytes = Math.floor((payload.length * 3) / 4);
    if (approxBytes > MAX_RECORDING_BYTES) {
      return res.status(413).json({
        supported: false,
        reason: `Recording too large (${approxBytes} bytes > ${MAX_RECORDING_BYTES}).`,
      });
    }

    const col = adminDb_.collection('users').doc(userId).collection('recordings');

    // Enforce per-user cap by evicting oldest if needed.
    const existing = await col.orderBy('createdAt', 'asc').get();
    const overflow = existing.size - (MAX_RECORDINGS_PER_USER - 1);
    if (overflow > 0) {
      const batch = adminDb_.batch();
      existing.docs.slice(0, overflow).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const doc = await col.add({
      audioBase64: audio,
      languageId: body.languageId ?? null,
      textId: body.textId ?? null,
      sentenceIndex: typeof body.sentenceIndex === 'number' ? body.sentenceIndex : null,
      transcript: body.transcript ?? null,
      durationMs: typeof body.durationMs === 'number' ? body.durationMs : null,
      bytes: approxBytes,
      createdAt: Date.now(),
    });

    return res.status(201).json({ supported: true, id: doc.id, bytes: approxBytes });
  }
);

router.get(
  '/api/audio/recordings',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) return res.status(200).json({ recordings: [] });

    const userId = req.user!.uid;
    const snap = await adminDb_
      .collection('users')
      .doc(userId)
      .collection('recordings')
      .orderBy('createdAt', 'desc')
      .limit(MAX_RECORDINGS_PER_USER)
      .get();

    const recordings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ recordings });
  }
);

router.delete(
  '/api/audio/recordings/:id',
  requireAuth as any,
  async (req: AuthenticatedRequest, res: any) => {
    const adminDb_ = getAdminDb();
    if (!adminDb_) return res.status(503).json({ ok: false });

    const userId = req.user!.uid;
    const id = req.params.id as string;
    await adminDb_.collection('users').doc(userId).collection('recordings').doc(id).delete();
    return res.status(200).json({ ok: true });
  }
);

export default router;
