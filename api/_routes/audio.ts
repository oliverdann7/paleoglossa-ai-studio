import { Router } from 'express';

const router = Router();

const TTS_SUPPORTED_LANGUAGES: Record<string, { code: string; voice: string; note: string }> = {
  'grc': { code: 'el-GR', voice: 'el-GR-Standard-A', note: 'Ancient Greek accent reconstruction' },
  'lat': { code: 'it-IT', voice: 'it-IT-Standard-A', note: 'Restored Classical pronunciation' },
  'grc-koine': { code: 'el-GR', voice: 'el-GR-Standard-B', note: 'Koine pronunciation approximation' },
  'hbo': { code: 'he-IL', voice: 'he-IL-Standard-A', note: 'Biblical Hebrew (Tiberian tradition)' },
  'syr': { code: 'ar-XA', voice: 'ar-XA-Standard-A', note: 'Syriac (Western tradition)' },
};

const LANGUAGE_RECONSTRUCTION_NOTES: Record<string, string> = {
  'grc': 'Ancient Greek pronunciation is reconstructed. The exact phonetics of the classical period (5th–4th c. BCE) are scholarly approximations based on meter, spelling errors, and comparative linguistics.',
  'grc-koine': 'Koine Greek pronunciation shifted from classical. This synthesis uses the reconstructed Erasmian-influenced system common in academic contexts.',
  'lat': 'Restored Classical pronunciation (1st c. BCE–1st c. CE) based on consensus of historical linguists. Medieval/Ecclesiastical pronunciation differs.',
  'hbo': 'Biblical Hebrew pronunciation follows the Tiberian tradition. Vowel quality and some consonants are reconstructed.',
  'syr': 'Syriac pronunciation follows the Western (Serto) tradition. Eastern and Western traditions differ significantly.',
  'cop': 'Coptic pronunciation follows the Bohairic tradition used in liturgical contexts. Ancient phonetics are partially reconstructed.',
  'arc': 'Aramaic pronunciation is reconstructed from vocalized manuscripts and comparative Semitic data.',
  'akk': 'Akkadian pronunciation is reconstructed from cuneiform writing, which does not record vowels fully. Significant uncertainty remains.',
  'san': 'Sanskrit pronunciation follows the Paninian tradition preserved in oral recitation. Ancient phonetics are well understood.',
  'egy': 'Egyptian pronunciation is highly uncertain. The conventional Egyptological pronunciation used in the field bears unknown resemblance to ancient speech.',
  'hit': 'Hittite pronunciation is partially reconstructed from cuneiform spelling. Significant gaps remain.',
};

router.post('/api/audio/tts', async (req: any, res: any) => {
  try {
    const { languageId, text } = req.body;

    if (!languageId) {
      return res.status(400).json({ audioUrl: null, supported: false, reason: 'languageId is required', code: 'INVALID_INPUT' });
    }

    if (!text) {
      return res.status(400).json({ audioUrl: null, supported: false, reason: 'text is required', code: 'INVALID_INPUT' });
    }

    const langConfig = TTS_SUPPORTED_LANGUAGES[languageId];
    if (!langConfig) {
      return res.status(200).json({
        audioUrl: null,
        supported: false,
        reason: `TTS is not available for ${languageId}. ${LANGUAGE_RECONSTRUCTION_NOTES[languageId] || ''}`,
      });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        audioUrl: null,
        supported: true,
        reason: `Google Cloud TTS is configured but API key (GOOGLE_TTS_API_KEY) is not set.`,
        provider: `Google Cloud Text-to-Speech (${langConfig.note})`,
      });
    }

    const requestBody = {
      input: { text: text.substring(0, 5000) },
      voice: {
        languageCode: langConfig.code,
        name: langConfig.voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.9,
      },
    };

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('[TTS] API error:', response.status, await response.text());
      return res.status(200).json({
        audioUrl: null,
        supported: true,
        reason: 'TTS service temporarily unavailable',
        provider: `Google Cloud Text-to-Speech (${langConfig.note})`,
      });
    }

    const data = await response.json() as any;
    const audioContent = data.audioContent;

    if (!audioContent) {
      return res.status(200).json({
        audioUrl: null,
        supported: true,
        reason: 'No audio content generated',
        provider: `Google Cloud Text-to-Speech (${langConfig.note})`,
      });
    }

    const audioBase64 = `data:audio/mpeg;base64,${audioContent}`;
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

router.post('/api/audio/recordings', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null, supported: false, reason: 'User recordings not yet implemented.' });
});

export default router;
