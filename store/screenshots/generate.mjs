// Generates App Store / Play Store marketing screenshots for Paleoglossa.
// Renders 6 hero panels (CSS recreations of real app screens inside device frames
// on a branded navy gradient) into self-contained HTML, one file per (screen, platform).
// A companion shell loop captures each with headless Chrome at exact store dimensions.
//
//   node store/screenshots/generate.mjs
//
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------- palette */
const C = {
  parchment: '#F8F3E8',
  parchment2: '#F0E9D5',
  parchment3: '#E4D8BE',
  border: '#CFC0A0',
  ink: '#1A1410',
  ink2: '#3D3020',
  ink3: '#6B5C48',
  muted: '#7A6A52',
  blue: '#1E3D6E',
  blueXL: '#EEF3F8',
  gold: '#B8842A',
  jade: '#1E5C38',
  jadeXL: '#EBF5EE',
  amber: '#A06820',
  amberXL: '#FEF0D8',
  ruby: '#8C1C1C',
};

/* Each platform defines the output canvas and how much the intrinsic 1080x2280
   phone is scaled to fit. The phone content is authored once at a constant
   resolution, so both stores get pixel-identical UI, only the framing differs. */
const PLATFORMS = {
  'ios-6.7': { w: 1284, h: 2778, scale: 0.86, capTop: 120, capName: 'iPhone 6.7" (1284×2778)' },
  'ios-6.5': { w: 1242, h: 2688, scale: 0.86, capTop: 110, capName: 'iPhone 6.5" (1242×2688)' },
  android:   { w: 1080, h: 2400, scale: 0.72, capTop: 100, capName: 'Android phone (1080×2400)' },
};

const PHONE_W = 1080;
const PHONE_H = 2280;

/* --------------------------------------------------------------- captions */
const SCREENS = [
  { id: '01-reader',    accent: C.gold,  title: 'Read the ancient world,\nword by word', sub: 'Tap any word for lemma, morphology, gloss, and AI notes — without leaving the page.' },
  { id: '02-tutor',     accent: C.jade,  title: 'Your own\nphilology tutor',            sub: 'Six modes, from first declension to dissertation. Ask anything about any text.' },
  { id: '03-review',    accent: C.ruby,  title: 'Never\nforget a word',                 sub: 'FSRS-5 spaced repetition schedules every word you meet at the perfect moment.' },
  { id: '04-library',   accent: C.blue,  title: 'A library\nof the classics',           sub: 'The Iliad, the Greek New Testament, the Aeneid, Gilgamesh — and dozens more.' },
  { id: '05-audio',     accent: C.amber, title: 'Hear it the\nway it sounded',          sub: 'Restored, Erasmian, and modern traditions with audio, IPA, and your own recordings.' },
  { id: '06-languages', accent: C.gold,  title: 'Eleven\nancient languages',            sub: 'Greek · Latin · Hebrew · Syriac · Coptic · Sanskrit · Akkadian · and more.' },
];

/* ------------------------------------------------------------------ fonts */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@300;400;500&family=Noto+Serif+Hebrew:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;500;600&family=Noto+Sans+Coptic&family=Noto+Sans+Syriac&family=Noto+Sans+Egyptian+Hieroglyphs&family=Noto+Sans+Cuneiform&display=swap');`;

/* ------------------------------------------------------------ shared CSS */
function css(p) {
  const ios = p.kind === 'ios';
  return `
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
html,body{width:${p.w}px;height:${p.h}px;overflow:hidden}
body{
  font-family:'Crimson Pro',Georgia,serif;
  background:
    radial-gradient(120% 80% at 18% 0%, rgba(184,132,42,.16), transparent 55%),
    radial-gradient(130% 90% at 100% 100%, rgba(30,92,56,.18), transparent 50%),
    linear-gradient(168deg, #16294a 0%, #1E3D6E 46%, #102339 100%);
  position:relative;
}
/* faint manuscript-rule texture over the whole canvas */
body::after{
  content:'';position:absolute;inset:0;pointer-events:none;opacity:.05;
  background-image:repeating-linear-gradient(0deg, transparent 0 46px, rgba(255,255,255,.6) 46px 47px);
}
.stage{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;z-index:2}

/* ---- marketing caption ---- */
.cap{width:100%;text-align:center;padding:${p.capTop}px 96px 0}
.kicker{
  font-family:'DM Mono',monospace;font-weight:500;font-size:26px;letter-spacing:.42em;
  text-transform:uppercase;color:rgba(248,243,232,.62);margin-bottom:30px;
}
.title{
  font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;
  font-size:98px;line-height:.99;color:#FBF7EE;letter-spacing:-.01em;
  white-space:pre-line;text-shadow:0 2px 30px rgba(0,0,0,.28);
}
.rule{width:84px;height:5px;border-radius:5px;margin:42px auto 34px;background:var(--accent)}
.sub{
  font-family:'Crimson Pro',Georgia,serif;font-weight:400;font-size:39px;line-height:1.36;
  color:rgba(244,238,226,.82);max-width:860px;margin:0 auto;
}

/* ---- device frame ---- */
.stand{flex:1;display:flex;align-items:center;justify-content:center;width:100%;min-height:0}
.phone-fit{transform:scale(${p.scale});transform-origin:center}
${ios ? `
/* iPhone 17 Pro Max — natural-titanium rail, ultra-thin uniform bezel, Dynamic Island */
.phone{
  width:${PHONE_W}px;height:${PHONE_H}px;border-radius:128px;position:relative;
  padding:7px; /* titanium rail thickness */
  background:linear-gradient(135deg,#e6e7ea 0%,#a9abae 16%,#cfd1d4 32%,#86888c 52%,#dadce0 70%,#9b9da1 86%,#bfc1c4 100%);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.5) inset,
    0 80px 130px -40px rgba(0,0,0,.62),
    0 34px 64px -30px rgba(0,0,0,.5);
}
.bezel{
  width:100%;height:100%;border-radius:121px;background:#08080a;padding:17px; /* thin black bezel */
  box-shadow:0 0 0 1.5px #2a2b2e inset;
}
.screen::before{ /* Dynamic Island */
  content:'';position:absolute;top:30px;left:50%;transform:translateX(-50%);
  width:248px;height:42px;border-radius:24px;background:#040405;z-index:40;
  box-shadow:0 0 0 1px rgba(255,255,255,.04) inset;
}
/* titanium side buttons */
.btn{position:absolute;background:linear-gradient(90deg,#c7c9cc,#85878b);border-radius:5px;z-index:5;
  box-shadow:0 2px 4px rgba(0,0,0,.4)}
.btn-l{left:-5px}.btn-r{right:-5px}
.b-action{top:392px;width:8px;height:78px}                /* Action button */
.b-vup{top:520px;width:8px;height:150px}                  /* Volume up */
.b-vdn{top:700px;width:8px;height:150px}                  /* Volume down */
.b-power{top:560px;width:8px;height:230px}                /* Side button */
.b-cam{top:840px;width:8px;height:120px;border-radius:6px} /* Camera Control */
` : `
/* Android phone — slim aluminium frame, centered punch-hole camera */
.phone{
  width:${PHONE_W}px;height:${PHONE_H}px;border-radius:96px;position:relative;
  padding:6px;
  background:linear-gradient(140deg,#3a3b3f,#161719 40%,#2c2d31 70%,#101113);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.06) inset,
    0 80px 130px -40px rgba(0,0,0,.62),
    0 34px 64px -30px rgba(0,0,0,.5);
}
.bezel{
  width:100%;height:100%;border-radius:90px;background:#050506;padding:13px; /* uniform thin bezel */
}
.screen::before{ /* punch-hole front camera */
  content:'';position:absolute;top:30px;left:50%;transform:translateX(-50%);
  width:34px;height:34px;border-radius:50%;background:#040405;z-index:40;
  box-shadow:0 0 0 2px rgba(0,0,0,.6);
}
.btn{position:absolute;background:linear-gradient(90deg,#46474b,#1d1e20);border-radius:4px;z-index:5}
.btn-r{right:-4px}.btn-l{display:none}
.b-power{top:560px;width:7px;height:150px}
.b-vup{top:380px;width:7px;height:150px}
.b-vdn{display:none}.b-action{display:none}.b-cam{display:none}
`}
.screen{
  width:100%;height:100%;border-radius:${ios ? '104px' : '78px'};overflow:hidden;position:relative;
  background:${C.parchment};
  background-image:
    radial-gradient(150% 120% at 50% -10%, #FCF8EF 0%, #F8F3E8 42%, #F1E9D6 100%);
  display:flex;flex-direction:column;
  font-size:30px;color:${C.ink};
}

/* status bar */
.status{height:96px;flex:0 0 auto;display:flex;align-items:flex-end;justify-content:space-between;
  padding:0 58px 14px;font-family:'DM Mono',monospace;font-weight:500;font-size:30px;color:${C.ink2}}
.status .dots{display:flex;gap:9px;align-items:center}
.status .dots i{width:13px;height:13px;border-radius:50%;background:${C.ink2};display:block}
.status .batt{width:46px;height:24px;border:2.5px solid ${C.ink2};border-radius:6px;position:relative}
.status .batt::after{content:'';position:absolute;left:3px;top:3px;bottom:3px;width:30px;background:${C.ink2};border-radius:2px}

/* app bar */
.appbar{flex:0 0 auto;display:flex;align-items:center;gap:24px;padding:18px 52px 26px}
.appbar .ico{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;
  background:${C.parchment2};border:1.5px solid ${C.border};font-size:38px;color:${C.ink2}}
.appbar .ttl{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:46px;color:${C.ink};line-height:1}
.appbar .meta{font-family:'DM Mono',monospace;font-size:24px;color:${C.muted};letter-spacing:.06em;margin-top:6px}
.appbar .spacer{flex:1}
.chip{font-family:'DM Mono',monospace;font-size:24px;letter-spacing:.05em;padding:11px 22px;border-radius:999px;
  background:${C.blueXL};color:${C.blue};border:1.5px solid rgba(30,61,110,.22);white-space:nowrap}

.body{flex:1;min-height:0;padding:8px 56px 0;overflow:hidden}

/* knowledge-state word styling (reader) */
.kn-known{color:${C.jade}}
.kn-learn{color:${C.amber};border-bottom:3px solid rgba(160,104,32,.4)}
.kn-new{border-bottom:3px solid rgba(30,61,110,.45)}
.kn-focus{background:${C.gold};color:#fff;border-radius:10px;padding:2px 12px;box-shadow:0 8px 22px -8px rgba(184,132,42,.8)}

/* generic card */
.card{background:#FCF9F1;border:1.5px solid ${C.border};border-radius:34px;
  box-shadow:0 30px 50px -34px rgba(35,20,10,.4), 0 1px 0 rgba(255,255,255,.7) inset}

/* home indicator */
.homebar{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);
  width:300px;height:11px;border-radius:11px;background:rgba(26,20,16,.35);z-index:30}
`;
}

/* =============================================================== screens */

/* 1 — Reader with word popover */
function reader() {
  const w = (t, c) => c ? `<span class="${c}">${t}</span>` : t;
  return `
  ${appbar('‹', 'Iliad', 'Book Α · line 1', 'Ancient Greek')}
  <div class="body" style="font-family:'Cormorant Garamond',serif;display:flex;flex-direction:column;padding-top:18px">
    <div style="font-size:52px;line-height:1.6;letter-spacing:.005em;color:${C.ink}">
      ${w('μῆνιν','kn-focus')} ${w('ἄειδε','kn-known')} ${w('θεὰ','kn-known')} ${w('Πηληϊάδεω','kn-new')}
      ${w('Ἀχιλῆος','kn-learn')} ${w('οὐλομένην','kn-new')}, ${w('ἣ','kn-known')} ${w('μυρί᾽','kn-learn')}
      ${w('Ἀχαιοῖς','kn-known')} ${w('ἄλγε᾽','kn-new')} ${w('ἔθηκε','kn-learn')},
      ${w('πολλὰς','kn-known')} ${w('δ᾽','kn-known')} ${w('ἰφθίμους','kn-new')} ${w('ψυχὰς','kn-learn')}
      ${w('Ἄϊδι','kn-new')} ${w('προΐαψεν','kn-new')} ${w('ἡρώων','kn-learn')}, ${w('αὐτοὺς','kn-known')}
      ${w('δὲ','kn-known')} ${w('ἑλώρια','kn-new')} ${w('τεῦχε','kn-learn')} ${w('κύνεσσιν','kn-new')}
    </div>
    <!-- word inspector popover -->
    <div class="card" style="margin-top:46px;padding:42px 46px">
      <div style="display:flex;align-items:baseline;gap:24px">
        <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:68px;color:${C.gold};line-height:1">μῆνιν</div>
        <div style="font-family:'DM Mono',monospace;font-size:25px;color:${C.muted};letter-spacing:.06em">/ˈmɛː.nin/</div>
      </div>
      <div style="font-size:36px;color:${C.ink2};margin-top:14px;font-style:italic">wrath, rage, fury — the proem's first word</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:30px">
        ${tag('noun')}${tag('accusative')}${tag('singular')}${tag('feminine')}
      </div>
      <div style="height:1.5px;background:${C.border};margin:32px 0 26px"></div>
      <div style="display:flex;justify-content:space-between;font-size:30px;color:${C.ink3}">
        <span>lemma <b style="font-family:'Cormorant Garamond',serif;font-weight:600;color:${C.ink}">μῆνις</b></span>
        <span style="color:${C.blue};font-family:'DM Mono',monospace;font-size:25px;letter-spacing:.05em">✦ AI note</span>
      </div>
      <div style="font-size:31px;line-height:1.4;color:${C.ink2};margin-top:18px">
        Direct object of <i>ἄειδε</i> — Homer front-loads the theme: it is the <i>wrath</i> that is sung.
      </div>
    </div>
  </div>
  ${navfoot()}`;
}

/* 2 — AI Philology Tutor chat */
function tutor() {
  return `
  ${appbar('‹', 'Philology Tutor', 'Iliad Α.1 · Scholar mode', 'Gemini')}
  <div class="body" style="display:flex;flex-direction:column">
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 30px">
      ${modepill('Beginner')}${modepill('Grammar')}${modepill('Seminary')}${modepill('Scholar',true)}
    </div>
    <!-- user -->
    <div style="align-self:flex-end;max-width:74%;background:${C.blue};color:#FBF7EE;
      border-radius:34px 34px 10px 34px;padding:30px 38px;font-size:33px;line-height:1.35;
      box-shadow:0 22px 40px -26px rgba(30,61,110,.7)">
      Why is <span style="font-family:'Cormorant Garamond',serif;font-style:italic">μῆνιν</span> accusative here, not nominative?
    </div>
    <!-- AI -->
    <div class="card" style="align-self:flex-start;max-width:82%;margin-top:30px;padding:36px 40px;
      border-radius:34px 34px 34px 10px">
      <div style="font-family:'DM Mono',monospace;font-size:23px;letter-spacing:.16em;text-transform:uppercase;color:${C.jade};margin-bottom:20px">✦ Tutor</div>
      <div style="font-size:33px;line-height:1.46;color:${C.ink}">
        Because it is the <b>direct object</b> of the imperative <i style="font-family:'Cormorant Garamond',serif">ἄειδε</i> ("sing!").
        Homer opens with the object for emphasis — the poem is <i>about</i> the wrath.
      </div>
      <div style="margin-top:26px;padding:24px 30px;background:${C.amberXL};border-left:6px solid ${C.amber};border-radius:14px;
        font-size:30px;line-height:1.4;color:${C.ink2}">
        <b style="font-family:'Cormorant Garamond',serif">μῆνις</b> → acc. sg. <b>μῆνιν</b>. A 3rd-declension feminine i-stem.
      </div>
    </div>
    <div style="flex:1"></div>
    <div style="font-family:'DM Mono',monospace;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted};margin-bottom:18px">Follow up</div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:26px">
      <span style="font-size:29px;padding:16px 26px;border-radius:18px;background:${C.jadeXL};color:${C.jade};border:1.5px solid rgba(30,92,56,.25)">Decline μῆνις in full</span>
      <span style="font-size:29px;padding:16px 26px;border-radius:18px;background:${C.jadeXL};color:${C.jade};border:1.5px solid rgba(30,92,56,.25)">Why the long ῆ?</span>
      <span style="font-size:29px;padding:16px 26px;border-radius:18px;background:${C.jadeXL};color:${C.jade};border:1.5px solid rgba(30,92,56,.25)">Scan this line</span>
    </div>
    <div class="card" style="display:flex;align-items:center;gap:22px;padding:26px 34px;border-radius:999px;margin-bottom:18px">
      <span style="flex:1;font-size:31px;color:${C.muted};font-style:italic">Ask about this passage…</span>
      <span style="width:70px;height:70px;border-radius:50%;background:${C.jade};color:#fff;display:grid;place-items:center;font-size:36px">➤</span>
    </div>
  </div>
  ${homeOnly()}`;
}

/* 3 — Spaced-repetition review card */
function review() {
  const rate = (t, c) => `<div style="flex:1;text-align:center;padding:28px 0;border-radius:22px;background:${c}1a;
    color:${c};border:2px solid ${c}55;font-family:'DM Mono',monospace;font-size:27px;letter-spacing:.04em">
    ${t}</div>`;
  return `
  ${appbar('‹', 'Review', '12 due today', '🔥 47-day streak')}
  <div class="body" style="display:flex;flex-direction:column">
    <!-- progress -->
    <div style="display:flex;align-items:center;gap:20px;margin:6px 0 40px">
      <div style="flex:1;height:16px;border-radius:16px;background:${C.parchment3};overflow:hidden">
        <div style="width:34%;height:100%;background:linear-gradient(90deg,${C.gold},${C.amber})"></div>
      </div>
      <span style="font-family:'DM Mono',monospace;font-size:26px;color:${C.muted}">4 / 12</span>
    </div>
    <div class="card" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 50px;text-align:center">
      <div style="font-family:'DM Mono',monospace;font-size:24px;letter-spacing:.2em;text-transform:uppercase;color:${C.muted};margin-bottom:40px">Recall the meaning</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:128px;color:${C.ink};line-height:1">ἄειδε</div>
      <div style="font-family:'DM Mono',monospace;font-size:27px;color:${C.muted};margin-top:18px;letter-spacing:.05em">/ˈáːeide/</div>
      <div style="width:90px;height:3px;background:${C.border};margin:46px 0"></div>
      <div style="font-size:50px;font-style:italic;color:${C.jade};font-family:'Cormorant Garamond',serif">sing! &nbsp;·&nbsp; pres. imperative</div>
      <div style="font-size:31px;color:${C.ink3};margin-top:16px">2nd sg. of <b style="font-family:'Cormorant Garamond',serif">ἀείδω</b></div>
    </div>
    <div style="display:flex;gap:18px;margin-top:34px">
      ${rate('Again', C.ruby)}${rate('Hard', C.amber)}${rate('Good', C.blue)}${rate('Easy', C.jade)}
    </div>
    <div style="text-align:center;font-size:28px;color:${C.muted};margin-top:24px">+15 XP &nbsp;·&nbsp; next review in 6 days</div>
  </div>
  ${homeOnly()}`;
}

/* 4 — Library grid */
function library() {
  const item = (title, author, lang, script, cov, col) => `
    <div class="card" style="padding:34px 32px;display:flex;flex-direction:column;gap:0">
      <div style="font-family:'Cormorant Garamond',serif;font-size:48px;color:${col};line-height:1.05;height:104px;overflow:hidden">${script}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:40px;color:${C.ink};margin-top:14px;line-height:1.05">${title}</div>
      <div style="font-size:28px;color:${C.muted};margin-top:6px">${author}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:22px">
        <span class="chip" style="background:${C.parchment2};color:${C.ink2};border-color:${C.border}">${lang}</span>
        <span style="font-family:'DM Mono',monospace;font-size:23px;color:${C.jade}">${cov}</span>
      </div>
    </div>`;
  return `
  ${appbar('☰', 'Library', '60+ curated texts', 'All languages')}
  <div class="body">
    <div style="display:flex;gap:14px;margin:4px 0 30px;flex-wrap:wrap">
      ${modepill('All',true)}${modepill('Greek')}${modepill('Latin')}${modepill('Hebrew')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px">
      ${item('Iliad','Homer','Ancient Greek','μῆνιν ἄειδε θεὰ','● 98%',C.blue)}
      ${item('Aeneid','Vergil','Classical Latin','Arma virumque cano','● 95%',C.ruby)}
      ${item('Gospel of John','SBLGNT','Koine Greek','Ἐν ἀρχῇ ἦν ὁ λόγος','● full',C.jade)}
      ${item('Genesis','OSHB','Biblical Hebrew','בְּרֵאשִׁית בָּרָא','● full',C.amber)}
      ${item('Bhagavad Gītā','Vyāsa','Sanskrit','धर्मक्षेत्रे कुरु','● 70%',C.blue)}
      ${item('Gilgamesh','Sîn-lēqi','Akkadian','𒅅𒁉 𒈠 𒅗','● 60%',C.gold)}
    </div>
  </div>
  ${navfoot()}`;
}

/* 5 — Pronunciation / AudioLab */
function audio() {
  const bars = Array.from({length:46}, (_,i)=>{
    const base = Math.abs(Math.sin(i*0.7))*0.7 + Math.abs(Math.cos(i*0.31))*0.3;
    const h = 12 + Math.round(base*150);
    const on = i < 24;
    return `<span style="display:inline-block;width:11px;height:${h}px;border-radius:6px;
      background:${on?C.gold:C.parchment3}"></span>`;
  }).join('');
  return `
  ${appbar('‹', 'Pronunciation', 'Iliad Α.1', 'AudioLab')}
  <div class="body" style="display:flex;flex-direction:column;justify-content:center">
    <div class="card" style="padding:54px 48px;text-align:center;margin-top:10px">
      <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:120px;color:${C.ink};line-height:1">μῆνιν</div>
      <div style="font-family:'DM Mono',monospace;font-size:38px;color:${C.amber};margin-top:18px;letter-spacing:.04em">[ ˈmɛ̂ː.nin ]</div>
    </div>
    <div style="display:flex;gap:14px;justify-content:center;margin:38px 0 30px;flex-wrap:wrap">
      ${modepill('Restored',true)}${modepill('Erasmian')}${modepill('Modern')}
    </div>
    <div class="card" style="padding:46px 44px">
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;height:172px">${bars}</div>
      <div style="display:flex;align-items:center;gap:30px;margin-top:42px">
        <span style="width:108px;height:108px;border-radius:50%;background:${C.amber};color:#fff;
          display:grid;place-items:center;font-size:50px;box-shadow:0 20px 40px -16px ${C.amber}">▶</span>
        <div style="flex:1">
          <div style="height:12px;border-radius:12px;background:${C.parchment3};overflow:hidden">
            <div style="width:52%;height:100%;background:${C.amber}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:23px;color:${C.muted};margin-top:12px">
            <span>0:01</span><span>0:02</span>
          </div>
        </div>
        <span style="width:96px;height:96px;border-radius:50%;background:${C.rubyXL||'#F7E9E9'};color:${C.ruby};
          border:2.5px solid ${C.ruby}55;display:grid;place-items:center;font-size:42px">●</span>
      </div>
    </div>
    <div style="text-align:center;font-size:30px;color:${C.ink3};margin-top:34px;font-style:italic">
      Record yourself, then compare against the model voice.
    </div>
  </div>
  ${homeOnly()}`;
}

/* 6 — Languages showcase */
function languages() {
  const row = (glyph, gfont, name, era, col) => `
    <div class="card" style="display:flex;align-items:center;gap:30px;padding:30px 36px">
      <div style="width:108px;height:108px;border-radius:26px;flex:0 0 auto;display:grid;place-items:center;
        background:${col}14;border:1.5px solid ${col}40;font-family:${gfont};font-size:62px;color:${col}">${glyph}</div>
      <div style="flex:1">
        <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:46px;color:${C.ink};line-height:1">${name}</div>
        <div style="font-family:'DM Mono',monospace;font-size:25px;color:${C.muted};margin-top:8px;letter-spacing:.03em">${era}</div>
      </div>
    </div>`;
  const G = "'Cormorant Garamond',serif";
  return `
  ${appbar('☰', 'Languages', '11 available', '+ imports')}
  <div class="body" style="display:flex;flex-direction:column;justify-content:center;gap:26px;padding-top:14px">
    ${row('Ἀ', G, 'Ancient & Koine Greek', 'c. 1500 BC – AD 300', C.blue)}
    ${row('א', "'Noto Serif Hebrew',serif", 'Biblical Hebrew & Aramaic', 'c. 1000 BC – AD 100', C.amber)}
    ${row('R', G, 'Classical Latin', 'c. 75 BC – AD 300', C.ruby)}
    ${row('अ', "'Noto Serif Devanagari',serif", 'Sanskrit', 'c. 1500 BC – present', C.jade)}
    ${row('ⲁ', "'Noto Sans Coptic',serif", 'Coptic & Syriac', '2nd c. AD onward', C.gold)}
    ${row('𒀭', "'Noto Sans Cuneiform',serif", 'Akkadian & Hittite', 'c. 2500 – 100 BC', C.blue)}
    ${row('𓂀', "'Noto Sans Egyptian Hieroglyphs',serif", 'Egyptian Hieroglyphs', 'c. 3200 BC – AD 400', C.amber)}
  </div>
  ${homeOnly()}`;
}

/* ----------------------------------------------------------- UI helpers */
function statusbar() {
  return `<div class="status"><span>9:41</span>
    <span class="dots"><i></i><i></i><i></i>&nbsp;<span style="font-size:24px">5G</span>
      <span class="batt"></span></span></div>`;
}
function appbar(left, title, meta, chip) {
  return `${statusbar()}
  <div class="appbar">
    <div class="ico">${left}</div>
    <div><div class="ttl">${title}</div><div class="meta">${meta}</div></div>
    <div class="spacer"></div>
    <div class="chip">${chip}</div>
  </div>`;
}
function tag(t){return `<span style="font-family:'DM Mono',monospace;font-size:25px;padding:9px 20px;border-radius:999px;
  background:${C.jadeXL};color:${C.jade};border:1.5px solid rgba(30,92,56,.25)">${t}</span>`;}
function modepill(t, on){return `<span style="font-family:'DM Mono',monospace;font-size:26px;padding:13px 28px;border-radius:999px;
  ${on?`background:${C.blue};color:#FBF7EE`:`background:${C.parchment2};color:${C.ink3};border:1.5px solid ${C.border}`}">${t}</span>`;}
function navfoot(){
  const it=(g,t,on)=>`<div style="flex:1;text-align:center;color:${on?C.blue:C.muted}">
    <div style="font-size:40px">${g}</div>
    <div style="font-family:'DM Mono',monospace;font-size:21px;margin-top:4px;letter-spacing:.04em">${t}</div></div>`;
  return `<div style="flex:0 0 auto;display:flex;padding:26px 40px 70px;border-top:1.5px solid ${C.border};background:#FCF9F1">
    ${it('❦','Read',true)}${it('✦','Tutor')}${it('↻','Review')}${it('▤','Library')}</div>
    <div class="homebar"></div>`;
}
function homeOnly(){return `<div style="height:60px;flex:0 0 auto"></div><div class="homebar"></div>`;}

const RENDER = { '01-reader':reader, '02-tutor':tutor, '03-review':review, '04-library':library, '05-audio':audio, '06-languages':languages };

/* ------------------------------------------------------------------ emit */
// manifest consumed by capture.sh: "<dir> <width> <height>" per line
writeFileSync(join(ROOT, '.sizes'),
  Object.entries(PLATFORMS).map(([k, p]) => `${k} ${p.w} ${p.h}`).join('\n') + '\n');

let count = 0;
for (const [pk, p] of Object.entries(PLATFORMS)) {
  p.kind = pk.startsWith('ios') ? 'ios' : 'android';
  const dir = join(ROOT, pk);
  mkdirSync(dir, { recursive: true });
  for (const s of SCREENS) {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<style>:root{--accent:${s.accent}}${css(p)}</style></head>
<body><div class="stage">
  <div class="cap">
    <div class="kicker">Paleoglossa</div>
    <h1 class="title">${s.title}</h1>
    <div class="rule"></div>
    <p class="sub">${s.sub}</p>
  </div>
  <div class="stand"><div class="phone-fit"><div class="phone">
    <span class="btn btn-l b-action"></span><span class="btn btn-l b-vup"></span><span class="btn btn-l b-vdn"></span>
    <span class="btn btn-r b-power"></span><span class="btn btn-r b-cam"></span>
    <div class="bezel"><div class="screen">
    ${RENDER[s.id]()}
  </div></div></div></div></div>
</div></body></html>`;
    writeFileSync(join(dir, `${s.id}.html`), html);
    count++;
  }
}
console.log(`Wrote ${count} HTML panels to ${ROOT}/{ios,android}`);
