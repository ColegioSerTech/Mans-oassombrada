/* =====================================================================
   FASES 17 a 23  —  "A Mansão dos Espíritos"
   17 Fantasmas Passageiros   tocar no fantasma que carrega a resposta certa
   18 O Cofre do Barão        girar um disco de cofre arrastando (3 números)
   19 Os Sinos Musicais       sequência de sons + contas + ordem inversa
   20 O Mercadinho do Porão   ARRASTAR itens para a cesta até somar o valor
   21 O Relógio Encantado     ARRASTAR os ponteiros para marcar a hora
   22 A Balança Mágica        ARRASTAR pesos até equilibrar
   23 O Barão Interrogador    chefe: DIGITAR respostas para diminuir a energia
   ===================================================================== */
(function () {
'use strict';
const M = Mansao, icon = M.icon, T = M.Tools, B = M.Banco, fx = T.fx, { rnd, ri, pick, shuffle, clamp, cap } = M.util, R = B.R;

/* =====================================================================
   FASE 17 — FANTASMAS PASSAGEIROS
   ===================================================================== */
M.phase({
  id: 17, title: 'Fantasmas Passageiros', room: 'corridor', transition: 'corridor', transitionText: 'O trem-fantasma está chegando…', difficulty: 2, kind: 'Reflexo e resposta', par: 240,
  intro: 'Um trem-fantasma passa pelo corredor! Fantasminhas atravessam a tela carregando placas com números. Só um deles carrega a resposta certa do problema.',
  objective: 'Resolva o problema do alto da tela e toque no fantasma que segura a placa com a RESPOSTA CERTA, antes que ele saia da tela. São 5 problemas, e os fantasmas ficam mais rápidos.',
  success: 'O último fantasma soltou um "uhuuu!" e o trem-fantasma foi embora, deixando a porta aberta.',
  hints: [
    'Resolva a conta com calma ANTES de procurar a placa. Os fantasmas voltam se você deixar passar.',
    rt => 'Sobre este problema: ' + rt.cur.dica,
    rt => `Passo a passo: ${rt.cur.sol}. A resposta é ${rt.cur.a}.`
  ],
  start(ctx) {
    const probs = B.plano([['soma-sub', 1], ['mult-div', 1], ['dinheiro', 1], ['fracoes', 1], ['multietapas', 1]]); let r = 0, ghosts = [], busy = false;
    ctx.mount(`<div class="p17"><div class="panel probbox"><div class="qstats"><span>Problema <b id="pn">1</b> de 5</span><span class="tiny">toque no fantasma da resposta certa</span></div><div class="qtext" id="pq"></div></div>
      <div class="trainfield" id="tf"></div></div>`);
    const tf = ctx.$('#tf'), types = ['espectro', 'pipoca', 'fogo', 'sombra', 'cantora'];
    function launch() {
      const p = probs[r]; ctx.rt.cur = p; busy = false; ctx.$('#pn').textContent = r + 1; ctx.$('#pq').innerHTML = fx(p.q); tf.innerHTML = ''; ghosts = [];
      const W = tf.clientWidth || 800, H = tf.clientHeight || 320, lane = (H - 90) / 4, spd = 120 + r * 32, ans = shuffle([p.a, ...p.w]);
      ans.forEach((a, i) => { const g = M.Ghosts.el(types[(i + r) % 5], { size: 0 }); g.style.width = '66px'; g.style.position = 'absolute'; g.style.pointerEvents = 'auto'; g.style.cursor = 'pointer'; g.classList.remove('float');
        g.insertAdjacentHTML('afterbegin', `<div class="sign">${fx(a)}</div>`);
        const dir = i % 2 ? -1 : 1, o = { el: g, a, dir, v: spd * rnd(.9, 1.15), y: i * lane + 38, x: dir > 0 ? -90 - rnd(0, 320) : W + 30 + rnd(0, 320) };
        g.style.transform = `translate(${o.x}px,${o.y}px)`; g.addEventListener('pointerdown', e => { e.preventDefault(); hit(o); }); tf.appendChild(g); ghosts.push(o); });
      ctx.sfx('ghost');
    }
    function hit(o) {
      if (busy || ctx.done) return;
      if (o.a === ctx.rt.cur.a) { busy = true; ctx.sfx('ok'); o.el.classList.add('caught'); ghosts.forEach(g => { if (g !== o) g.v *= 2.5; }); r++; if (r === 5) ctx.after(900, () => ctx.win()); else { ctx.say('Isso! Vem outro trem…', 1600); ctx.after(1400, launch); } }
      else { ctx.mistake(3, 'Essa placa não é a resposta! Confira a conta.'); ctx.shake(o.el); o.el.style.opacity = .35; }
    }
    ctx.frame(dt => {
      if (!ghosts.length) return; const W = tf.clientWidth || 800; let alive = 0;
      ghosts.forEach(o => { o.x += o.dir * o.v * dt / 1000; o.el.style.transform = `translate(${o.x}px,${o.y}px)`; if ((o.dir > 0 && o.x < W + 20) || (o.dir < 0 && o.x > -100)) alive++; });
      if (busy) return;
      if (!alive && !busy) { busy = true; ctx.say('Eles passaram! Aí vem o trem de novo…', 2000); ctx.after(1600, launch); }
    });
    ctx.after(300, launch);
  }
});

/* =====================================================================
   FASE 18 — O COFRE DO BARÃO
   ===================================================================== */
M.phase({
  id: 18, title: 'O Cofre do Barão', room: 'study', transition: 'door', difficulty: 2, kind: 'Girar o disco', par: 300,
  intro: 'Atrás de um quadro da biblioteca há um cofre redondo, igualzinho aos dos filmes! Três bilhetes do Barão escondem os três números da combinação.',
  objective: 'Resolva as 3 contas. Gire o disco do cofre (arraste em volta ou use as setas) até o número aparecer na seta e toque em TRAVAR. Se errar um número, a combinação recomeça!',
  success: 'CLIC, CLAC, CLOC! A porta do cofre girou e mostrou a passagem secreta.',
  hints: [
    'Cada bilhete dá um número entre 10 e 39. Gire o disco até que esse número fique embaixo da setinha do topo.',
    rt => `Primeiro número: ${rt.nums[0]}. Segundo número: ${rt.nums[1]}.`,
    rt => `A combinação é ${rt.nums.join(' – ')}. ` + rt.probs.map(p => `(${p.sol})`).join(' ')
  ],
  start(ctx) {
    const probs = B.numero(3), nums = probs.map(p => p.n); Object.assign(ctx.rt, { probs, nums });
    let ticks = ''; for (let n = 0; n < 40; n++) { const a = -n * 9, big = n % 5 === 0; ticks += `<line x1="0" y1="-99" x2="0" y2="${big ? -88 : -93}" transform="rotate(${a})" stroke="#d8d0e8" stroke-width="${big ? 2.4 : 1.2}"/>`; if (big) ticks += `<text transform="rotate(${a}) translate(0,-74)" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="bold" fill="#f2e8ff" font-family="Georgia,serif">${n}</text>`; }
    ctx.mount(`<div class="p18"><div class="notes10">${probs.map((p, i) => `<div class="note sm"><h4>${i + 1}º número</h4><p>${fx(p.q)}</p></div>`).join('')}</div>
      <div class="safe" id="safe"><div class="ptr">▼</div><div class="dialwrap drag" id="dw"><div class="dialrot" id="dr"><svg viewBox="-110 -110 220 220"><circle r="106" fill="#2a2440" stroke="#8a7fb0" stroke-width="4"/><circle r="52" fill="#1a1430" stroke="#4b3f70" stroke-width="2"/>${ticks}</svg></div><div class="knob"></div></div>
        <div class="readout" id="ro">0</div></div>
      <div class="row"><button class="btn sm" id="l1" aria-label="menos um">◀ −1</button><button class="btn primary" id="trav">TRAVAR</button><button class="btn sm" id="r1" aria-label="mais um">+1 ▶</button></div>
      <div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const dr = ctx.$('#dr'), dw = ctx.$('#dw'), ro = ctx.$('#ro'), dots = ctx.$$('#pg i'); let th = 0, n = 0, step = 0, opened = false, last = 0;
    const cur = () => ((Math.round(th / 9) % 40) + 40) % 40;
    const apply = snap => { dr.style.transition = snap ? 'transform .18s' : 'none'; dr.style.transform = `rotate(${th}deg)`; const c = cur(); if (c !== n) { n = c; ctx.sfx('tick'); } ro.textContent = n; };
    const ang = e => { const r = dw.getBoundingClientRect(); return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; };
    T.drag(ctx, dw, { down(e) { last = ang(e); }, move(e) { const a = ang(e); let d = a - last; if (d > 180) d -= 360; if (d < -180) d += 360; th += d; last = a; apply(false); }, up() { th = Math.round(th / 9) * 9; apply(true); } });
    ctx.on(ctx.$('#l1'), 'click', () => { th -= 9; apply(true); }); ctx.on(ctx.$('#r1'), 'click', () => { th += 9; apply(true); });
    ctx.on(document, 'keydown', e => { if (e.key === 'ArrowLeft') { th -= 9; apply(true); } if (e.key === 'ArrowRight') { th += 9; apply(true); } if (e.key === 'Enter') ctx.$('#trav').click(); });
    ctx.on(ctx.$('#trav'), 'click', () => {
      if (opened) return;
      if (n === nums[step]) { dots[step].classList.add('on'); ctx.sfx('key'); step++; if (step === 3) { opened = true; ctx.clue('p18', nums.join('-')); ctx.after(400, () => ctx.sfx('door')); ctx.$('#safe').classList.add('open'); ctx.after(1700, () => ctx.win()); } else ctx.say(`Travou! Agora o ${step + 1}º número.`, 2000); }
      else { ctx.mistake(4, 'Errado! O cofre destravou tudo. Recomece a combinação.'); step = 0; dots.forEach(d => d.classList.remove('on')); ctx.shake(ctx.$('#safe')); }
    });
    apply(false);
  }
});

/* =====================================================================
   FASE 19 — OS SINOS MUSICAIS
   ===================================================================== */
M.phase({
  id: 19, title: 'Os Sinos Musicais', room: 'ballroom', transition: 'door', difficulty: 2, kind: 'Sequência e contas', par: 300,
  intro: 'Seis sinos encantados pendem do teto do salão de baile, cada um com um número e um som. Os fantasminhas tocam melodias… e a última melodia só pode ser tocada por quem sabe fazer contas!',
  objective: 'Rodada 1 e 2: repita a melodia que os sinos tocam. Rodada 3: toque os sinos com os RESULTADOS das contas, na ordem. Rodada 4: repita a melodia de trás para frente!',
  success: 'A melodia final ecoou pelo salão e uma porta dourada se abriu no fundo.',
  hints: [
    'Preste atenção nas luzes e nos sons. Cante mentalmente: "dó, ré, mi…". Pode ser útil falar os números em voz baixa.',
    rt => rt.dica,
    rt => rt.sol
  ],
  start(ctx) {
    ctx.mount(`<div class="p19"><p class="title-line" id="t19"></p><div class="note" id="exp" hidden style="transform:none"><h4>Contas</h4><p id="expT" style="font-size:22px;text-align:center"></p></div>
      <div class="bells" id="bells">${[1, 2, 3, 4, 5, 6].map(n => `<button class="bell" data-n="${n}" aria-label="sino ${n}" disabled><span class="bi">${icon('bell')}</span><b>${n}</b></button>`).join('')}</div>
      <div class="prog" id="pg">${'<i></i>'.repeat(4)}</div></div>`);
    const bells = ctx.$$('.bell'), t = ctx.$('#t19'), dots = ctx.$$('#pg i'); let r = 0, exp = [], idx = 0, accept = false;
    const ring = i => { bells[i].classList.remove('ring'); void bells[i].offsetWidth; bells[i].classList.add('ring'); ctx.note(i, .5); };
    const lock = v => bells.forEach(b => b.disabled = v);
    const expr = res => { const o = []; if (res >= 2) { const x = ri(1, res - 1); o.push(`${x} + ${res - x}`); } const k = ri(1, 5); o.push(`${res + k} − ${k}`); [2, 3].forEach(f => { if (res % f === 0 && res / f > 1) o.push(`${f} × ${res / f}`); }); o.push(`${res * 2} ÷ 2`); return pick(o); };
    function play(seq, then) { lock(true); accept = false; let i = 0; const go = () => { if (i >= seq.length) { ctx.after(400, then); return; } ring(seq[i]); i++; ctx.after(750, go); }; ctx.after(700, go); }
    function startRound() {
      idx = 0; ctx.$('#exp').hidden = true;
      if (r === 0 || r === 1) { const n = r === 0 ? 3 : 4, seq = Array.from({ length: n }, () => ri(0, 5)); exp = seq; t.textContent = `Rodada ${r + 1} de 4 — Escute a melodia…`; ctx.rt.dica = 'Sem conta aqui: só memória! Observe qual sino acende primeiro.'; ctx.rt.sol = 'A melodia é: sino ' + seq.map(i => i + 1).join(', sino ') + '.'; play(seq, listen); }
      else if (r === 2) { const res = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3), ex = res.map(expr); exp = res.map(x => x - 1); t.textContent = 'Rodada 3 de 4 — Resolva as contas e toque os sinos com os resultados, na ordem!';
        ctx.rt.dica = 'Resolva cada conta. O resultado é o número do sino.'; ctx.rt.sol = ex.map((e, i) => `${e} = ${res[i]}`).join('; ') + '.'; ctx.$('#exp').hidden = false; ctx.$('#expT').textContent = ex.join('  →  '); lock(false); accept = true; }
      else { const seq = Array.from({ length: 4 }, () => ri(0, 5)); exp = seq.slice().reverse(); t.textContent = 'Rodada 4 de 4 — Escute e toque a melodia DE TRÁS PARA FRENTE!'; ctx.rt.dica = 'O último sino que tocou é o primeiro que você toca.'; ctx.rt.sol = 'Toque: sino ' + exp.map(i => i + 1).join(', sino ') + '.'; play(seq, listen); }
    }
    function listen() { if (r === 0 || r === 1) t.textContent = `Rodada ${r + 1} de 4 — Sua vez! Repita a melodia.`; else t.textContent = 'Rodada 4 de 4 — Sua vez! De trás para frente!'; lock(false); accept = true; }
    bells.forEach((b, i) => ctx.on(b, 'click', () => {
      if (!accept || ctx.done) return; ring(i);
      if (i === exp[idx]) { idx++; if (idx === exp.length) { accept = false; lock(true); dots[r].classList.add('on'); ctx.sfx('ok'); r++; if (r === 4) ctx.after(900, () => ctx.win()); else ctx.after(1200, startRound); } }
      else { accept = false; lock(true); ctx.mistake(2, r === 2 ? 'Esse não é o resultado! Confira as contas.' : 'Ops, a melodia era outra! Vamos tentar de novo.'); ctx.after(1600, startRound); }
    }));
    ctx.after(500, startRound);
  }
});

/* =====================================================================
   FASE 20 — O MERCADINHO DO PORÃO
   ===================================================================== */
M.phase({
  id: 20, title: 'O Mercadinho do Porão', room: 'cellar', transition: 'down', transitionText: 'Descendo para o porão…', difficulty: 2, kind: 'Arrastar e somar', par: 300,
  intro: 'No porão existe um mercadinho fantasma! O caixa só entrega a chave se você comprar os itens certos, com o valor exato. Cuidado: alguns doces misteriosos guardam aranhas de mentirinha!',
  objective: 'Arraste os produtos para a cesta (ou toque neles). Some os preços e finalize a compra com o valor pedido. Evite os produtos com caveira!',
  success: 'O caixa fantasma conferiu a conta, sorriu e entregou a chave do porão.',
  hints: [
    'Some os preços dos itens na cesta e compare com o valor pedido. Tente combinações de 3 itens e ajuste.',
    rt => `Uma boa combinação usa: ${rt.sol.slice(0, 2).map(i => i.n).join(' e ')}${rt.sol.length > 2 ? ' e mais um' : ''}.`,
    rt => `Compre: ${rt.sol.map(i => `${i.n} (${R(i.p)})`).join(' + ')} = ${R(rt.target)}.`
  ],
  start(ctx) {
    const NAMES = [['Livro', 'book'], ['Sino', 'bell'], ['Coroa', 'crown'], ['Chave', 'key'], ['Estrela', 'star'], ['Lua', 'moon'], ['Vela', 'flame'], ['Sol', 'sun']];
    const stock = () => shuffle(NAMES).slice(0, 8);
    let r = 0, basket = [], items = [], target = 0, need3 = false;
    ctx.mount(`<div class="p20"><p class="title-line" id="t20"></p><div class="shelf" id="shelf"></div>
      <div class="basket" id="basket"><div class="bhead"><b>Cesta</b> — total: <span id="tot">R$ 0,00</span></div><div class="bitems" id="bit"><span class="tiny">arraste os produtos para cá</span></div></div>
      <button class="btn primary" id="fin">Finalizar compra</button><div class="prog" id="pg">${'<i></i>'.repeat(2)}</div></div>`);
    const shelf = ctx.$('#shelf'), basketEl = ctx.$('#basket'), bit = ctx.$('#bit'), tot = ctx.$('#tot'), t = ctx.$('#t20'), dots = ctx.$$('#pg i');
    function newRound() {
      basket = []; const names = stock(); const prices = shuffle([250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 900]).slice(0, 8);
      items = names.map((n, i) => ({ id: i, n: n[0], ic: n[1], p: prices[i], trap: false })); const sol = items.slice(0, 3); target = sol.reduce((a, b) => a + b.p, 0);
      items[6].trap = true; items[7].trap = true; items = shuffle(items); Object.assign(ctx.rt, { sol, target }); need3 = r === 1;
      t.innerHTML = r === 0 ? `Compras 1 de 2: gaste <b>exatamente ${R(target)}</b>.` : `Compras 2 de 2: você tem R$ ${R(target + 500).replace('R$ ', '')} e quer voltar com <b>${R(500)}</b> de troco. Compre <b>exatamente 3 itens</b>.`;
      renderShelf(); renderBasket();
    }
    const renderShelf = () => { shelf.innerHTML = items.map(i => `<button class="prod drag${i.trap ? ' trap' : ''}" data-id="${i.id}" ${basket.includes(i) ? 'disabled' : ''}><span class="pi">${icon(i.trap ? 'skull' : i.ic)}</span><b>${i.trap ? 'Doce misterioso' : i.n}</b><em>${R(i.p)}</em></button>`).join('');
      ctx.$$('.prod').forEach(b => { const it = items.find(x => x.id === +b.dataset.id); let moved = 0, sx = 0, sy = 0, ghost = null;
        ctx.on(b, 'click', e => { if (e.detail === 0) add(it, b); });   // teclado (Enter/Espaço)
        T.drag(ctx, b, { down(e) { sx = e.clientX; sy = e.clientY; moved = 0; ghost = b.cloneNode(true); ghost.classList.add('floating'); document.body.appendChild(ghost); pos(e); },
          move(e) { moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy)); pos(e); },
          up(e) { ghost && ghost.remove(); ghost = null; if (moved < 8 || T.inside(basketEl, e.clientX, e.clientY, 20)) add(it, b); } });
        function pos(e) { if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } } }); };
    function add(it, b) {
      if (basket.includes(it)) return;
      if (it.trap) { ctx.mistake(3, 'Aaah! Era uma aranha de mentirinha! Fuja dos produtos com caveira.'); ctx.shake(b); return; }
      basket.push(it); ctx.sfx('pop'); renderShelf(); renderBasket();
    }
    function renderBasket() { const s = basket.reduce((a, b) => a + b.p, 0); tot.textContent = R(s);
      bit.innerHTML = basket.length ? basket.map(i => `<button class="chip bchip" data-id="${i.id}">${icon(i.ic)} ${i.n} ${R(i.p)} ✕</button>`).join('') : '<span class="tiny">arraste os produtos para cá</span>';
      ctx.$$('.bchip').forEach(c => ctx.on(c, 'click', () => { basket = basket.filter(x => x.id !== +c.dataset.id); ctx.sfx('click'); renderShelf(); renderBasket(); })); }
    ctx.on(ctx.$('#fin'), 'click', () => {
      const s = basket.reduce((a, b) => a + b.p, 0), want = target;
      if (s === want && (!need3 || basket.length === 3)) { ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 2) ctx.after(800, () => ctx.win()); else { ctx.say('Compra certinha!', 1800); ctx.after(1400, newRound); } }
      else ctx.mistake(3, s > want ? 'Passou do valor! Tire algum item.' : s < want ? 'Ainda falta para chegar no valor certo.' : 'O valor está certo, mas confira a quantidade de itens.');
    });
    newRound();
  }
});

/* =====================================================================
   FASE 21 — O RELÓGIO ENCANTADO
   ===================================================================== */
M.phase({
  id: 21, title: 'O Relógio Encantado', room: 'hall', transition: 'stairs', transitionText: 'Subindo a escadaria…', difficulty: 2, kind: 'Arrastar os ponteiros', par: 300,
  intro: 'O grande relógio da escadaria tem os ponteiros soltos! Ele faz uma pergunta sobre o tempo, e só destrava se você marcar a resposta arrastando os ponteiros.',
  objective: 'Leia o problema, calcule o horário e ARRASTE os ponteiros: perto do centro você move o ponteiro pequeno (horas); mais para fora, o grande (minutos). Depois, confirme!',
  success: 'DOOOM! O relógio bateu certinho e o mecanismo da escada se destravou.',
  hints: [
    'Some primeiro as horas, depois os minutos. Se os minutos passarem de 60, é mais 1 hora.',
    rt => `Comece em ${rt.start}. Depois some ${rt.dur}.`,
    rt => `O horário certo é ${rt.ans}. Arraste o ponteiro grande até o ${rt.ansM / 5 || 12} e deixe o pequeno perto do ${rt.ansH}.`
  ],
  start(ctx) {
    const what = ['A aula', 'O filme', 'A viagem', 'A festa', 'O jogo'];
    const gen = r => { let h0 = ri(1, 9), m0, dh, dm; if (r === 0) { m0 = 0; [dh, dm] = pick([[1, 30], [2, 0], [2, 30]]); } else if (r === 1) { m0 = pick([15, 30, 45]); dh = 0; dm = pick([30, 45]); } else { m0 = pick([10, 20, 40, 50]); dh = 1; dm = pick([20, 30, 40, 50]); }
      const tot = h0 * 60 + m0 + dh * 60 + dm, ah = ((Math.floor(tot / 60) - 1) % 12) + 1, am = tot % 60, w = pick(what), z = n => String(n).padStart(2, '0');
      const durT = (dh ? `${dh} hora${dh > 1 ? 's' : ''}` : '') + (dh && dm ? ' e ' : '') + (dm ? `${dm} minutos` : '');
      return { q: `${w} começa às ${h0}:${z(m0)} e dura ${durT}. A que horas termina?`, ah, am, start: `${h0}:${z(m0)}`, dur: durT, ans: `${ah}:${z(am)}` }; };
    let r = 0, p = gen(0), hour = 12, min = 0, pm = 0, locked = false;
    Object.assign(ctx.rt, { start: p.start, dur: p.dur, ans: p.ans, ansM: p.am, ansH: p.ah });
    let faces = ''; for (let i = 0; i < 60; i++) faces += `<line x1="150" y1="34" x2="150" y2="${i % 5 ? 40 : 46}" transform="rotate(${i * 6} 150 150)" stroke="#5a3d22" stroke-width="${i % 5 ? 1 : 3}"/>`;
    for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; faces += `<text x="${150 + Math.sin(a) * 84}" y="${150 - Math.cos(a) * 84}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="bold" fill="#3a2410" font-family="Georgia,serif">${i}</text>`; }
    ctx.mount(`<div class="p21"><div class="panel probbox"><div class="qstats"><span>Problema <b id="pn">1</b> de 3</span><span id="mk" class="tiny"></span></div><div class="qtext" id="pq"></div></div>
      <div class="clockwrap big drag" id="cw"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="140" fill="#e8d9b5" stroke="#b08a3a" stroke-width="9"/>${faces}
        <line id="hh" x1="150" y1="150" x2="150" y2="95" stroke="#24160a" stroke-width="9" stroke-linecap="round"/><line id="mh" x1="150" y1="150" x2="150" y2="52" stroke="#a0331f" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="150" r="9" fill="#b08a3a"/><circle id="grab" cx="150" cy="52" r="15" fill="rgba(255,179,71,.35)" stroke="#ffb347" stroke-width="2"/></svg></div>
      <div class="row"><button class="btn sm" id="hm">− 1 hora</button><button class="btn primary" id="conf">Confirmar horário</button><button class="btn sm" id="hp">+ 1 hora</button></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const cw = ctx.$('#cw'), hh = ctx.$('#hh'), mh = ctx.$('#mh'), grab = ctx.$('#grab'), dots = ctx.$$('#pg i'), z = n => String(n).padStart(2, '0');
    const draw = () => { const ma = min * 6, ha = (hour % 12) * 30 + min * .5; mh.setAttribute('transform', `rotate(${ma} 150 150)`); grab.setAttribute('transform', `rotate(${ma} 150 150)`); hh.setAttribute('transform', `rotate(${ha} 150 150)`); ctx.$('#mk').textContent = `Você marcou: ${hour}:${z(min)}`; };
    const setQ = () => { ctx.$('#pn').textContent = r + 1; ctx.$('#pq').textContent = p.q; hour = 12; min = 0; draw(); };
    let zone = 'min';
    const geo = e => { const b = cw.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); return { a: (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360, r: Math.hypot(dx, dy) / (b.width / 2) }; };
    /* perto do centro = ponteiro pequeno (horas); mais para fora = ponteiro grande (minutos) */
    const setHand = (e, first) => { const g = geo(e); if (first) zone = g.r < .55 ? 'hour' : 'min';
      if (zone === 'hour') { const nh = Math.round(g.a / 30) % 12 || 12; if (nh !== hour) { hour = nh; draw(); ctx.sfx('tick'); } return; }
      const nm = Math.round(g.a / 30) * 5 % 60; if (nm === min) return;
      if (min >= 45 && nm <= 15) hour = hour % 12 + 1; else if (min <= 15 && nm >= 45) hour = hour === 1 ? 12 : hour - 1;
      min = nm; draw(); ctx.sfx('tick'); };
    T.drag(ctx, cw, { down: e => setHand(e, true), move: e => setHand(e, false) });
    ctx.on(ctx.$('#hp'), 'click', () => { hour = hour % 12 + 1; draw(); ctx.sfx('click'); }); ctx.on(ctx.$('#hm'), 'click', () => { hour = hour === 1 ? 12 : hour - 1; draw(); ctx.sfx('click'); });
    ctx.on(ctx.$('#conf'), 'click', () => {
      if (locked) return;
      if (hour === p.ah && min === p.am) { locked = true; dots[r].classList.add('on'); ctx.sfx('done'); r++; if (r === 3) ctx.after(900, () => ctx.win()); else { ctx.say('Certinho! Próximo problema…', 1600); ctx.after(1500, () => { p = gen(r); Object.assign(ctx.rt, { start: p.start, dur: p.dur, ans: p.ans, ansM: p.am, ansH: p.ah }); locked = false; setQ(); }); } }
      else ctx.mistake(3, 'Esse não é o horário certo. Confira as horas e os minutos.');
    });
    setQ();
  }
});

/* =====================================================================
   FASE 22 — A BALANÇA MÁGICA
   ===================================================================== */
M.phase({
  id: 22, title: 'A Balança Mágica', room: 'study', transition: 'stairs', transitionText: 'Subindo mais um andar…', difficulty: 3, kind: 'Arrastar pesos', par: 300,
  intro: 'Uma balança de dois pratos guarda a chave da torre. Ela só fica quietinha quando os dois lados pesam a MESMA coisa. Ao lado, uma caixa de pesinhos espera por você.',
  objective: 'Descubra o peso do prato da esquerda. Depois ARRASTE pesinhos (ou toque neles) para o prato da direita até a balança ficar equilibrada. São 3 pesagens.',
  success: 'A balança ficou parada, perfeita, e o prato da esquerda se abriu, mostrando a chave da torre!',
  hints: [
    'Calcule quanto pesa o prato da esquerda. Depois veja o que já está no prato da direita: o que FALTA é a diferença.',
    rt => `Esquerda: ${rt.left} g. Na direita já tem ${rt.fixed} g. Faltam ${rt.left - rt.fixed} g.`,
    rt => `Coloque pesinhos que somem ${rt.left - rt.fixed} g. Exemplo: ${rt.combo}.`
  ],
  start(ctx) {
    const rounds = [
      { txt: 'No prato da esquerda há <b>3 pacotes de 15 g</b>.', left: 45, items: ['15 g', '15 g', '15 g'], fixed: 0, fixedItems: [] },
      { txt: 'Na esquerda: <b>2 chocolates de 40 g e 1 bala de 7 g</b>. Na direita já há <b>1 pacote de 25 g</b>.', left: 87, items: ['40 g', '40 g', '7 g'], fixed: 25, fixedItems: ['25 g'] },
      { txt: 'Na esquerda: <b>4 maçãs de 30 g</b>. Na direita já há <b>1 pedra de 35 g</b>.', left: 120, items: ['30 g', '30 g', '30 g', '30 g'], fixed: 35, fixedItems: ['35 g'] }
    ];
    const combos = ['20 + 20 + 5', '50 + 10 + 2', '50 + 20 + 10 + 5'], W = [1, 2, 5, 10, 20, 50]; let r = 0, mine = [], done = false;
    ctx.mount(`<div class="p22"><p class="title-line" id="t22"></p>
      <div class="scale" id="scale"><div class="stand"></div><div class="beam" id="beam"><div class="pan L" id="pl"><div class="pc" id="pcl"></div></div><div class="pan R" id="pr"><div class="pc" id="pcr"></div></div></div></div>
      <div class="tray" id="tray">${W.map(w => `<button class="wt drag" data-w="${w}">${w} g</button>`).join('')}</div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const beam = ctx.$('#beam'), pcl = ctx.$('#pcl'), pcr = ctx.$('#pcr'), pr = ctx.$('#pr'), t = ctx.$('#t22'), dots = ctx.$$('#pg i');
    const chips = a => a.map(l => `<i class="ob">${l}</i>`).join('');
    function draw() {
      const rd = rounds[r], rs = rd.fixed + mine.reduce((a, b) => a + b, 0), diff = rs - rd.left;
      beam.style.setProperty('--t', (diff === 0 ? 0 : Math.sign(diff) * clamp(Math.abs(diff) * .5 + 3, 3, 14)) + 'deg');
      pcl.innerHTML = chips(rd.items); pcr.innerHTML = chips(rd.fixedItems) + mine.map((w, i) => `<button class="ob mine" data-i="${i}">${w} g</button>`).join('');
      ctx.$$('.mine').forEach(b => ctx.on(b, 'click', () => { if (done) return; mine.splice(+b.dataset.i, 1); ctx.sfx('click'); draw(); }));
      if (diff === 0 && !done && mine.length) { done = true; ctx.sfx('done'); beam.classList.add('ok'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1200, () => ctx.win()); else ctx.after(1800, newRound); }
    }
    function newRound() { done = false; mine = []; beam.classList.remove('ok'); const rd = rounds[r]; Object.assign(ctx.rt, { left: rd.left, fixed: rd.fixed, combo: combos[r] }); t.innerHTML = `Pesagem ${r + 1} de 3. ${rd.txt}`; draw(); }
    ctx.$$('.wt').forEach(b => { const w = +b.dataset.w; let sx = 0, sy = 0, moved = 0, ghost = null;
      ctx.on(b, 'click', e => { if (e.detail === 0 && !done && mine.length < 12) { mine.push(w); ctx.sfx('pop'); draw(); } });   // teclado
      T.drag(ctx, b, { down(e) { sx = e.clientX; sy = e.clientY; moved = 0; ghost = b.cloneNode(true); ghost.classList.add('floating'); document.body.appendChild(ghost); pos(e); },
        move(e) { moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy)); pos(e); },
        up(e) { ghost && ghost.remove(); ghost = null; if (done) return; if (moved < 8 || T.inside(pr, e.clientX, e.clientY, 50)) { if (mine.length < 12) { mine.push(w); ctx.sfx('pop'); draw(); } } } });
      function pos(e) { if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } } });
    newRound();
  }
});

/* =====================================================================
   FASE 23 — O BARÃO INTERROGADOR
   ===================================================================== */
M.phase({
  id: 23, title: 'O Barão Interrogador', room: 'hall', transition: 'door', difficulty: 3, kind: 'Chefe: digitar respostas', par: 400,
  intro: 'No fim da escadaria, o dono da mansão finalmente aparece: o Barão Bigodudo! Ele parece bravo, mas no fundo é um bom fantasma. Ele só deixa você passar se você provar que sabe matemática.',
  objective: 'DIGITE a resposta de cada problema e aperte Enter. Cada acerto diminui a energia do Barão. Cada erro devolve um pouquinho. Deixe a barra de energia chegar a zero!',
  success: 'O Barão tirou a cartola e riu: "Você é uma craque da matemática!" E abriu o grande portão de saída da mansão.',
  hints: [
    'Digite só a resposta: números como 42, dinheiro como 12,50 e frações como 3/8. Nos problemas de várias etapas, faça uma conta de cada vez.',
    rt => 'Sobre este problema: ' + rt.cur.dica,
    rt => `Passo a passo: ${rt.cur.sol}. A resposta é ${rt.cur.a}.`
  ],
  start(ctx) {
    const bank = B.plano([['soma-sub', 1], ['mult-div', 2], ['dinheiro', 2], ['fracoes', 2], ['soma-sub', 1], ['multietapas', 4]]); let qi = 0, hp = 100, cur = null, busy = false;
    const lines = { hit: ['Ai! Meu bigode!', 'Como você sabe isso?!', 'Hmpf… acertou.', 'Minha cartola!'], miss: ['Ha ha ha! Errou!', 'Quase, quase!', 'Tente outra vez, pequeno!', 'Fufufu!'] };
    ctx.mount(`<div class="p23"><div class="bosswrap"><div class="boss" id="boss"></div><div class="speech" id="sp">Prove o que você sabe!</div></div>
      <div class="hpbar"><span>Energia do Barão</span><div class="bar hp"><i id="hp"></i></div></div>
      <div class="quiz panel"><div class="qtext" id="q23"></div><div class="row"><input id="ans" class="inp" autocomplete="off" placeholder="Digite a resposta"><button class="btn primary" id="go">Responder</button></div></div></div>`);
    const boss = ctx.$('#boss'), sp = ctx.$('#sp'), ans = ctx.$('#ans'), hpb = ctx.$('#hp');
    boss.appendChild(M.Ghosts.el('barao', { size: 190 })); boss.firstElementChild.style.position = 'relative';
    const upd = () => { hpb.style.width = hp + '%'; };
    const next = () => { cur = ctx.rt.cur = bank[qi++ % bank.length]; ctx.$('#q23').innerHTML = fx(cur.q); ans.value = ''; ans.focus(); busy = false; };
    function send() {
      if (busy || ctx.done || !ans.value.trim()) return; busy = true;
      if (T.same(ans.value, cur.a)) { hp = Math.max(0, hp - 20); upd(); ctx.sfx('ok'); boss.classList.remove('hurt'); void boss.offsetWidth; boss.classList.add('hurt'); sp.textContent = pick(lines.hit);
        if (hp <= 0) { boss.classList.add('defeated'); sp.textContent = 'Está bem, está bem… você venceu!'; ctx.sfx('giggle'); ctx.after(1600, () => ctx.win()); return; } ctx.after(900, next); }
      else { hp = Math.min(100, hp + 10); upd(); ctx.sfx('giggle'); sp.textContent = pick(lines.miss); ctx.mistake(4); ctx.say('Passo a passo: ' + cur.sol, 5000); ctx.shake(ans); ctx.after(3200, next); }
    }
    ctx.on(ctx.$('#go'), 'click', send); ctx.on(ans, 'keydown', e => { if (e.key === 'Enter') send(); });
    upd(); next();
  }
});

})();
