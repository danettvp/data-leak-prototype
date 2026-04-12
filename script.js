/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
const QS = [
  {
    text: "When you post something, what matters most to you?",
    sub: "Your instinct in the moment — not the ideal answer.",
    opts: [
      { t: "How it looks",                    v: 2, tag: "Curated"    },
      { t: "How it will be perceived",        v: 3, tag: "Conscious"  },
      { t: "Who will see it",                 v: 4, tag: "Selective"  },
      { t: "Posting it quickly",              v: 1, tag: "Impulsive"  },
      { t: "I don't think too much about it", v: 2, tag: "Relaxed"    },
    ],
    fact: "The average person generates 1.7MB of data every second — most of it without realising."
  },
  {
    text: "When an app asks for permissions, what do you do?",
    sub: "Location, contacts, camera — that kind of thing.",
    opts: [
      { t: "Accept straight away",          v: 4, tag: "Open"       },
      { t: "Skim quickly, then accept",     v: 3, tag: "Casual"     },
      { t: "Decide case by case",           v: 2, tag: "Considered" },
      { t: "Read everything carefully",     v: 1, tag: "Cautious"   },
      { t: "Try to avoid it altogether",    v: 1, tag: "Resistant"  },
    ],
    fact: "Location data can reveal your home, workplace, religion, and relationships — even without a name attached."
  },
  {
    text: "When an online recommendation feels a little too accurate, how do you respond?",
    sub: "That ad that knew. The suggestion that felt personal.",
    opts: [
      { t: "Ignore it",                          v: 1, tag: "Unbothered" },
      { t: "Notice it, then move on",            v: 2, tag: "Aware"      },
      { t: "Get curious — retrace how it knew",  v: 3, tag: "Inquisitive"},
      { t: "Feel genuinely uncomfortable",       v: 4, tag: "Uneasy"     },
      { t: "Don't mind — it's convenient",       v: 1, tag: "Accepting"  },
    ],
    fact: "Ad platforms can infer your mental health, financial stress, and relationships from browsing patterns alone."
  },
  {
    text: "When you stop using a platform, what do you think happens to your data?",
    sub: "The account goes dormant — but does the data?",
    opts: [
      { t: "It probably just stays there",    v: 3, tag: "Resigned"  },
      { t: "It might get removed over time",  v: 1, tag: "Hopeful"   },
      { t: "It depends on the platform",      v: 2, tag: "Pragmatic" },
      { t: "I don't really think about that", v: 4, tag: "Unaware"   },
    ],
    fact: "In 2023 alone, over 4 billion records were exposed in data breaches. Most users were never directly notified."
  },
  {
    text: "How much do you trust online platforms with your personal data?",
    sub: "Your honest gut feeling.",
    opts: [
      { t: "More than I probably should",    v: 4, tag: "Trusting"  },
      { t: "I generally trust them",         v: 3, tag: "Open"      },
      { t: "I'm careful about what I share", v: 2, tag: "Guarded"   },
      { t: "I don't trust them at all",      v: 1, tag: "Skeptical" },
    ],
    fact: "Most platform privacy policies are longer than Shakespeare's Hamlet — and designed not to be read."
  }
];

const TRAIT_KEYS = ['Sharing', 'Permissions', 'Awareness', 'Permanence'];
const TRAIT_MAPS = [
  ['Impulsive', 'Relaxed',   'Curated',    'Conscious',  'Selective'],
  ['Resistant', 'Cautious',  'Considered', 'Casual',     'Open'     ],
  ['Unbothered','Accepting', 'Aware',      'Inquisitive','Uneasy'   ],
  ['Hopeful',   'Pragmatic', 'Resigned',   'Unaware',    'Unaware'  ],
];

const TITLES = [
  'Still waters.',
  'In the current.',
  'Moving fast.',
  'Full broadcast.'
];

const MESSAGES = [
  `Your fish is small and calm — it moves <strong>deliberately</strong>. You share sparingly and stay sceptical. Your data footprint is yours to define.`,
  `Your fish is balanced — engaged but considered. You live online with <strong>some intention</strong>. A little more awareness of where your data flows could make it entirely yours.`,
  `Your fish is bright and active. You share openly, and that openness has real value. <strong>Knowing where it goes</strong> is the difference between sharing and being harvested.`,
  `Your fish is vivid and restless — <strong>fully in the stream</strong>. Your data tells a rich story. The question worth asking: who else is reading it?`
];

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let answers      = [];
let currentQ     = 0;
let selectedOpt  = -1;
let revealAnimId = null;
let buildAnimId  = null;

/* ══════════════════════════════════════════
   BACKGROUND OCEAN
══════════════════════════════════════════ */
const bgC = document.getElementById('bgCanvas');
const bgX = bgC.getContext('2d');
let BW, BH;
const BP = [];

function resizeBg() {
  BW = bgC.width  = window.innerWidth;
  BH = bgC.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

for (let i = 0; i < 55; i++) BP.push({
  x: Math.random(), y: Math.random(),
  vx: (Math.random()-.5)*.00022, vy: (Math.random()-.5)*.00022,
  r: Math.random()*1.3+.2, a: Math.random()*.3+.05, h: 165+Math.random()*30
});

function animBg() {
  bgX.clearRect(0,0,BW,BH);
  for (let i = 0; i < BP.length; i++) {
    const p = BP[i];
    p.x = (p.x+p.vx+1)%1; p.y = (p.y+p.vy+1)%1;
    bgX.beginPath(); bgX.arc(p.x*BW, p.y*BH, p.r, 0, Math.PI*2);
    bgX.fillStyle = `hsla(${p.h},72%,58%,${p.a})`; bgX.fill();
    for (let j = i+1; j < BP.length; j++) {
      const q = BP[j];
      const dx = (p.x-q.x)*BW, dy = (p.y-q.y)*BH, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 90) {
        bgX.beginPath();
        bgX.moveTo(p.x*BW, p.y*BH); bgX.lineTo(q.x*BW, q.y*BH);
        bgX.strokeStyle = `rgba(0,200,170,${.055*(1-d/90)})`;
        bgX.lineWidth = .4; bgX.stroke();
      }
    }
  }
  requestAnimationFrame(animBg);
}
animBg();

/* ══════════════════════════════════════════
   FIBRE FISH ENGINE
══════════════════════════════════════════ */
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateFishDNA(rng) {
  const huePool = [0, 22, 45, 75, 130, 170, 200, 220, 265, 300, 330];
  const idx1    = Math.floor(rng() * huePool.length);
  const h1      = huePool[idx1];
  const gap     = 150 + rng() * 35;
  const h2      = (h1 + (rng() > 0.5 ? gap : -gap) + 360) % 360;

  const shapeRoll = rng();
  const shape = shapeRoll < 0.18 ? 'needle'
              : shapeRoll < 0.36 ? 'slim'
              : shapeRoll < 0.52 ? 'chubby'
              : shapeRoll < 0.68 ? 'deep'
              : shapeRoll < 0.84 ? 'round'
              :                    'balloon';

  const shapeParams = {
    needle:  { dorsalHeight:  28, bellyDepth:  24, bodyLength: 520, roundness: 0.60 },
    slim:    { dorsalHeight:  55, bellyDepth:  48, bodyLength: 420, roundness: 0.85 },
    chubby:  { dorsalHeight: 100, bellyDepth:  95, bodyLength: 340, roundness: 1.10 },
    deep:    { dorsalHeight: 135, bellyDepth:  72, bodyLength: 360, roundness: 0.95 },
    round:   { dorsalHeight: 115, bellyDepth: 110, bodyLength: 300, roundness: 1.25 },
    balloon: { dorsalHeight: 150, bellyDepth: 145, bodyLength: 260, roundness: 1.55 },
  }[shape];

  shapeParams.dorsalHeight *= 0.80 + rng() * 0.40;
  shapeParams.bellyDepth   *= 0.80 + rng() * 0.40;
  shapeParams.bodyLength   *= 0.85 + rng() * 0.30;

  const tailRoll = rng();
  const tail = tailRoll < 0.25 ? 'forked'
             : tailRoll < 0.50 ? 'fan'
             : tailRoll < 0.75 ? 'wispy'
             :                   'lunate';

  const tailParams = {
    forked: { tailAngle: 0.55, tailLength:  88, tailSpread: 1.00 },
    fan:    { tailAngle: 0.28, tailLength:  55, tailSpread: 2.00 },
    wispy:  { tailAngle: 0.70, tailLength: 130, tailSpread: 0.70 },
    lunate: { tailAngle: 0.42, tailLength: 100, tailSpread: 1.50 },
  }[tail];

  const lineRoll  = rng();
  const lineStyle = lineRoll < 0.33 ? 'sparse' : lineRoll < 0.66 ? 'medium' : 'dense';
  const lineParams = {
    sparse: { N: 8  + Math.floor(rng()*6),  centreWidth: 8  + rng()*6,   edgeWidth: 2.0 + rng()*2.5 },
    medium: { N: 18 + Math.floor(rng()*12), centreWidth: 4  + rng()*4,   edgeWidth: 1.0 + rng()*1.8 },
    dense:  { N: 40 + Math.floor(rng()*22), centreWidth: 2  + rng()*2.5, edgeWidth: 0.4 + rng()*0.8 },
  }[lineStyle];

  const flowRoll = rng();
  const flow = flowRoll < 0.33 ? 'calm' : flowRoll < 0.66 ? 'wavy' : 'wild';
  const flowParams = {
    calm: { driftAmp:  1 + rng()*2,   driftSpeed: 0.20 + rng()*0.20 },
    wavy: { driftAmp:  4 + rng()*6,   driftSpeed: 0.40 + rng()*0.35 },
    wild: { driftAmp: 12 + rng()*10,  driftSpeed: 0.80 + rng()*0.60 },
  }[flow];

  const hasDorsal  = rng() > 0.35;
  const dorsalPos  = 0.38 + rng() * 0.30;
  const dorsalSize = 15   + rng() * 55;

  const sat          = 75  + rng() * 25;
  const brightCentre = 68  + rng() * 20;
  const brightEdge   = 25  + rng() * 20;
  const colourSplit  = 0.30 + rng() * 0.35;

  return {
    ...shapeParams, ...tailParams, ...lineParams, ...flowParams,
    shimmerSpeed: 0.8 + rng() * 3.0,
    h1, h2,
    sat, brightCentre, brightEdge, colourSplit,
    hasDorsal, dorsalPos, dorsalSize,
  };
}

function duoHue(t, h1, h2, split) {
  const band  = 0.12;
  const blend = Math.max(0, Math.min(1, (t - (split - band)) / (band * 2)));
  let d = ((h2 - h1) + 360) % 360;
  if (d > 180) d -= 360;
  return (h1 + d * blend + 360) % 360;
}

function bodySlice(u, dna) {
  const r         = dna.roundness;
  const dorsalEnv = Math.pow(Math.sin(Math.pow(Math.max(0,Math.min(1,u*1.05)),0.5)*Math.PI), 0.6/r);
  const bellyEnv  = Math.pow(Math.sin(Math.pow(Math.max(0,Math.min(1,u*0.98)),0.45)*Math.PI), 0.55/r);
  let bump = 0;
  if (dna.hasDorsal) {
    const d = u - dna.dorsalPos;
    bump = dna.dorsalSize * Math.exp(-d*d*120) * Math.min(1,u*8) * Math.min(1,(1-u)*8);
  }
  return { topY: -dorsalEnv*dna.dorsalHeight - bump, botY: bellyEnv*dna.bellyDepth };
}

function drawFibreFish(ctx, dna, t) {
  const N         = dna.N;
  const halfLen   = dna.bodyLength / 2;
  const noseX     =  halfLen;
  const tailRootX = -halfLen;

  for (let i = 0; i < N; i++) {
    const f       = i / (N-1);
    const centreF = 1 - Math.abs(f-0.5)*2;
    const side    = f < 0.5 ? 1 : -1;
    const frac    = f < 0.5 ? (0.5-f)*2 : (f-0.5)*2;

    const ta   = side > 0 ? -dna.tailAngle : dna.tailAngle;
    const tlen = dna.tailLength * dna.tailSpread * frac;
    const pts  = [
      { x: tailRootX - Math.cos(ta)*tlen, y: side*frac*10 + side*Math.sin(Math.abs(ta))*tlen },
      { x: tailRootX-4, y: side*frac*11 },
    ];

    for (let s = 1; s <= 20; s++) {
      const u = s/20;
      const x = tailRootX + u*dna.bodyLength;
      const { topY, botY } = bodySlice(u, dna);
      const pinnedF = 0.5 + (f-0.5)*(1-Math.pow(u,3.5))*(1-Math.pow(1-u,2)*0.45);
      const y       = topY + (botY-topY)*pinnedF;
      const drift   = Math.sin(t*dna.driftSpeed + f*Math.PI*5 + u*4)*dna.driftAmp*Math.sin(u*Math.PI)*frac;
      pts.push({ x, y: y+drift });
    }
    pts.push({ x: noseX, y: 0 });

    const shimmer = 0.5 + 0.5*Math.sin(t*dna.shimmerSpeed + f*Math.PI*7);
    const alpha   = Math.min(0.20 + centreF*0.55 + shimmer*0.08, 0.98);
    const lw      = dna.edgeWidth + centreF*(dna.centreWidth-dna.edgeWidth);

    const buildPath = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let k = 1; k < pts.length-1; k++) {
        ctx.quadraticCurveTo(
          pts[k].x, pts[k].y,
          (pts[k].x+pts[k+1].x)/2, (pts[k].y+pts[k+1].y)/2
        );
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
    };

    const grd = ctx.createLinearGradient(pts[0].x, pts[0].y, noseX, 0);
    for (let g = 0; g <= 8; g++) {
      const gt = g/8;
      const h  = duoHue(gt, dna.h1, dna.h2, dna.colourSplit);
      const l  = dna.brightEdge + centreF*(dna.brightCentre-dna.brightEdge);
      const tf = gt > 0.88 ? (1-(gt-0.88)/0.12) : 1;
      grd.addColorStop(gt, `hsla(${h},${dna.sat}%,${l}%,${alpha*tf})`);
    }

    buildPath();
    ctx.strokeStyle = grd;
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }
}

/* ══════════════════════════════════════════
   FISH DNA
══════════════════════════════════════════ */
let sessionSeed = Math.floor(Math.random() * 999999);

function getDNA() {
  const avg = answers.length
    ? answers.reduce((a,b) => a+b, 0) / answers.length
    : 1.5;
  const e = Math.min(1, (avg - 1) / 3);

  const rng = mulberry32(sessionSeed);
  const dna = generateFishDNA(rng);

  dna.driftAmp    = 1   + e * 14;
  dna.driftSpeed  = 0.2 + e * 0.9;
  dna.N           = Math.floor(8 + e * 50);
  dna.centreWidth = 8   - e * 5.5;
  dna.edgeWidth   = 2   - e * 1.5;
  dna.bodyLength  = (dna.bodyLength * 0.55) + e * (dna.bodyLength * 0.75);

  return dna;
}

function renderFishToCanvas(canvas, ctx, dna, t, scale) {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  const tailOffset = (dna.bodyLength * 0.15) * scale;
  ctx.translate(w / 2 + tailOffset, h / 2);
  ctx.scale(scale, scale);
  drawFibreFish(ctx, dna, t);
  ctx.restore();
}

/* ══════════════════════════════════════════
   WELCOME FISH
══════════════════════════════════════════ */
const welcomeC = document.getElementById('welcomeCanvas');
const welcomeX = welcomeC.getContext('2d');
welcomeC.width  = 520;
welcomeC.height = 220;

const welcomeRng = mulberry32(42);
const welcomeDNA = generateFishDNA(welcomeRng);
welcomeDNA.driftAmp    = 2;
welcomeDNA.driftSpeed  = 0.22;
welcomeDNA.N           = 16;
welcomeDNA.centreWidth = 5;
welcomeDNA.edgeWidth   = 1.5;
welcomeDNA.bodyLength *= 0.65;

let welcomeT = 0;
function animWelcome() {
  welcomeT += 0.014;
  renderFishToCanvas(welcomeC, welcomeX, welcomeDNA, welcomeT, 0.38);
  requestAnimationFrame(animWelcome);
}
animWelcome();

/* ══════════════════════════════════════════
   MINI PREVIEW
══════════════════════════════════════════ */
const miniC = document.getElementById('miniCanvas');
const miniX = miniC.getContext('2d');
miniC.width  = 144;
miniC.height = 68;

let miniT = 0;
function animMini() {
  miniT += 0.016;
  renderFishToCanvas(miniC, miniX, getDNA(), miniT, 0.18);
  requestAnimationFrame(animMini);
}
animMini();

/* ══════════════════════════════════════════
   SCREEN TRANSITION
══════════════════════════════════════════ */
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ══════════════════════════════════════════
   QUESTION FLOW
══════════════════════════════════════════ */
function buildProgress() {
  const el = document.getElementById('qProgress');
  el.innerHTML = '';
  QS.forEach((_,i) => {
    const d = document.createElement('div');
    d.className = 'qp-seg' + (i < currentQ ? ' done' : i===currentQ ? ' active' : '');
    el.appendChild(d);
  });
}

function loadQ(idx) {
  const q = QS[idx];
  selectedOpt = -1;

  ['qNum','qText','qSub'].forEach(id => document.getElementById(id).classList.remove('in'));
  document.getElementById('qInsight').classList.remove('open');
  document.getElementById('btnNext').classList.remove('ready');

  document.getElementById('qCounter').textContent     = `0${idx+1} / 0${QS.length}`;
  document.getElementById('qNum').textContent         = `Question 0${idx+1}`;
  document.getElementById('qText').textContent        = q.text;
  document.getElementById('qSub').textContent         = q.sub;
  document.getElementById('qInsightText').textContent = q.fact;
  document.getElementById('btnNextTxt').textContent   = idx===QS.length-1 ? 'Build my fish  \u2192' : 'Next  \u2192';

  const optsEl = document.getElementById('qOptions');
  optsEl.innerHTML = '';
  q.opts.forEach((o,i) => {
    const div = document.createElement('div');
    div.className = 'opt';
    div.style.transition = `opacity 0.45s ${.12+i*.07}s, transform 0.45s ${.12+i*.07}s, border-color 0.25s, background 0.25s`;
    div.innerHTML = `
      <div class="opt-idx">0${i+1}</div>
      <div class="opt-text">${o.t}</div>
      <div class="opt-tag">${o.tag}</div>
    `;
    div.addEventListener('click', () => pickOpt(i, o.v, div));
    optsEl.appendChild(div);
  });

  buildProgress();

  requestAnimationFrame(() => {
    ['qNum','qText','qSub'].forEach(id => {
      requestAnimationFrame(() => document.getElementById(id).classList.add('in'));
    });
    document.querySelectorAll('.opt').forEach((o,i) => {
      setTimeout(() => o.classList.add('in'), 80 + i*60);
    });
  });
}

function pickOpt(i, val, el) {
  document.querySelectorAll('.opt').forEach(o => o.classList.remove('chosen'));
  el.classList.add('chosen');
  selectedOpt       = i;
  answers[currentQ] = val;
  sessionSeed = answers.reduce((acc, v, idx) => acc ^ (v * 6271 + idx * 1009), 314159);
  setTimeout(() => document.getElementById('qInsight').classList.add('open'), 350);
  setTimeout(() => document.getElementById('btnNext').classList.add('ready'), 500);
}

/* ══════════════════════════════════════════
   BUILDING SCREEN
══════════════════════════════════════════ */
const buildC = document.getElementById('buildCanvas');
const buildX = buildC.getContext('2d');

const BUILD_STEPS = [
  'Reading your answers\u2026',
  'Mapping your data shape\u2026',
  'Generating your fish\u2026',
  'Almost there\u2026'
];

function runBuildScreen() {
  goTo('s-building');

  buildC.width  = buildC.offsetWidth  * (window.devicePixelRatio||1);
  buildC.height = buildC.offsetHeight * (window.devicePixelRatio||1);
  buildX.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);

  let bT = 0, step = 0;
  const dna      = getDNA();
  const scale    = Math.min(buildC.offsetWidth, buildC.offsetHeight) / (dna.bodyLength * 3.2);
  const statusEl = document.getElementById('buildStatus');

  const stepTimer = setInterval(() => {
    step++;
    if (step < BUILD_STEPS.length) statusEl.textContent = BUILD_STEPS[step];
  }, 600);

  function animBuild() {
    bT += 0.018;
    renderFishToCanvas(buildC, buildX, dna, bT, scale);
    buildAnimId = requestAnimationFrame(animBuild);
  }
  animBuild();

  setTimeout(() => {
    clearInterval(stepTimer);
    cancelAnimationFrame(buildAnimId);
    buildReveal();
  }, 2600);
}

/* ══════════════════════════════════════════
   REVEAL SCREEN
══════════════════════════════════════════ */
const revC = document.getElementById('revealCanvas');
const revX = revC.getContext('2d');

function buildReveal() {
  const avg  = answers.reduce((a,b) => a+b, 0) / answers.length;
  const tier = Math.min(3, Math.floor((avg-1) / 0.76));
  const dna  = getDNA();

  document.getElementById('rvTitle').textContent = TITLES[tier];
  document.getElementById('rvMsg').innerHTML     = MESSAGES[tier];

  const traitsEl = document.getElementById('rvTraits');
  traitsEl.innerHTML = '';
  answers.slice(0, 4).forEach((v, i) => {
    const map = TRAIT_MAPS[i];
    const val = map[Math.min(v - 1, map.length - 1)];
    const d = document.createElement('div');
    d.className = 'rv-trait';
    d.innerHTML = `
      <div class="rv-trait-lbl">${TRAIT_KEYS[i]}</div>
      <div class="rv-trait-val">${val}</div>
    `;
    traitsEl.appendChild(d);
  });

  goTo('s-reveal');

  function sizeRevCanvas() {
    revC.width  = revC.offsetWidth  * (window.devicePixelRatio||1);
    revC.height = revC.offsetHeight * (window.devicePixelRatio||1);
    revX.setTransform(1,0,0,1,0,0);
    revX.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
  }
  sizeRevCanvas();

  const scale = Math.min(revC.offsetWidth, revC.offsetHeight) / (dna.bodyLength * 2.8);
  let rT = 0;
  function animReveal() {
    rT += 0.014;
    sizeRevCanvas();
    renderFishToCanvas(revC, revX, dna, rT, scale);
    revealAnimId = requestAnimationFrame(animReveal);
  }
  animReveal();
}

/* ══════════════════════════════════════════
   RELEASE — Firestore write is non-blocking,
   navigation fires immediately
══════════════════════════════════════════ */
function doRelease() {
  // Write to Firestore in background — never block navigation on it
  import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js")
    .then(({ collection, addDoc, serverTimestamp }) => {
      addDoc(collection(window.__db, "fish"), {
        seed: sessionSeed,
        releasedAt: serverTimestamp()
      }).catch(err => console.error("Firestore write failed:", err));
    })
    .catch(err => console.error("Firestore import failed:", err));

  // Animate fish off screen, then navigate — no waiting on Firestore
  const wrap = document.querySelector('.rv-fish-wrap');
  wrap.style.transition = 'transform 1.6s cubic-bezier(0.4,0,0.1,1), opacity 1s 0.5s';
  wrap.style.transform  = 'translateX(130%) translateY(-24px)';
  wrap.style.opacity    = '0';

  setTimeout(() => {
    cancelAnimationFrame(revealAnimId);
    wrap.style.transition = '';
    wrap.style.transform  = '';
    wrap.style.opacity    = '';
    goTo('s-released');
  }, 1700);
}

/* ══════════════════════════════════════════
   EVENTS
══════════════════════════════════════════ */
document.getElementById('btnStart').addEventListener('click', () => {
  answers = []; currentQ = 0; selectedOpt = -1;
  sessionSeed = Math.floor(Math.random() * 999999);
  goTo('s-question');
  loadQ(0);
});

document.getElementById('btnNext').addEventListener('click', () => {
  if (selectedOpt < 0) return;
  currentQ++;
  if (currentQ < QS.length) {
    loadQ(currentQ);
  } else {
    runBuildScreen();
  }
});

document.getElementById('btnRelease').addEventListener('click', doRelease);

document.getElementById('btnAgain').addEventListener('click', () => {
  answers = []; currentQ = 0; selectedOpt = -1;
  sessionSeed = Math.floor(Math.random() * 999999);
  goTo('s-welcome');
});