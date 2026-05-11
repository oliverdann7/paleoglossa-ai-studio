import { useTranslation } from 'react-i18next';
import { Headphones } from 'lucide-react';

export const AudioLab = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('audioLab.title', 'Pronunciation Lab')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('audioLab.description', 'Practice pronunciation with TTS, recordings, and IPA guides.')}
        </p>
      </header>
      <div className="card p-12 text-center text-muted border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center gap-4">
        <Headphones className="w-12 h-12 text-muted" />
        <p className="text-ink3 max-w-md">{t('audioLab.comingSoon', 'Word-by-word TTS, user recording with waveform, IPA transcription, and pronunciation mode toggles — coming soon.')}</p>
      </div>
    </div>
  );
};
