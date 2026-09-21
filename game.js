/* =====================================================================
   A MANSÃO DOS ESPÍRITOS — motor do jogo
   ---------------------------------------------------------------------
   Este arquivo NÃO contém as fases. Elas ficam em /fases/*.js e se
   registram com  Mansao.phase({...}).  Para criar uma fase nova basta
   copiar uma existente e mudar o id — veja README.md.
   ===================================================================== */
(function () {
'use strict';

/* ---------- utilidades ---------- */
const TOTAL = 30;                       // fases planejadas
const KEY = 'mansao-dos-espiritos-v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[ri(0, a.length - 1)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* =====================================================================
   ESTADO DO JOGO  +  SAVE (localStorage)
   ===================================================================== */
const defaults = () => ({
  version: 1,
  started: false,
  currentPhase: 1,
  lives: 3,
  score: 0,
  hintsUsed: 0,
  completedPhases: [],
  secrets: [],                          // fases em que o olhinho escondido foi achado
  clues: {},                            // pistas guardadas (usadas na fase 28)
  checkpoint: { phase: 1, score: 0 },
  stats: { mistakes: 0, playTime: 0, perfect: 0 },
  settings: { volume: 0.8, ambient: 0.6, sfx: 0.9, reduceFx: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) }
});
let gameState = defaults();
function save() { try { localStorage.setItem(KEY, JSON.stringify(gameState)); } catch (e) { /* modo privado */ } }
function load() {
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return false;
    const o = JSON.parse(raw), d = defaults();
    gameState = Object.assign(d, o, { settings: Object.assign(d.settings, o.settings || {}), stats: Object.assign(d.stats, o.stats || {}) });
    return true;
  } catch (e) { return false; }
}
function resetProgress() { const s = gameState.settings; gameState = defaults(); gameState.settings = s; save(); }

/* =====================================================================
   ÍCONES (SVG, herdam a cor do texto)
   ===================================================================== */
const ICON = {
  moon:   '<path d="M30 5a19 19 0 1 0 13 27A16 16 0 0 1 30 5z" fill="currentColor"/>',
  sun:    '<circle cx="24" cy="24" r="9" fill="currentColor"/><path d="M24 3v8M24 37v8M3 24h8M37 24h8M9 9l6 6M33 33l6 6M39 9l-6 6M15 33l-6 6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  eye:    '<path d="M3 24C10 11 38 11 45 24C38 37 10 37 3 24z" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="24" cy="24" r="7.5" fill="currentColor"/>',
  flame:  '<path d="M24 3c2 9 13 14 13 27a13 13 0 0 1-26 0c0-6 3-10 6-13 0 4 2 6 4 6-2-8 0-14 3-20z" fill="currentColor"/>',
  key:    '<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M20 20L43 43M33 33l6-6M39 39l5-5" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
  skull:  '<path d="M24 4C13 4 7 12 7 21c0 6 3 10 7 12v9h20v-9c4-2 7-6 7-12C41 12 35 4 24 4z" fill="currentColor"/><circle cx="16.5" cy="22" r="4.5" fill="#150c28"/><circle cx="31.5" cy="22" r="4.5" fill="#150c28"/><path d="M22 32l2-4 2 4z" fill="#150c28"/>',
  spiral: '<path d="M24 24a3 3 0 0 1 6 0 7 7 0 0 1-14 0 11 11 0 0 1 22 0 15 15 0 0 1-30 0 19 19 0 0 1 38 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
  star:   '<polygon points="24,4 10,44 44,17 4,17 38,44" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>',
  raven:  '<path d="M3 32c9-1 12-11 20-13 6-1 11 2 15-3l7 6-7 3c-1 12-10 20-24 17z" fill="currentColor"/><circle cx="35" cy="19" r="1.8" fill="#150c28"/><path d="M8 36l-5 8M15 38l-3 7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  cross:  '<path d="M19 3h10v13h13v10H29v19H19V26H6V16h13z" fill="currentColor"/>',
  drop:   '<path d="M24 3C16 16 9 22 9 31a15 15 0 0 0 30 0C39 22 32 16 24 3z" fill="currentColor"/>',
  ghost:  '<path d="M6 44V22C6 11 14 3 24 3s18 8 18 19v22l-6-5-6 5-6-5-6 5-6-5z" fill="currentColor"/><ellipse cx="17" cy="21" rx="3" ry="4.5" fill="#150c28"/><ellipse cx="31" cy="21" rx="3" ry="4.5" fill="#150c28"/>',
  bell:   '<path d="M24 4c-9 0-14 7-14 16v8l-5 6h38l-5-6v-8c0-9-5-16-14-16z" fill="currentColor"/><circle cx="24" cy="42" r="4" fill="currentColor"/>',
  crown:  '<path d="M4 38L8 12l12 12 4-16 4 16 12-12 4 26z" fill="currentColor"/>',
  book:   '<path d="M6 8h15c2 0 3 1 3 3v31c0-2-1-3-3-3H6zM42 8H27c-2 0-3 1-3 3v31c0-2 1-3 3-3h15z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>',
  heart:  '<path d="M24 42S4 30 4 16a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 14-20 26-20 26z" fill="currentColor"/>'
};
const ICON_NAMES = Object.keys(ICON);
const icon = (name, extra = '') => `<svg class="ico ${extra}" viewBox="0 0 48 48" aria-hidden="true">${ICON[name] || ''}</svg>`;

/* =====================================================================
   ÁUDIO — tudo sintetizado com Web Audio API (sem arquivos)
   ===================================================================== */
const Snd = (() => {
  let ac = null, master, sfx, amb, noiseBuf, ambRun = false, ambSrc = null, evTimer = null;
  const S = () => gameState.settings;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.connect(ac.destination);
    sfx = ac.createGain(); sfx.connect(master);
    amb = ac.createGain(); amb.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    apply();
  }
  function apply() { if (!ac) return; master.gain.value = S().volume; sfx.gain.value = S().sfx; amb.gain.value = S().ambient * 0.5; }
  function tone(f, d, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.delay || 0), osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f * o.slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + (o.attack || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(o.to || sfx); osc.start(t); osc.stop(t + d + 0.05);
  }
  function noise(d, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.delay || 0), src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf; f.type = o.type || 'lowpass'; f.Q.value = o.q || 1; f.frequency.setValueAtTime(o.freq || 800, t);
    if (o.sweep) f.frequency.exponentialRampToValueAtTime(Math.max(30, (o.freq || 800) * o.sweep), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + (o.attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(f); f.connect(g); g.connect(o.to || sfx); src.start(t, Math.random()); src.stop(t + d + 0.05);
  }
  const lib = {
    click:  () => tone(620, .07, { type: 'triangle', vol: .18, slide: .6 }),
    ok:     () => { tone(523, .14, { vol: .2 }); tone(784, .24, { vol: .2, delay: .1 }); },
    err:    () => { tone(220, .22, { type: 'sawtooth', vol: .1, slide: .6 }); tone(165, .3, { type: 'square', vol: .06, delay: .08, slide: .7 }); },
    door:   () => { noise(1.4, { type: 'bandpass', freq: 300, q: 6, vol: .2, sweep: 2.2 }); tone(95, 1.3, { type: 'sawtooth', vol: .05, slide: .6 }); },
    step:   () => noise(.09, { type: 'lowpass', freq: 260, vol: .4 }),
    whisper:() => noise(1.5, { type: 'bandpass', freq: 2600, q: 2, vol: .07, attack: .45, sweep: .6 }),
    ghost:  () => { tone(300, .9, { vol: .14, slide: 2.4 }); tone(312, .9, { vol: .08, slide: 2.3, delay: .02 }); },
    boo:    () => { tone(190, .5, { type: 'triangle', vol: .24, slide: .55 }); tone(380, .45, { vol: .1, slide: .5 }); },
    tick:   () => tone(1400, .03, { type: 'square', vol: .05 }),
    done:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .45, { vol: .16, delay: i * .11 })),
    lose:   () => [392, 330, 262, 196].forEach((f, i) => tone(f, .45, { type: 'triangle', vol: .16, delay: i * .18 })),
    wisp:   () => { tone(900, .35, { vol: .08, slide: 1.6 }); tone(1200, .3, { vol: .05, delay: .1, slide: .7 }); },
    giggle: () => [700, 880, 760, 940, 820].forEach((f, i) => tone(f, .07, { type: 'square', vol: .04, delay: i * .07 })),
    page:   () => noise(.25, { type: 'highpass', freq: 1800, vol: .16, attack: .02, sweep: .5 }),
    drip:   () => tone(1500, .09, { vol: .09, slide: .4 }),
    creak:  () => tone(140, .9, { type: 'sawtooth', vol: .04, slide: 1.5 }),
    heart:  () => { tone(60, .15, { vol: .35 }); tone(55, .18, { vol: .3, delay: .18 }); },
    pop:    () => tone(400, .1, { type: 'triangle', vol: .2, slide: 2.2 }),
    key:    () => [1800, 2400].forEach((f, i) => tone(f, .12, { vol: .08, delay: i * .05 })),
    thump:  () => { tone(90, .12, { type: 'triangle', vol: .3, slide: .5 }); noise(.06, { freq: 400, vol: .1 }); },
    wind:   () => noise(2, { type: 'bandpass', freq: 500, q: .8, vol: .08, attack: .8, sweep: 1.6 })
  };
  const SCALE = [262, 294, 330, 392, 440, 523, 587, 659];
  function play(name, o) { try { init(); (lib[name] || lib.click)(o); } catch (e) { } }
  function note(i, dur = .32) { try { init(); tone(SCALE[i % SCALE.length], dur, { type: 'triangle', vol: .22 }); } catch (e) { } }
  function ambientStart() {
    init(); if (!ac || ambRun) return; ambRun = true;
    ambSrc = ac.createBufferSource(); ambSrc.buffer = noiseBuf; ambSrc.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = .6;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .09; lg.gain.value = 220; lfo.connect(lg); lg.connect(f.frequency);
    const g = ac.createGain(); g.gain.value = .55; ambSrc.connect(f); f.connect(g); g.connect(amb);
    const dr = ac.createOscillator(), dg = ac.createGain(); dr.frequency.value = 55; dg.gain.value = .07; dr.connect(dg); dg.connect(amb);
    ambSrc.start(); lfo.start(); dr.start();
    const evs = () => { if (!ambRun) return; evTimer = setTimeout(() => { if (!document.hidden) play(pick(['creak', 'drip', 'whisper', 'drip', 'wind'])); evs(); }, rnd(9000, 22000)); };
    evs();
  }
  return { init, apply, play, note, tone, noise, ambientStart };
})();

/* =====================================================================
   RELÓGIO DO JOGO — só avança quando o jogo não está pausado
   ===================================================================== */
const Clock = {
  t: 0, last: 0, paused: true, tasks: [], frames: [], uid: 1,
  start() { this.last = performance.now(); const loop = now => { const dt = Math.min(now - this.last, 100); this.last = now; if (!this.paused) this.step(dt); requestAnimationFrame(loop); }; requestAnimationFrame(loop); },
  step(dt) {
    this.t += dt; gameState.stats.playTime += dt / 1000;
    for (const k of this.tasks.slice()) if (this.tasks.includes(k) && k.at <= this.t) { if (k.every) k.at += k.every; else this.tasks.splice(this.tasks.indexOf(k), 1); try { k.fn(); } catch (e) { console.error(e); } }
    for (const f of this.frames.slice()) if (this.frames.includes(f)) { let r; try { r = f.fn(dt, this.t); } catch (e) { console.error(e); r = false; } if (r === false) this.cancel(f.id); }
  },
  after(ms, fn, owner) { const k = { id: this.uid++, at: this.t + ms, fn, owner }; this.tasks.push(k); return k.id; },
  every(ms, fn, owner) { const k = { id: this.uid++, at: this.t + ms, every: ms, fn, owner }; this.tasks.push(k); return k.id; },
  frame(fn, owner) { const k = { id: this.uid++, fn, owner }; this.frames.push(k); return k.id; },
  cancel(id) { this.tasks = this.tasks.filter(k => k.id !== id); this.frames = this.frames.filter(k => k.id !== id); },
  clearOwner(o) { this.tasks = this.tasks.filter(k => k.owner !== o); this.frames = this.frames.filter(k => k.owner !== o); }
};

/* =====================================================================
   FANTASMAS — tipos, desenho e comportamentos visuais
   Cada tipo tem aparência, velocidade, som e dificuldade próprios.
   ===================================================================== */
const GHOST_TYPES = {
  espectro: { nome: 'Fifi',            vel: 1.0, dif: 1, sfx: 'ghost',  desc: 'Fantasminha clássico. Flutua devagar e adora um susto de mentirinha.' },
  fogo:     { nome: 'Fogo-fátuo',      vel: 1.8, dif: 1, sfx: 'wisp',   desc: 'Pequeno e veloz. Some e aparece num piscar de olhos.' },
  sombra:   { nome: 'Sombra Curiosa',  vel: 0.8, dif: 2, sfx: 'whisper',desc: 'Alta e magrinha. Aparece atrás das coisas.' },
  cantora:  { nome: 'Dona Cantarola',  vel: 1.3, dif: 2, sfx: 'giggle', desc: 'Canta desafinado e atravessa corredores.' },
  pipoca:   { nome: 'Pipoca',          vel: 1.1, dif: 2, sfx: 'giggle', desc: 'Um fantasminha de festa que adora pregar peças.' },
  barao:    { nome: 'Barão Bigodudo',  vel: 0.9, dif: 3, sfx: 'boo',    desc: 'O dono da mansão. Sério, mas com bom coração.' }
};
let _gid = 0;
function ghostSVG(type, o = {}) {
  const id = 'gg' + (++_gid), glow = o.glow, eyeFill = '#1a1030';
  const body = (d, extra = '') => `<path d="${d}" fill="url(#${id})" ${extra}/>`;
  const eyes = (cx1, cx2, cy, rx, ry) => [cx1, cx2].map(cx => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${eyeFill}"/>` + (glow ? `<circle cx="${cx}" cy="${cy}" r="${rx * .65}" fill="${glow}" style="filter:drop-shadow(0 0 4px ${glow})"/>` : `<circle cx="${cx + 1.5}" cy="${cy - 2.5}" r="1.8" fill="#fff"/>`)).join('');
  const cheeks = (a, b, y) => `<circle cx="${a}" cy="${y}" r="5" fill="#ff9ac0" opacity=".55"/><circle cx="${b}" cy="${y}" r="5" fill="#ff9ac0" opacity=".55"/>`;
  const smile = (y, w = 10) => `<path d="M${50 - w} ${y}q${w} ${w} ${w * 2} 0" stroke="${eyeFill}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.tint || '#ffffff'}"/><stop offset="1" stop-color="${o.tint2 || '#c9bfff'}" stop-opacity=".8"/></linearGradient></defs>`;
  const wave = 'L78 112L69 122L60 112L50 122L40 112L31 122L22 112Z';
  let inner = '';
  switch (type) {
    case 'fogo':
      inner = body('M50 4C60 30 86 40 86 74c0 24-16 40-36 40S14 98 14 74C14 56 26 48 32 34c4 8 8 10 12 10-4-16 0-28 6-40z', 'style="opacity:.95"') + eyes(38, 62, 76, 6, 9) + smile(94, 8);
      break;
    case 'sombra':
      inner = body('M32 126V40C32 18 40 4 50 4s18 14 18 36v86L62 116l-6 10-6-10-6 10-6-10z') +
        `<path d="M32 62L6 112M68 62l26 50" stroke="url(#${id})" stroke-width="7" stroke-linecap="round" opacity=".8"/>` +
        `<ellipse cx="43" cy="42" rx="7" ry="5" fill="${glow || eyeFill}" stroke="${eyeFill}" stroke-width="2"/><ellipse cx="57" cy="42" rx="7" ry="5" fill="${glow || eyeFill}" stroke="${eyeFill}" stroke-width="2"/>${glow ? '' : '<circle cx="44" cy="41" r="1.4" fill="#fff"/><circle cx="58" cy="41" r="1.4" fill="#fff"/>'}` + smile(62, 6);
      break;
    case 'cantora':
      inner = `<circle cx="50" cy="8" r="9" fill="url(#${id})"/>` + body('M50 12c-17 0-27 12-27 30 0 12 4 20 4 28L8 122h84L73 70c0 -8 4-16 4-28C77 24 67 12 50 12z') +
        eyes(38, 62, 44, 5, 7) + cheeks(30, 70, 56) + `<ellipse cx="50" cy="66" rx="7" ry="9" fill="${eyeFill}"/><path d="M84 30q8-6 6-16M92 40q8-8 4-20" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
      break;
    case 'pipoca':
      inner = body('M18 122V64C18 40 32 26 50 26s32 14 32 38v58L72 112l-8 10-7-10-7 10-7-10-8 10-8-10z') +
        `<path d="M50 -4l16 32H34z" fill="${pick(['#ff8fc0', '#7fe0c3', '#ffb347'])}" stroke="#fff" stroke-width="2"/><circle cx="50" cy="-5" r="4" fill="#fff"/>` +
        eyes(38, 62, 62, 6, 8) + cheeks(30, 70, 76) + smile(80, 8);
      break;
    case 'barao':
      inner = `<rect x="30" y="-12" width="40" height="30" rx="3" fill="#1a1030" stroke="#b79cff" stroke-width="2"/><rect x="22" y="14" width="56" height="8" rx="3" fill="#1a1030" stroke="#b79cff" stroke-width="2"/>` +
        body(`M10 122V60C10 34 28 20 50 20S90 34 90 60V122${wave.replace('L78 112', 'L80 112')}`) + eyes(36, 64, 56, 6, 9) +
        `<path d="M50 74c-8-8-20-6-24 0 8 2 16 2 24 0zM50 74c8-8 20-6 24 0-8 2-16 2-24 0z" fill="#1a1030"/>` + smile(86, 9);
      break;
    default: // espectro
      inner = `<ellipse cx="9" cy="72" rx="10" ry="6" transform="rotate(30 9 72)" fill="url(#${id})"/><ellipse cx="91" cy="72" rx="10" ry="6" transform="rotate(-30 91 72)" fill="url(#${id})"/>` +
        body(`M12 122V50C12 22 30 6 50 6S88 22 88 50V122${wave}`) + eyes(36, 64, 52, 7, 10) + cheeks(26, 74, 72) + smile(70, 9);
  }
  return `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${inner}</svg>`;
}
const Ptr = { x: innerWidth / 2, y: innerHeight / 2 };
const Ghosts = {
  el(type, o = {}) { const g = el(`<div class="ghost ${o.float === false ? '' : 'float'}" data-type="${type}">${ghostSVG(type, o)}</div>`); if (o.size) g.style.width = o.size + 'px'; return g; },
  /** fantasma atravessando a tela (corredor / distração) */
  pass(type = 'espectro', o = {}) {
    const layer = $('#ghostlayer'), g = Ghosts.el(type, o), W = layer.clientWidth || innerWidth, H = layer.clientHeight || innerHeight;
    const size = o.size || 90; g.style.width = size + 'px'; g.style.top = (o.y != null ? o.y : rnd(80, H - 160)) + 'px'; g.style.left = '0px'; layer.appendChild(g);
    const dir = o.dir || (Math.random() < .5 ? 1 : -1), a = -size - 20, b = W + 20;
    const anim = g.animate([{ transform: `translateX(${dir > 0 ? a : b}px) scaleX(${dir})` }, { transform: `translateX(${dir > 0 ? b : a}px) scaleX(${dir})` }], { duration: o.dur || 5500 / (GHOST_TYPES[type].vel), easing: 'linear' });
    anim.onfinish = () => g.remove(); Snd.play(GHOST_TYPES[type].sfx); return g;
  },
  /** "Buuu!" divertido — nada de susto forte */
  boo(type = 'espectro') {
    const layer = $('#ghostlayer'), calm = gameState.settings.reduceFx, size = calm ? 110 : 190;
    const g = Ghosts.el(type, { float: false, size }); g.style.left = rnd(10, 70) + '%'; g.style.bottom = '-10px'; g.style.top = 'auto';
    g.insertAdjacentHTML('beforeend', '<b style="position:absolute;left:50%;top:-26px;transform:translateX(-50%);font-size:26px;color:#fff;text-shadow:0 0 10px #b79cff,0 2px 0 #2a1a4a;white-space:nowrap">Buuu!</b>');
    layer.appendChild(g); Snd.play('boo');
    const a = g.animate([{ transform: 'translateY(100%) scale(.8)' }, { transform: 'translateY(-10%) scale(1)', offset: .3 }, { transform: 'translateY(-10%) scale(1)', offset: .7 }, { transform: 'translateY(110%) scale(.8)' }], { duration: calm ? 1400 : 1100, easing: 'ease-out' });
    a.onfinish = () => g.remove();
  },
  /** olhinhos que seguem o cursor num canto escuro (sensação de "estar sendo observado") */
  watch(ms = 3800) {
    const w = el('<div class="watchers"><b><i></i></b><b><i></i></b></div>'), sides = [[4, 30], [86, 40], [10, 78], [78, 82], [46, 10]], p = pick(sides);
    w.style.left = p[0] + '%'; w.style.top = p[1] + '%'; $('#game').appendChild(w);
    const upd = () => { const r = w.getBoundingClientRect(); $$('b', w).forEach(b => { const c = b.getBoundingClientRect(), a = Math.atan2(Ptr.y - (c.top + 17), Ptr.x - (c.left + 17)); b.firstElementChild.style.transform = `translate(${Math.cos(a) * 8}px,${Math.sin(a) * 8}px)`; }); };
    const iv = setInterval(upd, 60); upd(); Snd.play('whisper');
    setTimeout(() => { clearInterval(iv); w.classList.add('gone'); setTimeout(() => w.remove(), 500); }, ms);
  }
};

/* =====================================================================
   INTERFACE: toast, sussurro, telas
   ===================================================================== */
let _toastT = 0, _whisT = 0;
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('on'), ms); }
function whisper(msg, ms = 3800) { const w = $('#whisper'); w.textContent = msg; w.classList.add('on'); clearTimeout(_whisT); _whisT = setTimeout(() => w.classList.remove('on'), ms); }
const BLOCKING = new Set(['pause', 'settings', 'hints', 'howto', 'confirm', 'complete', 'gameover']);
const open = new Set();
function showScreen(id) { $('#' + id).hidden = false; open.add(id); Game.syncPause(); }
function hideScreen(id) { $('#' + id).hidden = true; open.delete(id); Game.syncPause(); }
function askConfirm(text, yes) {
  $('#cfText').textContent = text; showScreen('confirm');
  $('#cfYes').onclick = () => { hideScreen('confirm'); Snd.play('click'); yes(); };
  $('#cfNo').onclick = () => { hideScreen('confirm'); Snd.play('click'); };
}

/* ---------- salas (cenários) ---------- */
const candles = pos => pos.map(p => `<div class="candle" style="left:${p[0]}%;top:${p[1]}%"></div>`).join('');
const ROOMS = {
  hall:     { name: 'Salão de Entrada', back: '<div class="p-window"></div><div class="p-door"></div><div class="p-frame f1"></div><div class="p-frame f2"></div>', l: candles([[30, 40], [62, 40]]) + '<div class="p-frame f1" style="left:46%;right:auto;top:18%"></div>', r: candles([[30, 40], [62, 40]]) },
  lounge:   { name: 'Sala de Estar', back: '<div class="p-fire"></div><div class="p-clock"></div><div class="p-frame f1"></div><div class="p-frame f3"></div>', l: candles([[40, 42]]), r: candles([[40, 42], [70, 42]]) },
  corridor: { name: 'Corredor Leste', back: '<div class="p-far-door"></div>', l: candles([[18, 40], [42, 40], [66, 40], [88, 40]]) + '<div class="p-frame f2" style="left:30%;top:14%"></div><div class="p-frame f2" style="left:54%;top:14%"></div>', r: candles([[28, 40], [52, 40], [76, 40]]) },
  study:    { name: 'Biblioteca', back: '<div class="p-shelf a"></div><div class="p-shelf b"></div><div class="p-window" style="width:12%"></div>', l: candles([[45, 44]]) + '<div class="p-shelf a" style="left:10%;width:60%;height:70%"></div>', r: candles([[45, 44]]) },
  ballroom: { name: 'Salão de Baile', back: '<div class="p-arch" style="left:14%"></div><div class="p-arch" style="left:45.5%"></div><div class="p-arch" style="right:14%"></div><div class="p-chand"></div>', l: candles([[24, 42], [56, 42], [84, 42]]), r: candles([[24, 42], [56, 42], [84, 42]]) },
  stairs:   { name: 'Escadaria', back: '<div class="p-window" style="left:30%"></div><div class="p-frame f1"></div><div class="p-door" style="left:auto;right:12%"></div>', l: candles([[30, 40], [64, 40]]), r: candles([[30, 40], [64, 40]]) }
};
function setRoom(name) {
  const r = ROOMS[name] || ROOMS.hall, g = $('#game');
  g.className = g.className.split(' ').filter(c => !c.startsWith('theme-')).concat('theme-' + (ROOMS[name] ? name : 'hall')).join(' ');
  $('#propsBack').innerHTML = r.back; $('#propsL').innerHTML = r.l; $('#propsR').innerHTML = r.r;
}

/* ---------- transições entre ambientes ---------- */
const Trans = {
  busy: false,
  /** kind: door | corridor | stairs | down | fade */
  play(kind, text, mid, done) {
    const t = $('#trans'), pre = { door: 500, corridor: 1100, stairs: 1000, down: 1000, fade: 600 }[kind] || 600;
    this.busy = true; t.className = 'on ' + kind; $('#transText').textContent = text || '';
    if (text) { void t.offsetWidth; t.classList.add('show-text'); }
    if (kind === 'corridor' || kind === 'stairs' || kind === 'down') for (let i = 0; i < 5; i++) setTimeout(() => Snd.play('step'), 120 + i * 220);
    if (kind === 'door') setTimeout(() => Snd.play('door'), 250);
    setTimeout(() => {
      try { mid && mid(); } catch (e) { console.error(e); }
      if (kind === 'door') { t.classList.add('open'); setTimeout(fin, 1500); } else { t.classList.add('leave'); setTimeout(fin, 700); }
    }, pre);
    function fin() { t.className = ''; Trans.busy = false; done && done(); }
  }
};

/* =====================================================================
   O JOGO
   ===================================================================== */
const PHASES = [];
const Game = {
  ctx: null, phase: null, pending: null, active: false, hintState: [null, null, null], sessionMistakes: 0,

  syncPause() {
    const overlays = [...open].some(id => BLOCKING.has(id));
    Clock.paused = !this.active || overlays || document.hidden;
    $('#game').classList.toggle('paused', this.active && (overlays || document.hidden));
  },

  /* ---------- HUD ---------- */
  updateHUD() {
    const p = this.phase || this.pending;
    if (p) { $('#hudPhase').textContent = p.id; $('#hudTitle').textContent = p.title; }
    $('#hudScore').textContent = fmt(gameState.score);
    $('#hudLives').innerHTML = [0, 1, 2].map(i => `<i class="${i < gameState.lives ? '' : 'off'}"></i>`).join('');
  },
  setTimer(text, warn) { const t = $('#hudTimer'); if (text == null) { t.hidden = true; return; } t.hidden = false; t.textContent = text; t.classList.toggle('warn', !!warn); },

  /* ---------- fluxo ---------- */
  newGame() {
    const go = () => { resetProgress(); gameState.started = true; save(); hideScreen('title'); this.openPhase(1); };
    if (gameState.started && gameState.completedPhases.length) askConfirm('Começar um novo jogo apaga o progresso salvo. Tem certeza?', go); else go();
  },
  continueGame() { if (!gameState.started) return; hideScreen('title'); this.openPhase(gameState.currentPhase); },

  openPhase(id) {
    const p = PHASES[id - 1];
    if (!p) { this.showEnding(); return; }
    gameState.currentPhase = id; gameState.started = true;
    if ((id - 1) % 5 === 0) { gameState.checkpoint = { phase: id, score: gameState.score }; gameState.lives = 3; }
    save();
    this.pending = p; this.hintState = [null, null, null]; this.active = false; this.phase = null;
    $('#hud').hidden = true;
    const dl = ['', 'Fácil', 'Médio', 'Difícil'][p.difficulty];
    $('#introKicker').textContent = `Fase ${p.id} de ${TOTAL} · ${(ROOMS[p.room] || ROOMS.hall).name}`;
    $('#introTitle').textContent = p.title; $('#introText').textContent = p.intro; $('#introObj').textContent = p.objective;
    $('#introDiff').textContent = dl; $('#introDiff').className = 'tag d' + p.difficulty; $('#introType').textContent = p.kind || '';
    $('#introType').hidden = !p.kind;
    showScreen('intro'); Snd.play('page');
  },
  enterPhase() {
    if (Trans.busy) return; const p = this.pending; hideScreen('intro'); Snd.play('click');
    Trans.play(p.transition || 'door', p.transitionText || '', () => { this.clearStage(); setRoom(p.room); $('#hud').hidden = false; this.beginPhase(p); });
  },
  beginPhase(p) {
    this.phase = p; this.ctx = makeCtx(p); this.active = true; this.hintState = [null, null, null]; this.setTimer(null);
    this.updateHUD(); this.syncPause(); this.placeSecret(p); $('#btnHint').classList.remove('pulse');
    Clock.after(75000, () => $('#btnHint').classList.add('pulse'), this.ctx);
    try { p.start(this.ctx); } catch (e) { console.error(e); toast('Ops, algo deu errado nesta fase. Tente reiniciar.'); }
  },
  clearStage() { $('#stage').innerHTML = ''; $$('.secret-eye').forEach(e => e.remove()); $('#ghostlayer').innerHTML = ''; $('#whisper').classList.remove('on'); this.setTimer(null); },
  restartPhase() {
    const p = this.phase || this.pending; if (!p || Trans.busy) return;
    if (this.ctx) this.ctx._dispose(); hideScreen('gameover'); gameState.lives = 3; save(); this.active = false; this.syncPause();
    Trans.play('fade', 'De novo!', () => { this.clearStage(); setRoom(p.room); $('#hud').hidden = false; this.beginPhase(p); });
  },
  toCheckpoint() {
    const c = gameState.checkpoint; hideScreen('gameover');
    gameState.score = c.score; gameState.lives = 3; gameState.completedPhases = gameState.completedPhases.filter(x => x < c.phase); save();
    this.openPhase(c.phase);
  },
  toMenu() {
    if (this.ctx) this.ctx._dispose(); this.active = false; this.phase = null; this.pending = null;
    ['pause', 'gameover', 'complete', 'hints', 'settings', 'howto', 'intro', 'ending'].forEach(hideScreen);
    this.clearStage(); $('#hud').hidden = true; setRoom('hall'); save(); this.refreshMenu(); showScreen('title'); this.syncPause();
  },
  refreshMenu() { const c = $('#mContinue'); c.disabled = !gameState.started; c.textContent = gameState.started ? `Continuar (fase ${gameState.currentPhase})` : 'Continuar'; },

  /* ---------- erros, vidas, pontos ---------- */
  onMistake(ctx) {
    gameState.stats.mistakes++; this.sessionMistakes++; save();
    if (!gameState.settings.reduceFx) { const g = $('#game'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake'); setTimeout(() => g.classList.remove('shake'), 400); }
    if (this.sessionMistakes % 3 === 0) Ghosts.watch();
  },
  loseLife(ctx, msg) {
    if (!this.active || ctx.done) return gameState.lives;
    gameState.lives = Math.max(0, gameState.lives - 1); save(); this.updateHUD();
    const l = $$('#hudLives i')[gameState.lives]; if (l) l.classList.add('lost');
    const h = $('#fx-hurt'); h.classList.remove('on'); void h.offsetWidth; h.classList.add('on');
    Snd.play('err'); if (msg) whisper(msg);
    if (gameState.lives <= 0) { this.gameOver(ctx); } else if (!gameState.settings.reduceFx && Math.random() < .5) Ghosts.boo(pick(['espectro', 'pipoca', 'fogo']));
    return gameState.lives;
  },
  gameOver(ctx) {
    this.active = false; ctx._dispose(); Snd.play('lose'); this.syncPause();
    setTimeout(() => { $('#goCheck').textContent = `Voltar ao checkpoint (fase ${gameState.checkpoint.phase})`; showScreen('gameover'); }, 700);
  },
  completePhase(ctx, o = {}) {
    const p = ctx.phase, elapsed = ctx.elapsed();
    const base = 100 * p.difficulty, tb = p.par ? clamp(Math.round(100 * (1 - elapsed / p.par)), 0, 100) : 0, lv = gameState.lives * 10;
    const perfect = ctx.mistakes === 0 ? 50 : 0, extra = o.bonus || 0, pen = ctx.mistakes * 10;
    const total = Math.max(0, base + tb + lv + perfect + extra - pen);
    gameState.score += total; if (!gameState.completedPhases.includes(p.id)) gameState.completedPhases.push(p.id);
    if (perfect) gameState.stats.perfect++;
    gameState.lives = Math.min(3, gameState.lives + 1);
    gameState.currentPhase = p.id + 1; save();
    this.active = false; ctx._dispose(); this.syncPause(); this.updateHUD(); this.setTimer(null);
    Snd.play('done'); const g = $('#game'); g.classList.add('victory'); setTimeout(() => g.classList.remove('victory'), 1000);
    const rows = [['Fase concluída', base]];
    if (tb) rows.push(['Bônus de rapidez', tb]); if (lv) rows.push(['Velinhas restantes', lv]); if (perfect) rows.push(['Sem erros!', perfect]); if (extra) rows.push([o.bonusLabel || 'Bônus especial', extra]);
    $('#cTable').innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>+${r[1]}</td></tr>`).join('') + (pen ? `<tr class="neg"><td>Erros (${ctx.mistakes})</td><td>−${Math.min(pen, base + tb + lv + perfect + extra)}</td></tr>` : '') + `<tr class="tot"><td>Total da fase</td><td>${fmt(total)}</td></tr>`;
    $('#cTitle').textContent = p.title; $('#cMsg').textContent = o.message || p.success || 'Você abriu o caminho!';
    const last = !PHASES[p.id]; $('#cNext').textContent = last ? 'Continuar' : 'Próxima fase';
    setTimeout(() => showScreen('complete'), 1100);
  },
  nextPhase() { hideScreen('complete'); Snd.play('click'); this.openPhase(gameState.currentPhase); },
  showEnding() {
    const done = PHASES.length >= TOTAL, s = gameState;
    $('#endKicker').textContent = done ? 'Fim' : 'Fim desta etapa';
    $('#endTitle').textContent = done ? 'Você escapou!' : 'A mansão ainda guarda segredos…';
    $('#endText').textContent = done ? '' : `Você abriu ${s.completedPhases.length} portas! As próximas salas estão sendo preparadas. Seu progresso está salvo — em breve você poderá continuar daqui.`;
    $('#endTable').innerHTML = `<tr><td>Portas abertas</td><td>${s.completedPhases.length} / ${TOTAL}</td></tr><tr><td>Olhinhos secretos</td><td>${s.secrets.length}</td></tr><tr><td>Dicas usadas</td><td>${s.hintsUsed}</td></tr><tr class="tot"><td>Pontuação</td><td>${fmt(s.score)}</td></tr>`;
    $('#hud').hidden = true; hideScreen('title'); showScreen('ending');
  },

  /* ---------- segredo (olhinho escondido) ---------- */
  placeSecret(p) {
    if (gameState.secrets.includes(p.id)) return;
    const SP = [[3, 86], [95, 90], [4, 20], [94, 18], [50, 94], [2, 52], [96, 52], [28, 95], [72, 95], [12, 8]];
    const s = SP[(p.id * 3) % SP.length], b = el(`<button class="secret-eye" aria-label="Um olhinho escondido!">${icon('eye')}</button>`);
    b.style.left = s[0] + '%'; b.style.top = s[1] + '%';
    b.onclick = () => { if (!this.active) return; b.classList.add('got'); gameState.secrets.push(p.id); gameState.score += 50; save(); this.updateHUD(); Snd.play('ok'); toast('Você achou um olhinho escondido! +50 pontos'); };
    $('#game').appendChild(b);
  },

  /* ---------- dicas ---------- */
  openHints() {
    if (!this.active || !this.phase) return;
    const p = this.phase, costs = [25, 50, 150], names = ['Dica 1', 'Dica 2', 'Solução'];
    const box = $('#hintList'); box.innerHTML = '';
    names.forEach((n, i) => {
      const row = el(`<div class="hint-row"><b>${n}</b> <span class="tiny">(−${costs[i]} pontos)</span></div>`), txt = this.hintState[i];
      if (txt) row.appendChild(el(`<p>${txt}</p>`));
      else { const b = el(`<button class="btn sm">Mostrar</button>`); b.disabled = i > 0 && !this.hintState[i - 1];
        b.onclick = () => { const h = p.hints && p.hints[i]; this.hintState[i] = typeof h === 'function' ? h(this.ctx.rt, this.ctx) : (h || 'Fifi não sabe o que dizer…');
          gameState.score = Math.max(0, gameState.score - costs[i]); gameState.hintsUsed++; save(); this.updateHUD(); Snd.play('whisper'); this.openHints(); };
        row.appendChild(b); }
      box.appendChild(row);
    });
    showScreen('hints'); Snd.play('click');
  },
  togglePause() { if (!this.active) return; if (open.has('pause')) hideScreen('pause'); else { showScreen('pause'); Snd.play('click'); } }
};

/* ---------- contexto entregue a cada fase ---------- */
function makeCtx(p) {
  const offs = [];
  const ctx = {
    phase: p, rt: {}, mistakes: 0, done: false, t0: Clock.t, stage: $('#stage'), state: gameState,
    mount(html) { ctx.stage.innerHTML = html; return ctx.stage.firstElementChild; },
    $: s => ctx.stage.querySelector(s), $$: s => Array.from(ctx.stage.querySelectorAll(s)),
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after: (ms, fn) => Clock.after(ms, fn, ctx), every: (ms, fn) => Clock.every(ms, fn, ctx), frame: fn => Clock.frame(fn, ctx), cancel: id => Clock.cancel(id),
    sfx: (n, o) => Snd.play(n, o), note: (i, d) => Snd.note(i, d), say: whisper, toast,
    elapsed: () => (Clock.t - ctx.t0) / 1000,
    timer: (text, warn) => Game.setTimer(text, warn),
    clue(k, v) { gameState.clues[k] = v; save(); },
    ghost: Ghosts,
    shake(node) { if (!node) return; node.classList.remove('shake-el'); void node.offsetWidth; node.classList.add('shake-el'); },
    flash() { if (gameState.settings.reduceFx) return; const f = $('#fx-flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); },
    /** registra um erro. every=N → a cada N erros na fase, uma velinha se apaga. Retorna true se perdeu vida. */
    mistake(every = 0, msg) {
      if (ctx.done || !Game.active) return false;
      ctx.mistakes++; Snd.play('err'); Game.onMistake(ctx);
      if (every && ctx.mistakes % every === 0) { Game.loseLife(ctx, msg || 'Uma velinha se apagou…'); return true; }
      if (msg) whisper(msg); return false;
    },
    loseLife: msg => Game.loseLife(ctx, msg),
    win(o) { if (ctx.done || !Game.active) return; ctx.done = true; Game.completePhase(ctx, o); },
    _dispose() { Clock.clearOwner(ctx); offs.forEach(f => f()); offs.length = 0; ctx.done = true; }
  };
  return ctx;
}

/* =====================================================================
   INICIALIZAÇÃO
   ===================================================================== */
function applySettings() {
  const s = gameState.settings; Snd.apply(); document.documentElement.classList.toggle('reduce-fx', !!s.reduceFx);
  $('#sVol').value = s.volume; $('#sAmb').value = s.ambient; $('#sSfx').value = s.sfx; $('#sFx').checked = !!s.reduceFx;
}
function boot() {
  load(); setRoom('hall'); applySettings(); Game.refreshMenu();
  // poeirinha flutuando
  $('#dust').innerHTML = Array.from({ length: 28 }, () => `<i style="left:${rnd(0, 100)}%;top:${rnd(20, 100)}%;animation-duration:${rnd(9, 20)}s;animation-delay:${rnd(0, 12)}s;width:${ri(2, 4)}px;height:${ri(2, 4)}px"></i>`).join('');
  // ícones fixos do HUD
  $('#hud').hidden = true;

  const first = () => { Snd.init(); Snd.ambientStart(); removeEventListener('pointerdown', first); removeEventListener('keydown', first); };
  addEventListener('pointerdown', first); addEventListener('keydown', first);

  // parallax suave da câmera
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { Ptr.x = e.clientX; Ptr.y = e.clientY; tx = (e.clientX / innerWidth - .5) * 3.2; ty = (e.clientY / innerHeight - .5) * -2.4; });
  const cube = $('#cube');
  (function cam() { cx += (tx - cx) * .05; cy += (ty - cy) * .05; cube.style.setProperty('--ry', cx.toFixed(2) + 'deg'); cube.style.setProperty('--rx', cy.toFixed(2) + 'deg'); requestAnimationFrame(cam); })();

  const on = (id, fn) => $('#' + id).addEventListener('click', () => { Snd.play('click'); fn(); });
  on('mNew', () => Game.newGame()); on('mContinue', () => Game.continueGame());
  on('mCfg', () => showScreen('settings')); on('mHow', () => showScreen('howto'));
  on('sClose', () => { save(); hideScreen('settings'); }); on('hwClose', () => hideScreen('howto')); on('hClose', () => hideScreen('hints'));
  on('introGo', () => Game.enterPhase()); on('cNext', () => Game.nextPhase());
  on('goRetry', () => Game.restartPhase()); on('goCheck', () => Game.toCheckpoint()); on('goMenu', () => { hideScreen('gameover'); Game.toMenu(); });
  on('pResume', () => hideScreen('pause')); on('pCfg', () => showScreen('settings')); on('pHow', () => showScreen('howto')); on('pMenu', () => askConfirm('Sair para o menu? Seu progresso das fases concluídas está salvo.', () => { hideScreen('pause'); Game.toMenu(); }));
  on('btnPause', () => Game.togglePause()); on('btnHint', () => Game.openHints()); on('btnCfg', () => showScreen('settings'));
  on('endMenu', () => { hideScreen('ending'); Game.toMenu(); });
  on('sReset', () => askConfirm('Apagar todo o seu progresso? Isso não pode ser desfeito.', () => { resetProgress(); applySettings(); Game.refreshMenu(); toast('Progresso apagado.'); }));
  $('#sVol').oninput = e => { gameState.settings.volume = +e.target.value; Snd.apply(); };
  $('#sAmb').oninput = e => { gameState.settings.ambient = +e.target.value; Snd.apply(); };
  $('#sSfx').oninput = e => { gameState.settings.sfx = +e.target.value; Snd.apply(); Snd.play('pop'); };
  $('#sFx').onchange = e => { gameState.settings.reduceFx = e.target.checked; applySettings(); save(); };

  addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const top = ['confirm', 'settings', 'howto', 'hints'].find(id => open.has(id));
      if (top) hideScreen(top); else Game.togglePause();
    } else if ((e.key === 'h' || e.key === 'H') && Game.active && ![...open].some(id => BLOCKING.has(id)) && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) Game.openHints();
  });
  document.addEventListener('visibilitychange', () => Game.syncPause());
  addEventListener('beforeunload', save);

  Clock.start(); Game.syncPause(); showScreen('title');
  // atalho para testes: index.html?fase=5
  const q = new URLSearchParams(location.search).get('fase');
  if (q && PHASES[+q - 1]) { if (!gameState.started) { gameState.started = true; } hideScreen('title'); Game.openPhase(+q); }
}

window.Mansao = { phase: def => { PHASES[def.id - 1] = def; }, boot, Game, Snd, Ghosts, clock: Clock, GHOST_TYPES, icon, ICON_NAMES, gameState: () => gameState, PHASES, ROOMS,
  util: { rnd, ri, pick, shuffle, clamp, cap, el, fmt, mmss, $, $$ } };
})();
