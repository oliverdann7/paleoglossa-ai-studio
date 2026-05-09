const greekMap: Record<string, string> = {'α':'a', 'β':'b', 'γ':'g', 'δ':'d', 'ε':'e', 'ζ':'z', 'η':'e', 'θ':'th', 'ι':'i', 'κ':'k', 'λ':'l', 'μ':'m', 'ν':'n', 'ξ':'ks', 'ο':'o', 'π':'p', 'ρ':'r', 'σ':'s', 'ς':'s', 'τ':'t', 'υ':'y', 'φ':'ph', 'χ':'ch', 'ψ':'ps', 'ω':'o', 'Α':'A', 'Β':'B', 'Γ':'G', 'Δ':'D', 'Ε':'E', 'Ζ':'Z', 'Η':'E', 'Θ':'Th', 'Ι':'I', 'Κ':'K', 'Λ':'L', 'Μ':'M', 'Ν':'N', 'Ξ':'Ks', 'Ο':'O', 'Π':'P', 'Ρ':'R', 'Σ':'S', 'Τ':'T', 'Υ':'Y', 'Φ':'Ph', 'Χ':'Ch', 'Ψ':'Ps', 'Ω':'O'};
const hebrewMap: Record<string, string> = {'א':'', 'ב':'b', 'ג':'g', 'ד':'d', 'ה':'h', 'ו':'v', 'ז':'z', 'ח':'ch', 'ט':'t', 'י':'y', 'כ':'k', 'ך':'k', 'ל':'l', 'מ':'m', 'ם':'m', 'נ':'n', 'ן':'n', 'ס':'s', 'ע':'', 'פ':'p', 'ף':'p', 'צ':'ts', 'ץ':'ts', 'ק':'q', 'ר':'r', 'ש':'sh', 'ת':'t', 'ּ':'', 'ְ':'', 'ֱ':'e', 'ֲ':'a', 'ֳ':'o', 'ִ':'i', 'ֵ':'e', 'ֶ':'e', 'ַ':'a', 'ָ':'a', 'ֹ':'o', 'ֻ':'u', 'ׁ':'sh', 'ׂ':'s'};
const syriacMap: Record<string, string> = {'ܐ':'', 'ܒ':'b', 'ܓ':'g', 'ܕ':'d', 'ܗ':'h', 'ܘ':'w', 'ܙ':'z', 'ܚ':'ch', 'ܛ':'t', 'ܝ':'y', 'ܟ':'k', 'ܠ':'l', 'ܡ':'m', 'ܢ':'n', 'ܣ':'s', 'ܥ':'', 'ܦ':'p', 'ܨ':'ts', 'ܩ':'q', 'ܪ':'r', 'ܫ':'sh', 'ܬ':'t'};
const copticMap: Record<string, string> = {'ⲁ':'a', 'ⲃ':'b', 'ⲅ':'g', 'ⲇ':'d', 'ⲉ':'e', 'ⲍ':'z', 'ⲏ':'e', 'ⲑ':'th', 'ⲓ':'i', 'ⲕ':'k', 'ⲗ':'l', 'ⲙ':'m', 'ⲛ':'n', 'ⲝ':'ks', 'ⲟ':'o', 'ⲡ':'p', 'ⲣ':'r', 'ⲥ':'s', 'ⲧ':'t', 'ⲩ':'u', 'ⲫ':'ph', 'ⲭ':'ch', 'ⲯ':'ps', 'ⲱ':'o', 'ϣ':'sh', 'ϥ':'f', 'ϧ':'kh', 'ϩ':'h', 'ϫ':'j', 'ϭ':'ch', 'ϯ':'ti'};

export function getTransliteration(word: string, lang: string, normalized?: string): string {
   if (!word) return "";
   if (lang === 'san' || lang === 'akk') {
       return normalized ? normalized : word;
   }
   if (lang === 'lat' || lang === 'en' || lang === 'es' || lang === 'fr') {
       return word.toLowerCase();
   }

   let res = '';
   for(let char of word) {
      if(lang === 'grc' || lang === 'grc-koine') {
         res += greekMap[char] || char;
      } else if (lang === 'hbo' || lang === 'Biblical Hebrew') {
         res += hebrewMap[char] || char;
      } else if (lang === 'syr' || lang === 'arc') {
         res += syriacMap[char] || char;
      } else if (lang === 'cop') {
         res += copticMap[char] || char;
      } else {
         res += char;
      }
   }
   return res.toLowerCase();
}
