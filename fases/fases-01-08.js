/* =====================================================================
   FASES 1 a 8  —  "A Mansão dos Espíritos"
   Cada fase é um objeto registrado com Mansao.phase({...}).
   Campos: id, title, room, transition, difficulty (1 fácil · 2 médio · 3 difícil),
           kind, par (segundos para o bônus de rapidez), intro, objective, success,
           hints [dica1, dica2, solução] (texto ou função(rt)), start(ctx).
   O `ctx` cuida de timers, eventos, vidas, erros, pontos e limpeza automática.
   ===================================================================== */
(function () {
'use strict';
const M = Mansao, icon = M.icon, { rnd, ri, pick, shuffle, clamp, cap, el } = M.util;

/* nomes dos símbolos (com artigo) */
const NAMES = {
  moon: ['a', 'Lua'], sun: ['o', 'Sol'], eye: ['o', 'Olho'], flame: ['a', 'Chama'], key: ['a', 'Chave'], skull: ['a', 'Caveira'],
  spiral: ['a', 'Espiral'], star: ['a', 'Estrela'], raven: ['o', 'Corvo'], cross: ['a', 'Cruz'], drop: ['a', 'Gota'], ghost: ['o', 'Fantasma'],
  bell: ['o', 'Sino'], crown: ['a', 'Coroa'], book: ['o', 'Livro']
};
const nm = k => NAMES[k][0] + ' ' + NAMES[k][1];          // "a Lua"
const nmc = k => cap(NAMES[k][0]) + ' ' + NAMES[k][1];    // "A Lua"

/* mostra frações (3/8) em formato de fração */
const fx = t => String(t).replace(/(\d+)\/(\d+)/g, '<span class="frac"><sup>$1</sup><sub>$2</sub></span>');

/* =====================================================================
   FASE 1 — O QUADRO
   ===================================================================== */
M.phase({
  id: 1, title: 'O Quadro', room: 'hall', transition: 'fade', transitionText: 'Você abre os olhos…', difficulty: 1, kind: 'Explorar e observar', par: 150,
  intro: 'Você acorda deitado no chão frio de uma mansão antiga. A luz da lua entra pela janela. A porta está trancada! Na parede, um quadro muito velho parece observar você…',
  objective: 'Toque nas partes do quadro para descobrir 5 símbolos escondidos. Depois, clique neles na ordem que o bilhete pede.',
  success: 'O quadro deu uma piscadinha — e a fechadura fez CLIC! A porta do salão se abriu.',
  hints: [
    'Leia o bilhete na moldura: ele descreve cada símbolo com uma pista. "O que ilumina a noite", por exemplo, é a Lua.',
    rt => `Os dois primeiros da ordem são ${nm(rt.order[0])} e ${nm(rt.order[1])}.`,
    rt => 'A ordem correta é: ' + rt.order.map(nmc).join(' → ') + '.'
  ],
  start(ctx) {
    const order = shuffle(['moon', 'eye', 'raven', 'flame', 'key']); ctx.rt.order = order;
    const phr = { moon: 'o que ilumina a noite', eye: 'o que tudo vê', raven: 'o que voa na escuridão', flame: 'o que queima devagarzinho', key: 'o que abre as portas trancadas' };
    const words = ['Primeiro', 'Depois', 'Em seguida', 'Então', 'Por fim'];
    const riddle = order.map((k, i) => `<b>${words[i]}</b>, ${phr[k]}.`).join(' ');
    const say = { moon: 'A lua brilha no quadro… um símbolo apareceu!', eye: 'Os olhos da dama piscaram sozinhos!', raven: 'Um corvo! Ele deixou um símbolo para você.', flame: 'A vela tremeu e um símbolo surgiu.', key: 'Uma chavinha escondida no vestido!' };
    ctx.mount(`<div class="p1">
      <div class="painting"><svg viewBox="0 0 300 400" role="img" aria-label="Quadro antigo de uma dama">
        <defs><radialGradient id="pbg" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#3a2a5a"/><stop offset="1" stop-color="#0d0a1c"/></radialGradient></defs>
        <rect x="4" y="4" width="292" height="392" rx="6" fill="#3b2410" stroke="#a37a34" stroke-width="6"/>
        <rect x="22" y="22" width="256" height="356" fill="url(#pbg)" stroke="#1a0f08" stroke-width="3"/>
        <rect x="196" y="38" width="66" height="96" fill="#0b1430" stroke="#5a4028" stroke-width="5"/>
        <g class="hs" data-s="moon" tabindex="0" role="button" aria-label="Janela com a lua"><path transform="translate(207 60) scale(.9)" d="M30 5a19 19 0 1 0 13 27A16 16 0 0 1 30 5z" fill="#f4efd8"/><circle class="hit" cx="229" cy="84" r="32"/></g>
        <path d="M96 380C100 262 120 220 150 212c30 8 50 50 54 168z" fill="#160f22"/>
        <path d="M124 218q26 26 52 0" stroke="#d8cdb8" stroke-width="5" fill="none"/>
        <ellipse cx="150" cy="170" rx="30" ry="38" fill="#d8cdb8"/>
        <path d="M118 168C108 116 192 116 182 168C176 142 124 142 118 168z" fill="#0d0a0e"/>
        <path d="M118 168c-4 30-2 60 6 80M182 168c4 30 2 60-6 80" stroke="#0d0a0e" stroke-width="8" fill="none"/>
        <g class="hs" data-s="eye" tabindex="0" role="button" aria-label="Olhos da dama">
          <ellipse cx="138" cy="172" rx="6" ry="8" fill="#150c28"/><ellipse cx="162" cy="172" rx="6" ry="8" fill="#150c28"/>
          <circle class="eyeglow" cx="138" cy="171" r="2.6" fill="#ffe08a"/><circle class="eyeglow" cx="162" cy="171" r="2.6" fill="#ffe08a"/>
          <path d="M142 196q8 6 16 0" stroke="#150c28" stroke-width="2.5" fill="none"/><circle class="hit" cx="150" cy="176" r="28"/></g>
        <g class="hs" data-s="key" tabindex="0" role="button" aria-label="Chave no cinto"><g transform="translate(134 284) scale(.6)" style="color:#d9b45a">${M.icon('key').replace(/<svg[^>]*>|<\/svg>/g, '')}</g><circle class="hit" cx="150" cy="300" r="22"/></g>
        <rect x="42" y="326" width="16" height="46" rx="2" fill="#efe6c6"/>
        <g class="hs" data-s="flame" tabindex="0" role="button" aria-label="Vela acesa"><g transform="translate(36 296) scale(.56)" style="color:#ffb347">${M.icon('flame').replace(/<svg[^>]*>|<\/svg>/g, '')}</g><circle class="hit" cx="50" cy="322" r="26"/></g>
        <path d="M24 104L120 96" stroke="#5a4028" stroke-width="5" stroke-linecap="round"/>
        <g class="hs" data-s="raven" tabindex="0" role="button" aria-label="Corvo no galho"><g transform="translate(40 56) scale(.95)" style="color:#7a6aa8">${M.icon('raven').replace(/<svg[^>]*>|<\/svg>/g, '')}</g><circle class="hit" cx="64" cy="78" r="34"/></g>
      </svg></div>
      <div class="side">
        <div class="note"><h4>Escrito na moldura</h4><p>${riddle}</p></div>
        <p class="title-line" id="p1msg">Toque nas partes do quadro para descobrir os símbolos escondidos.</p>
        <div class="found" id="found">${'<span class="slot">?</span>'.repeat(5)}</div>
        <div class="slab" id="slab" hidden></div>
      </div></div>`);
    const found = new Set(), slots = ctx.$('#found').children, msg = ctx.$('#p1msg');
    const reveal = g => {
      const s = g.dataset.s; if (found.has(s)) { ctx.sfx('click'); return; }
      found.add(s); g.classList.add('found'); ctx.sfx('key'); const sl = slots[found.size - 1]; sl.innerHTML = icon(s); sl.classList.add('filled');
      ctx.say(say[s]); if (found.size === 5) unlock();
    };
    ctx.$$('.hs').forEach(g => { ctx.on(g, 'click', () => reveal(g)); ctx.on(g, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') reveal(g); }); });
    ctx.after(28000, () => { const g = ctx.$$('.hs:not(.found)')[0]; if (g) g.classList.add('nudge'); });
    function unlock() {
      msg.textContent = 'Os símbolos se soltaram do quadro! Toque neles na ordem do bilhete.'; ctx.sfx('door');
      const slab = ctx.$('#slab'); slab.hidden = false; let pos = 0;
      slab.innerHTML = `<div class="row">${shuffle(order).map(k => `<button class="sym" data-k="${k}" aria-label="${nmc(k)}">${icon(k)}</button>`).join('')}</div><div class="prog" style="margin-top:12px">${order.map(() => '<i></i>').join('')}</div>`;
      const dots = slab.querySelectorAll('.prog i'), btns = slab.querySelectorAll('.sym');
      btns.forEach(b => ctx.on(b, 'click', () => {
        if (b.dataset.k === order[pos]) { b.classList.add('lit'); b.disabled = true; dots[pos].classList.add('on'); ctx.note(pos); pos++;
          if (pos === 5) { ctx.clue('p1', order); ctx.say('CLIC! A fechadura cedeu.'); ctx.after(900, () => ctx.win()); } }
        else { ctx.mistake(0, 'O quadro estremeceu… a ordem não é essa. Tente de novo!'); btns.forEach(x => { x.classList.remove('lit'); x.disabled = false; x.classList.remove('bad'); void x.offsetWidth; x.classList.add('bad'); }); dots.forEach(d => d.classList.remove('on')); pos = 0; }
      }));
    }
  }
});

/* =====================================================================
   FASE 2 — O CÓDIGO DO RELÓGIO
   ===================================================================== */
M.phase({
  id: 2, title: 'O Código do Relógio', room: 'lounge', transition: 'fade', transitionText: 'Você abre os olhos…', difficulty: 1, kind: 'Observação e código', par: 120,
  intro: 'Você acorda no chão de uma mansão antiga e todas as portas estão trancadas! Na Sala de Estar, um relógio muito velho está parado. Um bilhete diz que ele guarda o código da primeira porta.',
  objective: 'Leia a hora em que o relógio parou e digite 4 números: as HORAS (2 números) e depois os MINUTOS (2 números).',
  success: 'O relógio deu um "tin-tin-tin" e a gavetinha secreta se abriu com a chave da próxima sala!',
  hints: [
    'O ponteiro PEQUENO e grosso mostra as horas. O ponteiro GRANDE e fino mostra os minutos.',
    rt => `Para os minutos: cada número romano vale 5 minutos para o ponteiro grande (o I vale 5, o II vale 10, o III vale 15…). O relógio marca ${rt.hh} hora(s) e ${rt.mm} minutos.`,
    rt => `O código é ${rt.code}. (Hora ${String(rt.hh).padStart(2, '0')} e minutos ${String(rt.mm).padStart(2, '0')}.)`
  ],
  start(ctx) {
    const hh = ri(1, 12), mm = pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]), code = String(hh).padStart(2, '0') + String(mm).padStart(2, '0');
    Object.assign(ctx.rt, { hh, mm, code });
    const ha = (hh % 12) * 30 + mm * .5, ma = mm * 6, rom = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    let ticks = '', nums = '';
    for (let i = 0; i < 60; i++) { const a = i * 6, l = i % 5 ? 4 : 10; ticks += `<line x1="150" y1="${130 - 96}" x2="150" y2="${130 - 96 + l}" transform="rotate(${a} 150 130)" stroke="#5a3d22" stroke-width="${i % 5 ? 1 : 2.5}"/>`; }
    rom.forEach((r, i) => { const a = i * 30 * Math.PI / 180; nums += `<text x="${150 + Math.sin(a) * 76}" y="${130 - Math.cos(a) * 76}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="bold" fill="#3a2410" font-family="Georgia,serif">${r}</text>`; });
    ctx.mount(`<div class="p2">
      <div class="clockwrap"><svg viewBox="0 0 300 330" role="img" aria-label="Relógio de pêndulo parado">
        <rect x="46" y="4" width="208" height="322" rx="22" fill="#3b2410" stroke="#24160a" stroke-width="4"/>
        <rect x="70" y="240" width="160" height="70" rx="10" fill="#1a0f08"/>
        <line x1="150" y1="246" x2="150" y2="292" stroke="#b08a3a" stroke-width="3"/><circle cx="150" cy="296" r="11" fill="#d9b45a"/>
        <circle cx="150" cy="130" r="104" fill="#e8d9b5" stroke="#b08a3a" stroke-width="8"/>${ticks}${nums}
        <path d="M120 60l14 22-10 14 16 16" stroke="rgba(60,40,20,.5)" stroke-width="2" fill="none"/>
        <line x1="150" y1="130" x2="150" y2="78" transform="rotate(${ha} 150 130)" stroke="#24160a" stroke-width="8" stroke-linecap="round"/>
        <line x1="150" y1="130" x2="150" y2="48" transform="rotate(${ma} 150 130)" stroke="#24160a" stroke-width="4" stroke-linecap="round"/>
        <circle cx="150" cy="130" r="7" fill="#b08a3a"/></svg></div>
      <div class="col">
        <div class="note"><h4>Bilhete do relógio</h4><p>Parei na hora em que o fantasma chegou. Digite a <b>hora</b> e depois os <b>minutos</b>: quatro números.</p></div>
        <div class="codebox" id="code" aria-live="polite"><b></b><b></b><b></b><b></b></div>
        <div class="keypad" id="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="del" aria-label="Apagar">⌫</button><button data-k="0">0</button><button class="ok" data-k="ok">OK</button></div>
      </div></div>`);
    let val = ''; const boxes = ctx.$$('#code b');
    const draw = () => boxes.forEach((b, i) => b.textContent = val[i] || '');
    const press = k => {
      if (ctx.done) return;
      if (k === 'del') { val = val.slice(0, -1); ctx.sfx('click'); }
      else if (k === 'ok') {
        if (val.length < 4) { ctx.say('Faltam números! O código tem 4.'); ctx.sfx('err'); return; }
        if (val === code) { ctx.clue('p2', code); ctx.sfx('ok'); ctx.say('Tin-tin-tin! O relógio abriu!'); ctx.after(900, () => ctx.win()); }
        else { ctx.mistake(4, 'Nada aconteceu… olhe os ponteiros de novo.'); ctx.shake(ctx.$('#code')); val = ''; }
      } else if (val.length < 4) { val += k; ctx.sfx('click'); }
      draw();
    };
    ctx.$$('#pad button').forEach(b => ctx.on(b, 'click', () => press(b.dataset.k)));
    ctx.on(document, 'keydown', e => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') press('ok'); });
  }
});

/* =====================================================================
   FASE 3 — A PORTA DOS SÍMBOLOS
   ===================================================================== */
M.phase({
  id: 3, title: 'A Porta dos Símbolos', room: 'corridor', transition: 'corridor', transitionText: 'Passos no corredor…', difficulty: 1, kind: 'Lógica de ordem', par: 120,
  intro: 'No fim de um corredor comprido há uma porta enorme, cheia de símbolos brilhantes. Alguém deixou frases coladas na parede. Elas contam a ordem certa!',
  objective: 'Descubra a ordem dos 5 símbolos lendo as frases e toque neles na sequência. Se errar, começa de novo!',
  success: 'A porta gigante abriu devagarinho, com um rangido comprido… Que arrepio gostoso!',
  hints: [
    'Cada frase fala de dois símbolos vizinhos. Procure o símbolo que nunca aparece "depois" de ninguém: ele é o primeiro.',
    rt => `O primeiro símbolo é ${nm(rt.order[0])} e o segundo é ${nm(rt.order[1])}.`,
    rt => 'A ordem é: ' + rt.order.map(nmc).join(' → ') + '.'
  ],
  start(ctx) {
    const order = shuffle(['moon', 'sun', 'eye', 'flame', 'key', 'skull', 'star', 'bell']).slice(0, 5); ctx.rt.order = order;
    const T = [
      (a, b) => `${nmc(a)} vem logo antes d${NAMES[b][0]} ${NAMES[b][1]}.`,
      (a, b) => `Logo depois d${NAMES[a][0]} ${NAMES[a][1]} surge ${nm(b)}.`,
      (a, b) => `${nmc(b)} vem logo após ${nm(a)}.`
    ];
    const lines = shuffle(order.slice(0, 4).map((a, i) => T[ri(0, 2)](a, order[i + 1])));
    ctx.mount(`<div class="p3">
      <div class="note"><h4>Frases na parede</h4>${lines.map(l => `<p>• ${l}</p>`).join('')}</div>
      <div class="col">
        <div class="door3" id="door"><div class="leaf"></div>
          <div class="grid3">${shuffle(order).map(k => `<button class="sym" data-k="${k}" aria-label="${nmc(k)}">${icon(k)}</button>`).join('')}</div></div>
        <div class="prog">${order.map(() => '<i></i>').join('')}</div>
      </div></div>`);
    let pos = 0; const btns = ctx.$$('.sym'), dots = ctx.$$('.prog i'), door = ctx.$('#door');
    btns.forEach(b => ctx.on(b, 'click', () => {
      if (ctx.done) return;
      if (b.dataset.k === order[pos]) {
        b.classList.add('lit'); b.disabled = true; dots[pos].classList.add('on'); ctx.note(pos); pos++;
        if (pos === 5) { ctx.clue('p3', order); btns.forEach(x => x.disabled = true); ctx.sfx('door'); door.classList.add('opening'); ctx.after(1600, () => ctx.win()); }
      } else {
        ctx.mistake(3, 'A porta tremeu! Recomece a sequência.'); pos = 0; dots.forEach(d => d.classList.remove('on'));
        btns.forEach(x => { x.classList.remove('lit'); x.disabled = false; x.classList.remove('bad'); void x.offsetWidth; x.classList.add('bad'); });
      }
    }));
  }
});

/* =====================================================================
   FASE 4 — MEMÓRIA DOS FANTASMAS
   ===================================================================== */
M.phase({
  id: 4, title: 'Memória dos Fantasmas', room: 'ballroom', transition: 'door', difficulty: 1, kind: 'Memória', par: 150,
  intro: 'No Salão de Baile, os fantasminhas dançam em volta de um lustre. Eles mostram uma fileira de símbolos por alguns segundinhos… e depois escondem tudo!',
  objective: 'Memorize os símbolos e toque neles na mesma ordem. São 3 rodadas, cada uma com mais símbolos.',
  success: 'Os fantasminhas aplaudiram! Uma porta escondida atrás do lustre se abriu.',
  hints: [
    'Tente repetir os nomes em voz baixa: "lua, chave, olho…". Contar uma historinha com os símbolos ajuda muito!',
    'Olhe primeiro o começo e o fim da fileira. Depois, preencha o meio.',
    'Nesta fase não existe resposta fixa, a fileira muda a cada vez. Respire fundo: o tempo de olhar é generoso!'
  ],
  start(ctx) {
    const SET = ['moon', 'sun', 'eye', 'flame', 'key', 'ghost', 'star', 'bell'], rounds = [{ n: 3, ms: 4860 }, { n: 4, ms: 5670 }, { n: 5, ms: 6210 }];
    ctx.mount(`<div class="p4"><p class="title-line" id="p4t"></p><div class="row" id="p4seq"></div><div class="bar" id="p4bar"><i></i></div>
      <div class="pal">${SET.map((k, i) => `<button class="sym" data-k="${k}" data-i="${i}" aria-label="${nmc(k)}">${icon(k)}</button>`).join('')}</div>
      <div class="prog" id="p4prog">${rounds.map(() => '<i></i>').join('')}</div></div>`);
    const title = ctx.$('#p4t'), seqEl = ctx.$('#p4seq'), bar = ctx.$('#p4bar'), pal = ctx.$$('.pal .sym'), dots = ctx.$$('#p4prog i');
    let r = 0, seq = [], idx = 0, showing = false;
    const lock = v => pal.forEach(b => b.disabled = v);
    function startRound() {
      const { n, ms } = rounds[r]; seq = shuffle(SET).slice(0, n); idx = 0; showing = true; lock(true);
      title.textContent = `Rodada ${r + 1} de ${rounds.length} — Memorize!`; bar.hidden = false; bar.classList.remove('warn');
      seqEl.innerHTML = seq.map(k => `<span class="slot filled">${icon(k)}</span>`).join(''); ctx.sfx('whisper');
      if (r > 0 && !M.gameState().settings.reduceFx) ctx.ghost.pass(pick(['espectro', 'fogo', 'pipoca']), { size: 60, y: rnd(90, 200) });
      let left = ms; const fill = bar.firstElementChild;
      const id = ctx.frame(dt => { left -= dt; fill.style.width = clamp(left / ms * 100, 0, 100) + '%'; bar.classList.toggle('warn', left < 1000); if (left <= 0) { hide(); return false; } });
    }
    function hide() {
      showing = false; bar.hidden = true; title.textContent = `Rodada ${r + 1} de ${rounds.length} — Sua vez! Toque na mesma ordem.`;
      seqEl.innerHTML = seq.map(() => '<span class="slot hide">?</span>').join(''); lock(false); ctx.sfx('pop');
    }
    pal.forEach(b => ctx.on(b, 'click', () => {
      if (showing || ctx.done) return; const k = b.dataset.k; ctx.note(+b.dataset.i);
      if (k === seq[idx]) { const s = seqEl.children[idx]; s.className = 'slot filled'; s.innerHTML = icon(k); idx++;
        if (idx === seq.length) { dots[r].classList.add('on'); lock(true); ctx.sfx('ok'); r++; if (r === rounds.length) ctx.after(700, () => ctx.win()); else { ctx.say('Muito bem! Agora vem mais um símbolo…'); ctx.after(1500, startRound); } } }
      else { lock(true); b.classList.add('bad'); ctx.mistake(2, 'Ops! Os fantasminhas embaralharam tudo. Vamos de novo!'); seqEl.innerHTML = seq.map(k2 => `<span class="slot filled" style="border-color:#c2185b">${icon(k2)}</span>`).join(''); ctx.after(1800, () => { b.classList.remove('bad'); startRound(); }); }
    }));
    ctx.after(500, startRound);
  }
});

/* =====================================================================
   FASE 5 — O LIVRO PROIBIDO
   ===================================================================== */
M.phase({
  id: 5, title: 'O Livro Proibido', room: 'study', transition: 'door', difficulty: 1, kind: 'Busca visual', par: 150,
  intro: 'Na Biblioteca, um livro enorme repousa sobre uma mesa. Na capa está escrito: "Só abre para quem for curioso". Dizem que um símbolo secreto se esconde no meio das palavras.',
  objective: 'Vire as páginas e encontre o desenho do OLHO escondido no meio do texto. Cuidado com os símbolos parecidos!',
  success: 'O olho piscou e o livro soltou um "puf" de poeira mágica. Uma estante girou, revelando outra porta!',
  hints: [
    'O símbolo é bem pequenininho e fica no meio das frases, entre as palavras. Leia com calma: você também aprende a história da casa!',
    rt => `O olho está na página ${rt.target + 1}.`,
    rt => `Vá até a página ${rt.target + 1} e toque no desenho do olho (um olho aberto, com a pupila no meio).`
  ],
  start(ctx) {
    const P = [
      ['A Casa Bruxuleio', 'Há muito tempo, a família Bruxuleio construiu esta mansão {i} no alto da colina. Eles adoravam festas, bolo de abóbora {i} e histórias de arrepiar.'],
      ['O Barão Bigodudo', 'O Barão era o dono da casa. Toda noite ele acendia velas {i} pelos corredores para ninguém tropeçar {i} no escuro.'],
      ['Dona Cantarola', 'Dona Cantarola cantava tão alto {i} que os vidros tremiam. Ela nunca acertava a nota, mas ninguém tinha coragem {i} de contar.'],
      ['O Pequeno Pipoca', 'Pipoca era o caçula. Adorava esconder {i} os sapatos dos visitantes e rir baixinho {i} atrás das cortinas.'],
      ['O Segredo da Biblioteca', 'Dizem que existe um livro que só abre {i} para quem for gentil. Quem o encontra descobre {i} onde a chave foi escondida.'],
      ['A Noite da Tempestade', 'Numa noite de trovões {i} todas as portas se fecharam sozinhas. Os fantasminhas riram {i} tanto que esqueceram como abri-las.'],
      ['O Relógio Parado', 'O relógio da sala parou na hora do susto. Desde então {i} ele guarda um código {i} que só os curiosos descobrem.'],
      ['Um Pedido de Amizade', 'No fundo, os fantasmas só queriam companhia {i}. Quem resolver todos os enigmas {i} poderá ser amigo deles.']
    ];
    const target = ri(1, P.length - 1); ctx.rt.target = target; const decoys = ['drop', 'skull', 'spiral', 'star', 'cross', 'bell', 'crown'];
    const html = P.map((pg, pi) => { let n = 0, eyeAt = pi === target ? ri(0, 1) : -1;
      return pg[1].replace(/\{i\}/g, () => { const k = n === eyeAt ? 'eye' : pick(decoys); n++; return `<button class="inl" data-i="${k}" aria-label="símbolo escondido">${icon(k)}</button>`; }); });
    ctx.mount(`<div class="p5">
      <p class="title-line">Procure este símbolo escondido no texto: <span style="display:inline-block;width:26px;color:var(--candle)">${icon('eye')}</span> (um olho aberto)</p>
      <div class="book" id="book"><div class="cover" id="cover" role="button" tabindex="0"><span style="color:#e8c878">${icon('book')}</span><h3>Livro Proibido</h3><small>Toque para abrir</small></div>
        <div class="page" id="page" hidden></div></div>
      <div class="flipbtns" id="flip" hidden><button class="btn sm" id="bPrev">◀ Anterior</button><span class="tiny" id="bNum"></span><button class="btn sm" id="bNext">Próxima ▶</button></div></div>`);
    const cover = ctx.$('#cover'), page = ctx.$('#page'), flip = ctx.$('#flip'); let cur = 0, busy = false;
    const render = () => { page.innerHTML = `<h3>${P[cur][0]}</h3><p>${html[cur]}</p><span class="pn">página ${cur + 1}/${P.length}</span>`; ctx.$('#bNum').textContent = `${cur + 1} / ${P.length}`;
      page.querySelectorAll('.inl').forEach(b => ctx.on(b, 'click', () => {
        if (ctx.done) return;
        if (b.dataset.i === 'eye') { b.classList.add('hit'); ctx.sfx('ok'); ctx.clue('p5', cur + 1); ctx.say('Achou! O olho piscou para você.'); ctx.after(1100, () => ctx.win()); }
        else { ctx.mistake(4, 'Esse não é o olho… continue procurando!'); ctx.shake(b); }
      })); };
    const go = d => { const n = cur + d; if (busy || n < 0 || n >= P.length || ctx.done) return; busy = true; ctx.sfx('page'); page.classList.add('out');
      ctx.after(300, () => { cur = n; page.classList.remove('out'); render(); page.classList.add('in'); ctx.after(360, () => { page.classList.remove('in'); busy = false; }); }); };
    const openBook = () => { if (!cover.hidden && !cover.classList.contains('opened')) { ctx.sfx('door'); cover.classList.add('opened'); ctx.after(700, () => { cover.hidden = true; page.hidden = false; flip.hidden = false; render(); page.classList.add('in'); }); } };
    ctx.on(cover, 'click', openBook); ctx.on(cover, 'keydown', e => { if (e.key === 'Enter') openBook(); });
    ctx.on(ctx.$('#bPrev'), 'click', () => go(-1)); ctx.on(ctx.$('#bNext'), 'click', () => go(1));
    ctx.on(document, 'keydown', e => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
  }
});

/* =====================================================================
   FASE 6 — RESPOSTA RÁPIDA  (matemática: soma/subtração, ×÷ e dinheiro)
   ===================================================================== */
M.phase({
  id: 6, title: 'Resposta Rápida', room: 'hall', transition: 'corridor', transitionText: 'Uma porta que faz tic-tac…', difficulty: 2, kind: 'Problemas e cronômetro', par: 150,
  intro: 'Uma porta com um relógio no meio faz "tic-tac" sem parar. Problemas de matemática aparecem na tela e um cronômetro vai contando o seu tempo. Sem pressão: quanto mais rápido e certeiro, mais pontos!',
  objective: 'Resolva 6 problemas (contas, multiplicação, divisão e dinheiro). O cronômetro sobe enquanto você joga. Errou? O Fifi mostra como fazer e você segue em frente.',
  success: 'O relógio deu meia-noite: DOOOM! E a porta se abriu de uma vez.',
  hints: [
    'Leia com calma e ache os números. Depois pergunte: preciso JUNTAR, TIRAR, REPETIR ou REPARTIR? Não há limite de tempo por pergunta. Use as teclas 1 a 4 para responder.',
    rt => rt.cur ? 'Sobre este problema: ' + rt.cur.dica : 'Leia o problema com calma.',
    rt => rt.cur ? `Passo a passo: ${rt.cur.sol}. A resposta é ${rt.cur.a}.` : 'Leia o problema com calma.'
  ],
  start(ctx) {
    const NEED = 6; let right = 0, errs = 0, qi = 0, cur = null, locked = false, shown = -1;
    const bank = M.Banco.plano([['soma-sub', 4], ['mult-div', 4], ['dinheiro', 4]]);
    ctx.mount(`<div class="quiz panel"><div class="qstats"><span>Acertos: <b id="qR">0/${NEED}</b></span><span id="qE"></span></div>
      <div class="qtext" id="qT"></div><div class="opts" id="qO"></div></div>`);
    const qR = ctx.$('#qR'), qE = ctx.$('#qE'), qT = ctx.$('#qT'), qO = ctx.$('#qO');
    const stats = () => { qR.textContent = `${right}/${NEED}`; qE.innerHTML = 'Erros: <b>' + errs + '</b>'; };
    function next() {
      locked = false; cur = ctx.rt.cur = bank[qi++ % bank.length]; stats();
      qT.innerHTML = fx(cur.q);
      qO.innerHTML = shuffle([cur.a, ...cur.w]).map((o, i) => `<button class="btn" data-a="${o.replace(/"/g, '&quot;')}"><small style="opacity:.6">${i + 1}</small> ${fx(o)}</button>`).join('');
      qO.querySelectorAll('.btn').forEach(b => ctx.on(b, 'click', () => answer(b.dataset.a, b)));
    }
    function answer(a, btn) {
      if (locked || ctx.done) return; locked = true;
      const all = qO.querySelectorAll('.btn'); all.forEach(b => { b.disabled = true; if (b.dataset.a === cur.a) b.classList.add('right'); });
      if (a === cur.a) { right++; ctx.sfx('ok'); stats(); if (right >= NEED) { ctx.after(700, () => ctx.win()); return; } ctx.after(750, next); }
      else {
        if (btn) btn.classList.add('wrong'); errs++; ctx.mistake(0); ctx.say('Quase! Veja como fazer: ' + cur.sol, 6000); stats();
        ctx.after(3200, next);
      }
    }
    ctx.on(document, 'keydown', e => { if (/^[1-4]$/.test(e.key) && !locked) { const b = qO.querySelectorAll('.btn')[+e.key - 1]; if (b) answer(b.dataset.a, b); } });
    ctx.frame(() => { const sec = Math.floor(ctx.elapsed()); if (sec !== shown) { shown = sec; ctx.timer(Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0')); } });
    next();
  }
});

/* =====================================================================
   FASE 7 — O FANTASMA ASCENDENTE  (matemática: frações e várias etapas)
   ===================================================================== */
M.phase({
  id: 7, title: 'O Fantasma Ascendente', room: 'stairs', transition: 'stairs', transitionText: 'Subindo as escadas…', difficulty: 2, kind: 'Problemas e pressão', par: 200,
  intro: 'Você sobe a grande escadaria e ouve um "uuuuuh". Dona Cantarola está subindo atrás de você, cantando desafinada! Se ela chegar ao topo da tela, ninguém aguenta a cantoria!',
  objective: 'Resolva 8 problemas (frações e problemas com mais de uma conta). Acertou? A fantasma recua. Errou? Ela sobe mais! Não deixe que chegue ao topo.',
  success: 'A Dona Cantarola ficou tão feliz que aplaudiu — e sumiu num arco-íris de fumaça. O caminho está livre!',
  hints: [
    'Sem pressa para ler: a fantasma sobe devagar. Em problemas de várias etapas, resolva UMA conta de cada vez, na ordem da história.',
    rt => rt.cur ? 'Sobre este problema: ' + rt.cur.dica : 'Leia o problema com calma.',
    rt => rt.cur ? `Passo a passo: ${rt.cur.sol}. A resposta é ${rt.cur.a}.` : 'Leia o problema com calma.'
  ],
  start(ctx) {
    const NEED = 8; let right = 0, pct = .2, qi = 0, cur = null, locked = false, beat = 0;
    const bank = M.Banco.plano([['fracoes', 5], ['multietapas', 7]]);
    ctx.mount(`<div class="p7" id="p7"><div class="topline">TOPO</div></div>
      <div class="p7host"><div class="quiz panel"><div class="qstats"><span>Acertos: <b id="qR">0/${NEED}</b></span><span class="tiny">Dona Cantarola está subindo…</span></div>
      <div class="qtext" id="qT"></div><div class="opts" id="qO"></div></div></div>`);
    const p7 = ctx.$('#p7'), gh = M.Ghosts.el('cantora', { size: 250 }); p7.appendChild(gh);
    const qR = ctx.$('#qR'), qT = ctx.$('#qT'), qO = ctx.$('#qO');
    const place = () => { const H = p7.clientHeight, g = gh.offsetHeight || 300; const y = g * .55 - pct * (H - g * .45); gh.style.transform = `translate(-50%,${y}px)`; p7.classList.toggle('warn', pct > .78); };
    place(); ctx.on(window, 'resize', place);
    ctx.frame(dt => {
      if (locked) { place(); return; }                 // enquanto lê a explicação, a fantasma espera
      pct += dt / 1000 * (.010 + .002 * right); if (pct > .78) { beat += dt; if (beat > 1300) { beat = 0; ctx.sfx('heart'); } } place();
      if (pct >= 1) { pct = 1; place(); const l = ctx.loseLife('A Dona Cantarola chegou ao topo!'); if (l > 0) { pct = .3; place(); } else return false; }
    });
    function next() {
      locked = false; cur = ctx.rt.cur = bank[qi++ % bank.length]; qR.textContent = `${right}/${NEED}`; qT.innerHTML = fx(cur.q);
      qO.innerHTML = shuffle([cur.a, ...cur.w]).map((o, i) => `<button class="btn" data-a="${o.replace(/"/g, '&quot;')}"><small style="opacity:.6">${i + 1}</small> ${fx(o)}</button>`).join('');
      qO.querySelectorAll('.btn').forEach(b => ctx.on(b, 'click', () => answer(b.dataset.a, b)));
    }
    function answer(a, btn) {
      if (locked || ctx.done) return; locked = true; const all = qO.querySelectorAll('.btn'); all.forEach(b => { b.disabled = true; if (b.dataset.a === cur.a) b.classList.add('right'); });
      if (a === cur.a) { right++; pct = Math.max(.05, pct - .16); ctx.sfx('ok'); place(); qR.textContent = `${right}/${NEED}`; ctx.say('A fantasma tropeçou e desceu um pouquinho!', 1800); if (right >= NEED) { ctx.after(800, () => ctx.win()); return; } ctx.after(800, next); }
      else { btn.classList.add('wrong'); ctx.mistake(0); pct += .12; place(); ctx.sfx('giggle'); ctx.say('Hihihi! Ela subiu um degrau. Veja como fazer: ' + cur.sol, 6500); ctx.after(3400, next); }
    }
    ctx.on(document, 'keydown', e => { if (/^[1-4]$/.test(e.key) && !locked) { const b = qO.querySelectorAll('.btn')[+e.key - 1]; if (b) answer(b.dataset.a, b); } });
    next();
  }
});

/* =====================================================================
   FASE 8 — CAÇADOR DE FANTASMAS
   ===================================================================== */
M.phase({
  id: 8, title: 'Caçador de Fantasmas', room: 'ballroom', transition: 'door', difficulty: 2, kind: 'Reflexos', par: 100,
  intro: 'O Salão de Baile está cheio de fantasminhas brincando de esconde-esconde! Só um deles tem a chave da próxima porta. Você o reconhece pelos olhos brilhantes cor de ouro.',
  objective: 'Toque só no fantasminha de OLHOS DOURADOS. Os outros são impostores! Pegue o certo em 5 rodadas.',
  success: 'O fantasminha soltou a chave e riu: "Você é rápido!" A próxima porta está aberta.',
  hints: [
    'Ignore o formato do corpo! Olhe só a cor dos olhos: o certo tem olhos dourados/amarelos brilhantes.',
    'Nas últimas rodadas, alguns impostores têm olhos laranja. Compare com o fantasminha de exemplo no topo da tela.',
    'Os fantasmas ficam mais rápidos a cada rodada. Espere um segundo, encontre o dourado, e só então toque.'
  ],
  start(ctx) {
    const GOLD = '#ffd23f', ROUNDS = 5; let r = 0, list = [], busy = false;
    ctx.mount(`<div class="p8"><p class="title-line" id="p8t"></p><div class="hunt" id="hunt"></div><div class="prog" id="p8p">${'<i></i>'.repeat(ROUNDS)}</div></div>`);
    const field = ctx.$('#hunt'), dots = ctx.$$('#p8p i'), title = ctx.$('#p8t');
    const sample = M.Ghosts.el('espectro', { glow: GOLD, size: 34 }); sample.style.cssText = 'position:relative;display:inline-block;width:34px;vertical-align:middle;margin-left:8px';
    const setTitle = () => { title.innerHTML = `Rodada ${r + 1} de ${ROUNDS} — ache o fantasminha de <b style="color:${GOLD}">olhos dourados</b> `; title.appendChild(sample); };
    function spawn() {
      field.innerHTML = ''; list = []; busy = false; setTitle(); const n = 3 + r, W = field.clientWidth, H = field.clientHeight, spd = 60 + r * 30;
      const cols = ['#5ad1ff', '#7fe0a0', '#ff8fc0', '#c9a0ff']; if (r >= 3) cols.push('#ffab40');
      const types = shuffle(['espectro', 'fogo', 'pipoca', 'sombra', 'cantora']);
      for (let i = 0; i < n; i++) {
        const target = i === 0, g = M.Ghosts.el(types[i % types.length], { glow: target ? GOLD : pick(cols), size: 0 }); g.style.width = ''; field.appendChild(g);
        const a = rnd(0, Math.PI * 2), s = spd * rnd(.75, 1.25), o = { el: g, x: rnd(20, Math.max(30, W - 100)), y: rnd(20, Math.max(30, H - 120)), vx: Math.cos(a) * s, vy: Math.sin(a) * s, target, ph: rnd(0, 6) };
        g.style.transform = `translate(${o.x}px,${o.y}px)`; list.push(o); g.addEventListener('pointerdown', ev => { ev.preventDefault(); hit(o); });
      }
      ctx.sfx('wisp');
    }
    function hit(o) {
      if (busy || ctx.done) return;
      if (o.target) { busy = true; o.el.classList.add('caught'); ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r >= ROUNDS) { ctx.say('Peguei! A chave é minha!'); ctx.after(700, () => ctx.win()); } else { ctx.say('Pegou! Agora eles ficaram mais rápidos…'); ctx.after(900, spawn); } }
      else { o.el.classList.add('decoy-out'); list.splice(list.indexOf(o), 1); ctx.sfx('giggle'); ctx.mistake(2, 'Esse era um impostor! Procure os olhos dourados.'); ctx.after(400, () => o.el.remove()); }
    }
    ctx.frame((dt, t) => {
      const W = field.clientWidth, H = field.clientHeight, s = dt / 1000;
      list.forEach(o => { const w = o.el.offsetWidth || 70, h = w * 1.3; o.x += o.vx * s; o.y += o.vy * s;
        if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx); } if (o.x > W - w) { o.x = W - w; o.vx = -Math.abs(o.vx); }
        if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy); } if (o.y > H - h) { o.y = H - h; o.vy = -Math.abs(o.vy); }
        o.el.style.transform = `translate(${o.x}px,${o.y}px)`; o.el.style.opacity = (.62 + .38 * Math.abs(Math.sin(t / 800 + o.ph))).toFixed(2); });
    });
    ctx.after(400, spawn);
  }
});

})();
