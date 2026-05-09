import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const languages = [
  {
    id: "hieroglyphs",
    glyph: "𓊹",
    label: "Egyptian Hieroglyphs",
    desc: "The sacred writing of the Pharaohs and ancient Egypt.",
    font: "font-sans",
  },
  {
    id: "akkadian",
    glyph: "𒀀",
    label: "Akkadian",
    desc: "The language of ancient Mesopotamia, written in cuneiform.",
    font: "font-sans",
  },
  {
    id: "sanskrit",
    glyph: "ॐ",
    label: "Vedic Sanskrit",
    desc: "The language of the Vedas, Upanishads, and ancient India.",
    font: "font-sans",
  },
  {
    id: "greek",
    glyph: "Ω",
    label: "Ancient Greek",
    desc: "The language of Homer, Plato, and classical Athens.",
    font: "font-greek",
  },
  {
    id: "koine",
    glyph: "Α",
    label: "Koine Greek",
    desc: "The common language of the Hellenistic world and New Testament.",
    font: "font-greek",
  },
  {
    id: "hebrew",
    glyph: "א",
    label: "Biblical Hebrew",
    desc: "The language of the Torah, Prophets, and ancient Israel.",
    font: "font-hebrew",
  },
  {
    id: "aramaic",
    glyph: "ש",
    label: "Aramaic",
    desc: "The lingua franca of the ancient Near East.",
    font: "font-hebrew",
  },
  {
    id: "latin",
    glyph: "L",
    label: "Classical Latin",
    desc: "The language of Virgil, Cicero, and the Roman Empire.",
    font: "font-serif",
  },
  {
    id: "syriac",
    glyph: "ܐ",
    label: "Classical Syriac",
    desc: "The language of the Peshitta and Eastern Christianity.",
    font: "font-hebrew",
  },
  {
    id: "coptic",
    glyph: "ⲁ",
    label: "Coptic",
    desc: "The final stage of the Egyptian language.",
    font: "font-greek",
  },
  {
    id: "hittite",
    glyph: "𒀭",
    label: "Hittite",
    desc: "The oldest attested Indo-European language.",
    font: "font-sans",
  },
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const onComplete = (_lang: string) => navigate("/app");
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
            Choose your corpus.
          </h2>
          <p className="font-body text-[16px] italic text-ink2 max-w-lg mx-auto">
            Select your primary language of interest to begin your study of
            classical antiquity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onComplete(lang.id)}
              className="card p-6 flex items-start gap-5 hover:border-blue/30 transition-colors text-left group"
            >
              <div
                className={`w-14 h-14 bg-parch3 border border-bdr rounded flex items-center justify-center text-[26px] text-ink group-hover:text-blue transition-colors flex-shrink-0 ${lang.font}`}
              >
                {lang.glyph}
              </div>
              <div>
                <h3 className="font-serif text-[17px] font-medium mb-1.5 text-ink leading-tight">
                  {lang.label}
                </h3>
                <p className="font-body italic text-[13px] text-ink2 leading-relaxed">
                  {lang.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
