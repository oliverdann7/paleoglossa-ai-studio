import { motion } from 'motion/react';

const languages = [
  { id: 'hieroglyphs', glyph: '𓊹', label: 'Egyptian Hieroglyphs', desc: 'The sacred writing of the Pharaohs and ancient Egypt.' },
  { id: 'sanskrit', glyph: 'ॐ', label: 'Vedic Sanskrit', desc: 'The language of the Vedas, Upanishads, and ancient India.' },
  { id: 'greek', glyph: 'Ω', label: 'Ancient Greek', desc: 'The language of Homer, Plato, and the New Testament.' },
  { id: 'hebrew', glyph: 'א', label: 'Biblical Hebrew', desc: 'The language of the Torah, Prophets, and ancient Israel.' },
  { id: 'latin', glyph: 'L', label: 'Classical Latin', desc: 'The language of Virgil, Cicero, and the Roman Empire.' },
  { id: 'syriac', glyph: 'ܐ', label: 'Classical Syriac', desc: 'The language of the Peshitta and Eastern Christianity.' },
  { id: 'hittite', glyph: '𒀭', label: 'Hittite', desc: 'The oldest attested Indo-European language.' }
];

export const Onboarding = ({ onComplete }: { onComplete: (lang: string) => void }) => {
  return (
    <div className="min-h-screen bg-vellum-50 dark:bg-obsidian-950 flex items-center justify-center p-12">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl font-serif font-bold tracking-tight mb-6">Choose your path.</h2>
          <p className="text-obsidian-900/40 dark:text-vellum-100/40 max-w-md mx-auto font-medium">
            Select your primary language of interest to begin your journey into the ancient world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onComplete(lang.id)}
              className="group p-8 rounded-[32px] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-gold-500/40 transition-all duration-500 text-left premium-shadow hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center text-3xl font-serif font-bold text-gold-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                {lang.glyph}
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">{lang.label}</h3>
              <p className="text-sm text-obsidian-900/40 dark:text-vellum-100/40 leading-relaxed font-medium">
                {lang.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
