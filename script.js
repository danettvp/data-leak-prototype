/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
const QS = [
    {
      text: "How much of your daily life do you share online?",
      sub: "Posts, stories, check-ins, photos — all of it.",
      opts: [
        { t: "Very little — I keep mostly to myself",    v: 1, tag: "Private"   },
        { t: "Some things — I'm selective about it",     v: 2, tag: "Curated"   },
        { t: "Quite a bit — I share pretty openly",      v: 3, tag: "Open"      },
        { t: "Almost everything — it's how I connect",   v: 4, tag: "Broadcast" },
      ],
      fact: "The average person generates 1.7MB of data every second — most of it without realising."
    },
    {
      text: "Do you know which apps are tracking your location right now?",
      sub: "Not just maps — social apps, shopping, weather too.",
      opts: [
        { t: "Yes — I've reviewed and managed it",       v: 1, tag: "Aware"     },
        { t: "I have a rough idea of the main ones",     v: 2, tag: "Partial"   },
        { t: "Probably a few, but I'm not sure",         v: 3, tag: "Uncertain" },
        { t: "Honestly, no idea",                        v: 4, tag: "Exposed"   },
      ],
      fact: "Location data can reveal your home, workplace, religion, and relationships — even without a name attached."
    },
    {
      text: "When you see a personalised ad, how does it make you feel?",
      sub: "That shoe you looked at once. The thing you only said aloud.",
      opts: [
        { t: "Fine — it shows me things I actually want", v: 1, tag: "Neutral"   },
        { t: "Mixed — useful but a little unsettling",    v: 2, tag: "Uneasy"    },
        { t: "Uncomfortable — it knows too much",         v: 3, tag: "Wary"      },
        { t: "Angry — it feels like a violation",         v: 4, tag: "Resistant" },
      ],
      fact: "Ad platforms can infer your mental health, financial stress, and relationships from browsing patterns alone."
    },
    {
      text: "How much do you trust platforms with your data?",
      sub: "Instagram. Google. Your bank. Your health apps.",
      opts: [
        { t: "A lot — they have policies and legal duties",  v: 1, tag: "Trusting" },
        { t: "Somewhat — I give them the benefit of doubt",  v: 2, tag: "Cautious" },
        { t: "Not much — I use them but stay skeptical",     v: 3, tag: "Skeptical"},
        { t: "Not at all — but I feel I have no choice",     v: 4, tag: "Resigned" },
      ],
      fact: "In 2023 alone, over 4 billion records were exposed in data breaches. Most users were never directly notified."
    }
  ];
  
  const TRAIT_KEYS = ['Presence', 'Awareness', 'Feeling', 'Trust'];
  const TRAIT_MAPS = [
    ['Invisible', 'Selective', 'Open',     'Broadcast'],
    ['Informed',  'Cautious',  'Hazy',     'Unaware'  ],
    ['Neutral',   'Uneasy',    'Wary',     'Resistant'],
    ['Trusting',  'Hopeful',   'Skeptical','Resigned' ],
  ];
  
  const TITLES = [
    'Still waters.',
    'In the current.',
    'Moving fast.',
    'Full broadcast.'
  ];
  
  const MESSAGES = [
    `Your fish is small and calm — it moves <strong>deliberately</strong>. You share sparingly, and there's quiet power in that. Your data footprint is yours to define.`,
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
  let fishT        = 0;
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
     FISH ENGINE
  ══════════════════════════════════════════ */
  function getDNA() {
    const avg = answers.length ? answers.reduce((a,b)=>a+b,0)/answers.length : 1.5;
    const e = Math.min(1, (avg-1)/3);
    return {
      e,
      hue:    175 - e*45,
      sat:    50  + e*38,
      size:   0.52 + e*0.36,
      speed:  0.75 + e*1.5,
      pts:    Math.floor(e*20),
      glow:   0.35 + e*0.55,
      scales: Math.floor(5 + e*13),
    };
  }
  
  function drawFish(canvas, ctx, t, dna, W, H) {
    ctx.clearRect(0,0,W,H);
    const cx  = W*.5 + Math.sin(t*.55)*W*.04;
    const cy  = H*.5 + Math.sin(t*.85)*H*.055;
    const bL  = W * dna.size * .80;
    const bH  = H * .26 * dna.size;
    const N   = 72;
    const pts = [];
    const spd = dna.speed;
  
    for (let i = 0; i <= N; i++) {
      const tt    = i/N;
      const wave  = Math.sin(t*spd*1.9 - tt*Math.PI*2.3)*H*.033*tt;
      const belly = Math.sin(tt*Math.PI)*(1+Math.sin(tt*7+t*.4)*.09);
      pts.push({ x: cx-bL*.5+bL*tt, y: cy+wave, w: bH*belly });
    }
  
    const h = dna.hue, s = dna.sat;
  
    // Body fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y-pts[i].w*.5);
    for (let i = pts.length-1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y+pts[i].w*.5);
    ctx.closePath();
    const bg = ctx.createLinearGradient(cx-bL*.5,0,cx+bL*.5,0);
    bg.addColorStop(0,   `hsla(${h},${s}%,38%,0)`);
    bg.addColorStop(.18, `hsla(${h},${s}%,40%,${dna.glow*.65})`);
    bg.addColorStop(.52, `hsla(${h+8},${s+8}%,52%,${dna.glow})`);
    bg.addColorStop(.82, `hsla(${h},${s}%,38%,${dna.glow*.55})`);
    bg.addColorStop(1,   `hsla(${h},${s}%,30%,0)`);
    ctx.fillStyle = bg; ctx.fill();
  
    // Scale marks
    for (let i = 0; i < dna.scales; i++) {
      const tt = .12+(i/dna.scales)*.74;
      const sp = pts[Math.floor(tt*N)];
      if (!sp) continue;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y-sp.w*.5);
      ctx.lineTo(sp.x+sp.w*.22, sp.y);
      ctx.lineTo(sp.x, sp.y+sp.w*.5);
      ctx.strokeStyle = `hsla(${h+18},88%,80%,.11)`;
      ctx.lineWidth = .5; ctx.stroke();
    }
  
    // Dorsal fin
    const dp = pts[Math.floor(N*.44)];
    if (dp) {
      ctx.beginPath();
      ctx.moveTo(dp.x-bL*.115, dp.y-dp.w*.46);
      ctx.quadraticCurveTo(dp.x, dp.y-bH*(.58+Math.sin(t*1.2)*.06), dp.x+bL*.115, dp.y-dp.w*.46);
      ctx.strokeStyle = `hsla(${h},${s}%,62%,.32)`; ctx.lineWidth = .75; ctx.stroke();
    }
  
    // Pectoral fin
    const pp = pts[Math.floor(N*.3)];
    if (pp) {
      const sw = Math.sin(t*spd*1.7)*.07;
      ctx.beginPath();
      ctx.moveTo(pp.x, pp.y+pp.w*.28);
      ctx.quadraticCurveTo(pp.x+bL*.065, pp.y+pp.w*(.72+sw), pp.x+bL*.105, pp.y+pp.w*(.48+sw*.5));
      ctx.strokeStyle = `hsla(${h},${s}%,62%,.28)`; ctx.lineWidth = .7; ctx.stroke();
    }
  
    // Tail
    const tl = pts[0];
    const fl  = Math.sin(t*spd*2.05)*H*.09;
    ctx.beginPath();
    ctx.moveTo(tl.x, tl.y);
    ctx.quadraticCurveTo(tl.x-bL*.1, tl.y+fl*1.35, tl.x-bL*.145, tl.y+fl);
    ctx.moveTo(tl.x, tl.y);
    ctx.quadraticCurveTo(tl.x-bL*.1, tl.y-fl*1.35, tl.x-bL*.145, tl.y-fl);
    ctx.strokeStyle = `hsla(${h},${s}%,60%,.42)`; ctx.lineWidth = 1; ctx.stroke();
  
    // Eye
    const ep = pts[Math.floor(N*.88)];
    if (ep) {
      const ex = ep.x+bL*.006, ey = ep.y-ep.w*.18;
      ctx.beginPath(); ctx.arc(ex,ey,2.2,0,Math.PI*2);
      ctx.fillStyle = `hsla(${h+28},100%,84%,.92)`; ctx.fill();
      ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2);
      ctx.strokeStyle = `hsla(${h},100%,68%,.22)`; ctx.lineWidth = .7; ctx.stroke();
    }
  
    // Data particles
    for (let p = 0; p < dna.pts; p++) {
      const prog = ((t*.32+p*.43)%1);
      const src  = pts[Math.floor(N*(.22+p*.056))];
      if (!src) continue;
      const px = src.x+(Math.sin(p*2.2)*bL*.3)*prog;
      const py = src.y-src.w*.5-prog*H*.2+Math.cos(p*1.8)*H*.07;
      ctx.beginPath(); ctx.arc(px,py,.85,0,Math.PI*2);
      ctx.fillStyle = `rgba(0,200,170,${(1-prog)*.38})`; ctx.fill();
    }
  }
  
  /* ══════════════════════════════════════════
     MINI PREVIEW
  ══════════════════════════════════════════ */
  const miniC = document.getElementById('miniCanvas');
  const miniX = miniC.getContext('2d');
  miniC.width = 144; miniC.height = 68;
  
  function animMini() {
    fishT += .016;
    drawFish(miniC, miniX, fishT, getDNA(), 144, 68);
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
  
    document.getElementById('qCounter').textContent   = `0${idx+1} / 0${QS.length}`;
    document.getElementById('qNum').textContent        = `Question 0${idx+1}`;
    document.getElementById('qText').textContent       = q.text;
    document.getElementById('qSub').textContent        = q.sub;
    document.getElementById('qInsightText').textContent = q.fact;
    document.getElementById('btnNextTxt').textContent  = idx===QS.length-1 ? 'Build my fish  →' : 'Next  →';
  
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
    selectedOpt    = i;
    answers[currentQ] = val;
    setTimeout(() => document.getElementById('qInsight').classList.add('open'), 350);
    setTimeout(() => document.getElementById('btnNext').classList.add('ready'), 500);
  }
  
  /* ══════════════════════════════════════════
     BUILDING SCREEN
  ══════════════════════════════════════════ */
  const buildC = document.getElementById('buildCanvas');
  const buildX = buildC.getContext('2d');
  
  const BUILD_STEPS = [
    'Reading your answers…',
    'Mapping your data shape…',
    'Generating your fish…',
    'Almost there…'
  ];
  
  function runBuildScreen() {
    goTo('s-building');
  
    const w = buildC.offsetWidth  * (window.devicePixelRatio||1);
    const h = buildC.offsetHeight * (window.devicePixelRatio||1);
    buildC.width = w; buildC.height = h;
    buildX.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
  
    let bT = 0, step = 0;
    const dna      = getDNA();
    const statusEl = document.getElementById('buildStatus');
  
    const stepTimer = setInterval(() => {
      step++;
      if (step < BUILD_STEPS.length) statusEl.textContent = BUILD_STEPS[step];
    }, 600);
  
    function animBuild() {
      bT += .018;
      drawFish(buildC, buildX, bT, dna, buildC.offsetWidth, buildC.offsetHeight);
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
    const avg  = answers.reduce((a,b)=>a+b,0) / answers.length;
    const tier = Math.min(3, Math.floor((avg-1)/0.76));
    const dna  = getDNA();
  
    document.getElementById('rvTitle').textContent = TITLES[tier];
    document.getElementById('rvMsg').innerHTML     = MESSAGES[tier];
  
    const traitsEl = document.getElementById('rvTraits');
    traitsEl.innerHTML = '';
    answers.forEach((v,i) => {
      const d = document.createElement('div');
      d.className = 'rv-trait';
      d.innerHTML = `
        <div class="rv-trait-lbl">${TRAIT_KEYS[i]}</div>
        <div class="rv-trait-val">${TRAIT_MAPS[i][v-1]}</div>
      `;
      traitsEl.appendChild(d);
    });
  
    goTo('s-reveal');
  
    function sizeRevCanvas() {
      const W = revC.offsetWidth  * (window.devicePixelRatio||1);
      const H = revC.offsetHeight * (window.devicePixelRatio||1);
      revC.width = W; revC.height = H;
      revX.setTransform(1,0,0,1,0,0);
      revX.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
    }
    sizeRevCanvas();
  
    let rT = 0;
    function animReveal() {
      rT += .014;
      sizeRevCanvas();
      drawFish(revC, revX, rT, dna, revC.offsetWidth, revC.offsetHeight);
      revealAnimId = requestAnimationFrame(animReveal);
    }
    animReveal();
  }
  
  /* ══════════════════════════════════════════
     RELEASE  — saves fish DNA to Firestore
  ══════════════════════════════════════════ */
  async function doRelease() {
    const dna = getDNA();
  
    // Save to Firestore using the db exposed by index.html
    try {
      const { collection, addDoc, serverTimestamp } = await import(
        "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
      );
      await addDoc(collection(window.__db, "fish"), {
        ...dna,
        releasedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Firestore write failed:", err);
    }
  
    // Animate fish swimming off screen
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
    goTo('s-welcome');
  });