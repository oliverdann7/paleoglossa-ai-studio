/**
 * Languages with real server-side (Google) TTS voices wired in
 * `api/_routes/audio.ts`. We only surface the review audio button for these so
 * we never render a control that produces nothing. Mirror this set if the
 * server map grows.
 */
const TTS_SUPPORTED_LANGUAGE_IDS = new Set(['grc', 'grc-koine', 'lat', 'hbo', 'syr']);

export function isReviewAudioSupported(languageId: string): boolean {
  return TTS_SUPPORTED_LANGUAGE_IDS.has(languageId);
}
