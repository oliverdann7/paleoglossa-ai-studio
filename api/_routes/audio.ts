import { Router } from 'express';

const router = Router();

const TTS_SUPPORTED_LANGUAGES: Record<string, string> = {
  'grc': 'Google Standard (Ancient Greek accent reconstruction)',
  'lat': 'Google Standard (Restored Classical pronunciation)',
  'grc-koine': 'Google Standard (Koine pronunciation approximation)',
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

router.post('/api/audio/tts', (req: any, res: any) => {
  const { languageId } = req.body;

  if (!languageId) {
    return res.status(400).json({ audioUrl: null, supported: false, reason: 'languageId is required', code: 'INVALID_INPUT' });
  }

  const providerInfo = TTS_SUPPORTED_LANGUAGES[languageId];
  if (!providerInfo) {
    return res.status(200).json({
      audioUrl: null,
      supported: false,
      reason: `TTS is not available for ${languageId}. ${LANGUAGE_RECONSTRUCTION_NOTES[languageId] || ''}`,
    });
  }

  const ttsApiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!ttsApiKey) {
    return res.status(200).json({
      audioUrl: null,
      supported: true,
      reason: `TTS engine (${providerInfo}) is not configured. Set GOOGLE_TTS_API_KEY for audio.`,
      provider: providerInfo,
    });
  }

  return res.status(200).json({
    audioUrl: null,
    supported: true,
    reason: `TTS engine (${providerInfo}) is available but not yet connected to a streaming endpoint.`,
    provider: providerInfo,
  });
});

router.post('/api/audio/recordings', (_req: any, res: any) => {
  res.status(200).json({ audioUrl: null, supported: false, reason: 'User recordings not yet implemented.' });
});

export default router;
