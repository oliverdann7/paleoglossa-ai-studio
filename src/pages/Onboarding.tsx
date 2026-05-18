import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const languages = [
  {
    id: 'hieroglyphs',
    glyph: '𓊹',
    labelKey: 'egy',
    descKey: 'onboarding.egyptianDesc',
    font: 'font-sans',
  },
  {
    id: 'akkadian',
    glyph: '𒀀',
    labelKey: 'akk',
    descKey: 'onboarding.akkadianDesc',
    font: 'font-sans',
  },
  {
    id: 'sanskrit',
    glyph: 'ॐ',
    labelKey: 'san',
    descKey: 'onboarding.sanskritDesc',
    font: 'font-sans',
  },
  {
    id: 'greek',
    glyph: 'Ω',
    labelKey: 'grc',
    descKey: 'onboarding.ancientGreekDesc',
    font: 'font-greek',
  },
  {
    id: 'koine',
    glyph: 'Α',
    labelKey: 'grc-koine',
    descKey: 'onboarding.koineDesc',
    font: 'font-greek',
  },
  {
    id: 'hebrew',
    glyph: 'א',
    labelKey: 'hbo',
    descKey: 'onboarding.hebrewDesc',
    font: 'font-hebrew',
  },
  {
    id: 'aramaic',
    glyph: 'ש',
    labelKey: 'arc',
    descKey: 'onboarding.aramaicDesc',
    font: 'font-hebrew',
  },
  {
    id: 'latin',
    glyph: 'L',
    labelKey: 'lat',
    descKey: 'onboarding.latinDesc',
    font: 'font-serif',
  },
  {
    id: 'syriac',
    glyph: 'ܐ',
    labelKey: 'syr',
    descKey: 'onboarding.syriacDesc',
    font: 'font-hebrew',
  },
  {
    id: 'coptic',
    glyph: 'ⲁ',
    labelKey: 'cop',
    descKey: 'onboarding.copticDesc',
    font: 'font-greek',
  },
  {
    id: 'hittite',
    glyph: '𒀭',
    labelKey: 'hit',
    descKey: 'onboarding.hittiteDesc',
    font: 'font-sans',
  },
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onComplete = () => navigate('/app');
  return (
    <div className="min-h-screen bg-parch text-ink flex items-center justify-center p-6 md:p-12 font-sans paper-texture">
      <div className="max-w-6xl w-full py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-12 h-12 border border-ink rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="font-serif text-2xl font-bold">P</span>
          </div>
          <h2 className="text-[40px] font-serif font-light tracking-tight mb-4 text-ink leading-none">
            {t('onboarding.title', 'Choose your corpus.')}
          </h2>
          <p className="font-body text-[16px] italic text-ink2 max-w-lg mx-auto">
            {t(
              'onboarding.subtitle',
              'Select your primary language of interest to begin your study of classical antiquity.'
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onComplete()}
              className="card p-6 flex items-start gap-5 hover:border-blue/30 transition-colors text-left group"
            >
              <div
                className={`w-14 h-14 bg-parch3 border border-bdr rounded flex items-center justify-center text-[26px] text-ink group-hover:text-blue transition-colors flex-shrink-0 ${lang.font}`}
              >
                {lang.glyph}
              </div>
              <div>
                <h3 className="font-serif text-[17px] font-medium mb-1.5 text-ink leading-tight">
                  {t(`languageNames.${lang.labelKey}`, 'Language')}
                </h3>
                <p className="font-body italic text-[13px] text-ink2 leading-relaxed">
                  {t(lang.descKey, 'Description...')}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
