/* =====================================================================
   FASES EXTRAS (24 a 33)  —  arquivo OPCIONAL da "Mansão dos Espíritos"
   Aparecem no menu como "Fases extras ⭐" depois que o aluno termina as 23 fases.
   Se este arquivo não estiver no site, o jogo principal funciona normalmente.

   24 A Confeitaria dos Fantasmas   arrastar pedaços para repartir por igual (÷ e frações)
   25 A Fila dos Fantasmas          arrastar para ORDENAR decimais e frações
   26 Ligue os Fios                 arrastar uma linha ligando pares (frações, contas, problemas)
   27 A Reta Mágica                 arrastar o fantasma até um ponto da reta numérica
   28 O Labirinto das Moedas        andar num labirinto (teclado, setas na tela ou deslizar) somando dinheiro
   29 Quebra-cabeça das Contas      quebra-cabeça deslizante com contas
   30 A Festa dos Balões            estourar balões: múltiplos e divisores
   31 O Mapa do Tesouro             plano cartesiano (coordenadas)
   32 O Jardim do Fantasma          arrastar o canto do jardim: área e perímetro
   33 A Torre do Barão              Torre de Hanói + padrão dos movimentos
   ===================================================================== */
(function () {
'use strict';
const M = Mansao, icon = M.icon, T = M.Tools, B = M.Banco, fx = T.fx, { rnd, ri, pick, shuffle, clamp, cap } = M.util, R = B.R;
const dec = n => String(n).replace('.', ',');
const NOMES = ['Fifi', 'Pipoca', 'Bruma', 'Nuvem', 'Lua', 'Fumaça'];
/** arrasta um elemento (clone flutuante) e diz onde soltou. h = { tap(), drop(x,y) } */
function dragItem(ctx, node, h) {
  let sx = 0, sy = 0, moved = 0, ghost = null;
  const pos = e => { if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } };
  ctx.on(node, 'click', e => { if (e.detail === 0) h.tap && h.tap(); });                 // teclado
  T.drag(ctx, node, {
    down(e) { sx = e.clientX; sy = e.clientY; moved = 0; ghost = node.cloneNode(true); ghost.classList.add('floating'); ghost.style.width = node.offsetWidth + 'px'; document.body.appendChild(ghost); pos(e); },
    move(e) { moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy)); pos(e); },
    up(e) { ghost && ghost.remove(); ghost = null; if (moved < 8) h.tap && h.tap(); else h.drop && h.drop(e.clientX, e.clientY); }
  });
}

/* =====================================================================
   24 — A CONFEITARIA DOS FANTASMAS
   ===================================================================== */
M.phase({
  id: 24, title: 'A Confeitaria dos Fantasmas', room: 'lounge', transition: 'door', transitionText: 'Cheirinho de bolo…', difficulty: 2, kind: 'Arrastar e repartir', par: 300, extra: true, checkpoint: true,
  intro: 'Bem-vindo às fases extras! Na confeitaria da mansão, os fantasminhas estão famintos e brigando por causa dos doces. Só um cozinheiro esperto consegue repartir tudo de forma justa.',
  objective: 'Arraste os pedaços para os pratos (ou toque no pedaço e depois no prato). Todos os fantasminhas precisam ficar com a MESMA quantidade. Depois, toque em Servir!',
  success: 'Ninguém reclamou! Cada fantasminha recebeu a sua parte justa e a cozinha inteira aplaudiu.',
  hints: [
    'Para repartir por igual, use a divisão: total de pedaços ÷ número de pratos.',
    rt => `${rt.n} ÷ ${rt.p} = ${rt.k}. Cada prato deve ficar com ${rt.k}.`,
    rt => `Coloque ${rt.k} pedaços em cada um dos ${rt.p} pratos.`
  ],
  start(ctx) {
    const rounds = [
      { n: 12, p: 3, cls: 'cake', txt: 'O bolo tem <b>12 pedaços</b>. Divida <b>igualmente</b> entre os <b>3</b> fantasminhas.' },
      { n: 8, p: 4, cls: 'pizza', txt: 'A pizza tem <b>8 fatias</b>. Cada um dos <b>4</b> fantasminhas deve ficar com <b>1/4</b> da pizza.' },
      { n: 20, p: 5, cls: 'cookie', txt: 'Há <b>20 biscoitos</b>. Cada um dos <b>5</b> fantasminhas deve ficar com <b>1/5</b> deles.' }
    ];
    let r = 0, loc = [], sel = -1; const names = shuffle(NOMES);
    ctx.mount(`<div class="p24"><p class="title-line" id="t24"></p><div class="pile drop" data-p="-1" id="pile"></div><div class="plates" id="plates"></div>
      <button class="btn primary" id="serve">Servir!</button><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const pile = ctx.$('#pile'), plates = ctx.$('#plates'), dots = ctx.$$('#pg i');
    function newRound() { const { n, p, txt } = rounds[r]; loc = Array(n).fill(-1); sel = -1; Object.assign(ctx.rt, { n, p, k: n / p }); ctx.$('#t24').innerHTML = fx(txt); draw(); }
    function draw() {
      const { n, p, cls } = rounds[r], piece = i => `<button class="piece ${cls} drag${sel === i ? ' sel' : ''}" data-i="${i}" aria-label="pedaço ${i + 1}"></button>`;
      pile.innerHTML = loc.map((l, i) => l === -1 ? piece(i) : '').join('') || '<span class="tiny">todos os pedaços já estão nos pratos</span>';
      plates.innerHTML = Array.from({ length: p }, (_, k) => `<div class="plate drop" data-p="${k}"><span class="pl">${icon('ghost')}<small>${names[k]}</small></span><div class="pp">${loc.map((l, i) => l === k ? piece(i) : '').join('')}</div></div>`).join('');
      ctx.$$('.piece').forEach(b => { const i = +b.dataset.i; dragItem(ctx, b, { tap() { sel = sel === i ? -1 : i; ctx.sfx('click'); draw(); }, drop(x, y) { const z = ctx.$$('.drop').find(d => T.inside(d, x, y, 6)); if (z) put(i, +z.dataset.p); } }); });
      ctx.$$('.drop').forEach(d => ctx.on(d, 'click', e => { if (sel >= 0 && !e.target.closest('.piece')) put(sel, +d.dataset.p); }));
    }
    function put(i, k) { loc[i] = k; sel = -1; ctx.sfx('pop'); draw(); }
    ctx.on(ctx.$('#serve'), 'click', () => {
      const { p, n } = rounds[r]; const cnt = Array.from({ length: p }, (_, k) => loc.filter(l => l === k).length);
      if (loc.includes(-1)) { ctx.mistake(4, 'Ainda sobraram pedaços na mesa! Sirva todos.'); return; }
      if (cnt.every(c => c === n / p)) { ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(900, () => ctx.win()); else { ctx.say('Todo mundo feliz! Próxima rodada…', 1800); ctx.after(1500, newRound); } }
      else ctx.mistake(4, 'Alguém ficou com mais e alguém com menos! Confira a divisão.');
    });
    newRound();
  }
});

/* =====================================================================
   25 — A FILA DOS FANTASMAS
   ===================================================================== */
M.phase({
  id: 25, title: 'A Fila dos Fantasmas', room: 'hall', transition: 'door', difficulty: 2, kind: 'Arrastar para ordenar', par: 300, extra: true,
  intro: 'Os fantasminhas querem entrar na sala em ordem certinha, mas cada um usa um número no peito e ninguém sabe quem é maior! Você precisa organizar a fila.',
  objective: 'Arraste um fantasminha e solte sobre outro para trocá-los de lugar (ou toque em dois). Ordene como o quadro pede: do menor para o maior, ou do maior para o menor.',
  success: 'A fila ficou perfeita! Os fantasminhas marcharam em ordem e a porta se abriu.',
  hints: [
    'Para comparar decimais, olhe primeiro a parte inteira e depois os décimos: 0,7 é maior que 0,25 porque 7 décimos > 2 décimos.',
    rt => `Transforme tudo em decimal: ${rt.itens.map(i => i.t + ' = ' + dec(i.v)).join(' · ')}.`,
    rt => 'A ordem certa é: ' + rt.certa.join(' → ') + '.'
  ],
  start(ctx) {
    const F = (n, d) => ({ v: n / d, h: fx(n + '/' + d), t: n + '/' + d }), D = v => ({ v, h: dec(v), t: dec(v) });
    const pools = [
      { asc: true, pool: [0.1, 0.25, 0.4, 0.5, 0.7, 0.75, 1.05, 1.2, 1.5, 2.5].map(D) },
      { asc: false, pool: [[1, 2], [1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [7, 8]].map(a => F(...a)) },
      { asc: true, pool: [F(1, 2), F(1, 4), F(3, 4), D(0.6), D(0.9), D(0.3), F(1, 5), D(0.85)] }
    ];
    let r = 0, order = [], sel = -1;
    ctx.mount(`<div class="p25"><p class="title-line" id="t25"></p><div class="qrow" id="qr"></div><div class="tiny" id="dir"></div><button class="btn primary" id="chk">Conferir a fila</button><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const qr = ctx.$('#qr'), dots = ctx.$$('#pg i');
    function newRound() {
      const { asc, pool } = pools[r]; let it; do { it = shuffle(pool).slice(0, 5); } while (new Set(it.map(x => x.v)).size < 5);
      order = it.slice(); const sorted = it.slice().sort((a, b) => asc ? a.v - b.v : b.v - a.v); if (order.every((x, i) => x === sorted[i])) order.reverse();
      Object.assign(ctx.rt, { itens: it, certa: sorted.map(x => x.t) }); sel = -1;
      ctx.$('#t25').innerHTML = `Fila ${r + 1} de 3: ordene do <b>${asc ? 'MENOR para o MAIOR' : 'MAIOR para o MENOR'}</b>.`; ctx.$('#dir').textContent = asc ? '◀ menor ............ maior ▶' : '◀ maior ............ menor ▶'; draw();
    }
    function draw() {
      qr.innerHTML = order.map((x, i) => `<button class="gcard drag${sel === i ? ' sel' : ''}" data-i="${i}"><span class="gi">${icon('ghost')}</span><b>${x.h}</b></button>`).join('');
      ctx.$$('.gcard').forEach(c => { const i = +c.dataset.i;
        dragItem(ctx, c, { tap() { if (sel < 0) sel = i; else if (sel === i) sel = -1; else { swap(sel, i); return; } ctx.sfx('click'); draw(); },
          drop(x, y) { const o = ctx.$$('.gcard').find(g => g !== c && T.inside(g, x, y)); if (o) swap(i, +o.dataset.i); } }); });
    }
    function swap(a, b) { [order[a], order[b]] = [order[b], order[a]]; sel = -1; ctx.sfx('pop'); draw(); }
    ctx.on(ctx.$('#chk'), 'click', () => {
      const asc = pools[r].asc, ok = order.every((x, i) => i === 0 || (asc ? order[i - 1].v < x.v : order[i - 1].v > x.v));
      if (ok) { ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(900, () => ctx.win()); else { ctx.say('Fila certinha!', 1600); ctx.after(1300, newRound); } }
      else ctx.mistake(4, 'A fila ainda está fora de ordem. Compare os números de novo!');
    });
    newRound();
  }
});

/* =====================================================================
   26 — LIGUE OS FIOS
   ===================================================================== */
M.phase({
  id: 26, title: 'Ligue os Fios', room: 'study', transition: 'door', difficulty: 2, kind: 'Ligar pares', par: 300, extra: true,
  intro: 'Na biblioteca há uma máquina antiga cheia de fios soltos. Cada fio da esquerda precisa ser ligado ao seu par da direita, senão a máquina não funciona!',
  objective: 'Arraste uma linha de cada item da esquerda até o seu par na direita (ou toque no da esquerda e depois no da direita). Ligue os 5 pares e toque em Conferir.',
  success: 'A máquina ligou, soltou faíscas e abriu uma gaveta secreta cheia de chaves!',
  hints: [
    'Comece pelos pares mais fáceis e vá eliminando. Se um item da direita já foi usado, ele não serve para outro.',
    rt => rt.dica,
    rt => 'Os pares certos são: ' + rt.pares.join(' · ')
  ],
  start(ctx) {
    const frPairs = [['1/2', '0,5'], ['1/4', '0,25'], ['3/4', '0,75'], ['1/5', '0,2'], ['1/10', '0,1'], ['2/5', '0,4']];
    const wordPairs = [['Juntar 15 e 8', '15 + 8'], ['Repartir 24 doces entre 4', '24 ÷ 4'], ['3 pacotes com 5 balas', '3 × 5'], ['Tinha 20 e gastou 7', '20 − 7'], ['Metade de 10', '10 ÷ 2'], ['Dobro de 9', '9 × 2'], ['12 e mais 6 a mais', '12 + 6']];
    const rounds = [
      () => ({ dica: 'Metade é 0,5. Um quarto é a metade da metade.', pairs: shuffle(frPairs).slice(0, 5) }),
      () => { const s = new Set(), ps = []; while (ps.length < 5) { const c = B.conta(2); if (!s.has(c.r)) { s.add(c.r); ps.push([c.e, String(c.r)]); } } return { dica: 'Calcule cada conta da esquerda e procure o resultado.', pairs: ps }; },
      () => ({ dica: 'Repartir é ÷, juntar é +, gastar é −, grupos iguais é ×.', pairs: shuffle(wordPairs).slice(0, 5) })
    ];
    let r = 0, pairs = [], right = [], conn = {}, selL = -1;
    ctx.mount(`<div class="p26"><p class="title-line" id="t26"></p><div class="lk" id="lk"><svg class="lk-svg" id="svg"></svg><div class="lkc" id="lc"></div><div class="lkc" id="rc"></div></div>
      <button class="btn primary" id="chk">Conferir</button><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const lk = ctx.$('#lk'), svg = ctx.$('#svg'), dots = ctx.$$('#pg i'); let tmp = null, bad = [];
    function newRound() {
      const rd = rounds[r](); pairs = rd.pairs; right = shuffle(pairs.map((p, i) => ({ h: p[1], k: i }))); conn = {}; selL = -1; bad = [];
      Object.assign(ctx.rt, { dica: rd.dica, pares: pairs.map(p => p[0] + ' ↔ ' + p[1]) });
      ctx.$('#t26').textContent = `Máquina ${r + 1} de 3: ligue cada item ao seu par.`;
      ctx.$('#lc').innerHTML = pairs.map((p, i) => `<button class="lki drag" data-i="${i}">${fx(p[0])}<i class="dot"></i></button>`).join('');
      ctx.$('#rc').innerHTML = right.map((p, j) => `<button class="lki rt" data-j="${j}"><i class="dot"></i>${fx(p.h)}</button>`).join('');
      ctx.$$('#lc .lki').forEach(b => { const i = +b.dataset.i;
        ctx.on(b, 'click', e => { if (e.detail === 0) pickL(i); });
        let sx = 0, sy = 0, moved = 0;
        T.drag(ctx, b, { down(e) { sx = e.clientX; sy = e.clientY; moved = 0; tmp = { i, x: e.clientX, y: e.clientY }; },
          move(e) { moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy)); tmp.x = e.clientX; tmp.y = e.clientY; lines(); },
          up(e) { const t = tmp; tmp = null; const rj = ctx.$$('#rc .lki').find(x => T.inside(x, e.clientX, e.clientY, 8)); if (moved < 8) pickL(i); else if (rj) link(i, +rj.dataset.j); lines(); } }); });
      ctx.$$('#rc .lki').forEach(b => ctx.on(b, 'click', () => { if (selL >= 0) link(selL, +b.dataset.j); }));
      lines();
    }
    function pickL(i) { selL = selL === i ? -1 : i; ctx.sfx('click'); ctx.$$('#lc .lki').forEach(b => b.classList.toggle('sel', +b.dataset.i === selL)); }
    function link(i, j) { for (const k in conn) if (conn[k] === j) delete conn[k]; conn[i] = j; selL = -1; bad = []; ctx.sfx('pop'); ctx.$$('#lc .lki').forEach(b => b.classList.remove('sel')); lines(); }
    const dotOf = (el, side) => { const b = lk.getBoundingClientRect(), d = el.getBoundingClientRect(); return { x: (side === 'r' ? d.right : d.left) - b.left, y: d.top + d.height / 2 - b.top }; };
    function lines() {
      const L = ctx.$$('#lc .lki'), Rr = ctx.$$('#rc .lki'); let s = '';
      for (const i in conn) { const a = dotOf(L[i], 'r'), c = dotOf(Rr[conn[i]], 'l'); s += `<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}" class="${bad.includes(+i) ? 'bad' : ''}"/>`; }
      if (tmp) { const a = dotOf(L[tmp.i], 'r'), b = lk.getBoundingClientRect(); s += `<line x1="${a.x}" y1="${a.y}" x2="${tmp.x - b.left}" y2="${tmp.y - b.top}" class="tmp"/>`; }
      svg.innerHTML = s;
    }
    ctx.on(window, 'resize', lines);
    ctx.on(ctx.$('#chk'), 'click', () => {
      if (Object.keys(conn).length < 5) { ctx.say('Ainda faltam fios para ligar!', 2000); ctx.sfx('err'); return; }
      bad = Object.keys(conn).map(Number).filter(i => right[conn[i]].k !== i);
      if (!bad.length) { ctx.sfx('done'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1000, () => ctx.win()); else { ctx.say('Máquina ligada!', 1600); ctx.after(1400, newRound); } }
      else { const w = bad.length; ctx.mistake(3, `${w} ${w > 1 ? 'ligações estão erradas' : 'ligação está errada'}! Elas ficaram vermelhas.`); lines(); ctx.after(1400, () => { bad.forEach(i => delete conn[i]); bad = []; lines(); }); }
    });
    newRound();
  }
});

/* =====================================================================
   27 — A RETA MÁGICA
   ===================================================================== */
M.phase({
  id: 27, title: 'A Reta Mágica', room: 'mirrors', transition: 'door', difficulty: 2, kind: 'Reta numérica', par: 300, extra: true,
  intro: 'No corredor dos espelhos existe uma reta de luz com riscos coloridos. O fantasminha Nuvem adora passear por ela, mas só para no número que você pedir!',
  objective: 'Arraste o fantasminha pela reta até o ponto do número pedido (ou use as setas ← →). Conte os risquinhos com cuidado e toque em Confirmar.',
  success: 'O fantasminha parou exatamente no lugar certo e a reta de luz virou uma escada dourada!',
  hints: [
    'Veja quantas partes iguais a reta tem entre um número escrito e o outro: cada risquinho vale uma dessas partes.',
    rt => `Aqui, cada risquinho vale ${rt.passo}. O ponto pedido é o risquinho número ${rt.idx} contando a partir do zero.`,
    rt => `Leve o fantasminha até o risquinho ${rt.idx} (${rt.alvo}).`
  ],
  start(ctx) {
    const rounds = [
      () => { const k = pick([3, 4, 6, 7, 8]); return { max: 1, n: 10, idx: k, label: dec(k / 10), passo: '1 décimo (0,1)' }; },
      () => { const k = pick([1, 3]); return { max: 1, n: 4, idx: k, label: fx(k + '/4'), passo: '1/4' }; },
      () => { const k = pick([1, 3]); return { max: 2, n: 4, idx: k, label: k === 1 ? fx('1/2') : `1 ${fx('1/2')}`, passo: '1/2 (0,5)' }; }
    ];
    let r = 0, cur = null, pos = 0;
    ctx.mount(`<div class="p27"><p class="title-line" id="t27"></p><div class="nline drag" id="nl"><div class="nbar"></div><div id="ticks"></div><button class="ntok" id="tok" aria-label="fantasminha">${icon('ghost')}</button></div>
      <div class="row"><button class="btn sm" id="lf">◀</button><button class="btn primary" id="cf">Confirmar</button><button class="btn sm" id="rt2">▶</button></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const nl = ctx.$('#nl'), tok = ctx.$('#tok'), dots = ctx.$$('#pg i');
    function newRound() {
      cur = rounds[r](); pos = 0; const { max, n } = cur, unit = max / n; Object.assign(ctx.rt, { passo: cur.passo, idx: cur.idx, alvo: dec(cur.idx * unit) });
      ctx.$('#t27').innerHTML = `Reta ${r + 1} de 3: leve o fantasminha até <b>${cur.label}</b>.`;
      let s = ''; for (let i = 0; i <= n; i++) s += `<i class="tk" style="left:${i / n * 100}%"></i>`;
      const lab = max === 1 ? [[0, '0'], [n, '1']] : [[0, '0'], [n / 2, '1'], [n, '2']];   // só as pontas (e o 1) têm número
      lab.forEach(([i, t]) => { s += `<b class="tl" style="left:${i / n * 100}%">${t}</b>`; });
      ctx.$('#ticks').innerHTML = s; place();
    }
    const place = () => { tok.style.left = pos / cur.n * 100 + '%'; };
    const idxAt = x => { const b = nl.getBoundingClientRect(); return clamp(Math.round((x - b.left) / b.width * cur.n), 0, cur.n); };
    T.drag(ctx, nl, { down(e) { pos = idxAt(e.clientX); place(); ctx.sfx('tick'); }, move(e) { const p = idxAt(e.clientX); if (p !== pos) { pos = p; place(); ctx.sfx('tick'); } } });
    ctx.on(ctx.$('#lf'), 'click', () => { pos = Math.max(0, pos - 1); place(); ctx.sfx('tick'); }); ctx.on(ctx.$('#rt2'), 'click', () => { pos = Math.min(cur.n, pos + 1); place(); ctx.sfx('tick'); });
    ctx.on(document, 'keydown', e => { if (e.key === 'ArrowLeft') ctx.$('#lf').click(); if (e.key === 'ArrowRight') ctx.$('#rt2').click(); });
    ctx.on(ctx.$('#cf'), 'click', () => {
      if (pos === cur.idx) { ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(900, () => ctx.win()); else { ctx.say('Parou no lugar certo!', 1600); ctx.after(1300, newRound); } }
      else ctx.mistake(4, 'Não é aí! Conte os risquinhos a partir do zero.');
    });
    newRound();
  }
});

/* =====================================================================
   28 — O LABIRINTO DAS MOEDAS
   ===================================================================== */
M.phase({
  id: 28, title: 'O Labirinto das Moedas', room: 'cellar', transition: 'down', transitionText: 'Descendo os degraus…', difficulty: 3, kind: 'Labirinto e dinheiro', par: 400, extra: true,
  intro: 'No fundo do porão existe um labirinto de pedra! Moedas e notas estão espalhadas por ele. O guardião da saída só deixa passar quem chegar com EXATAMENTE o dinheiro que ele pede.',
  objective: 'Ande pelo labirinto (setas do teclado, botões na tela ou deslize o dedo), pegue as moedas do caminho certo e chegue à saída com o valor exato. Errou o valor? Toque em Recomeçar.',
  success: 'O guardião contou o dinheiro, sorriu e abriu a grande porta de pedra!',
  hints: [
    'Só o caminho que leva até a saída tem as moedas certas. As moedas escondidas em cantos sem saída são armadilhas!',
    rt => `A meta é ${R(rt.target)}. O caminho certo tem ${rt.n} moedas.`,
    rt => `Some as moedas do caminho até a saída: ${rt.vals.map(R).join(' + ')} = ${R(rt.target)}.`
  ],
  start(ctx) {
    const W = 7, H = 7; let cells, pos, sum, coins, target, start;
    function gen() {
      cells = Array.from({ length: W * H }, () => ({ w: [1, 1, 1, 1] }));     // paredes: cima, direita, baixo, esquerda
      const D = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]], seen = new Set([0]), st = [0];
      while (st.length) { const c = st[st.length - 1], x = c % W, y = Math.floor(c / W), opts = shuffle(D).filter(d => { const nx = x + d[0], ny = y + d[1]; return nx >= 0 && ny >= 0 && nx < W && ny < H && !seen.has(ny * W + nx); });
        if (!opts.length) { st.pop(); continue; } const d = opts[0], n = (y + d[1]) * W + x + d[0]; cells[c].w[d[2]] = 0; cells[n].w[d[3]] = 0; seen.add(n); st.push(n); }
      // caminho mais curto de 0 até o fim (BFS)
      const goal = W * H - 1, prev = { 0: -1 }, q = [0];
      while (q.length) { const c = q.shift(); if (c === goal) break; const x = c % W, y = Math.floor(c / W);
        D.forEach(d => { if (!cells[c].w[d[2]]) { const n = (y + d[1]) * W + x + d[0]; if (!(n in prev)) { prev[n] = c; q.push(n); } } }); }
      const path = []; for (let c = goal; c !== -1; c = prev[c]) path.unshift(c);
      const inPath = new Set(path), open = c => cells[c].w.filter(w => !w).length;
      const dead = shuffle(cells.map((_, i) => i).filter(i => !inPath.has(i) && open(i) === 1));
      const mid = shuffle(path.slice(1, -1)).slice(0, 4), vals = [50, 100, 200, 500];
      coins = {}; mid.forEach(c => coins[c] = pick(vals)); dead.slice(0, 3).forEach(c => coins[c] = pick(vals));
      target = mid.reduce((a, c) => a + coins[c], 0); Object.assign(ctx.rt, { target, n: mid.length, vals: mid.map(c => coins[c]) });
      start = JSON.parse(JSON.stringify(coins)); pos = 0; sum = 0;
    }
    gen();
    ctx.mount(`<div class="p28"><p class="title-line">Chegue à <b>SAÍDA</b> (canto de baixo) com exatamente <b>${R(target)}</b>.</p>
      <div class="maze" id="mz" style="--w:${W};--h:${H}"></div>
      <div class="qstats"><span>Você tem: <b id="have">R$ 0,00</b></span><button class="btn sm" id="again">↻ Recomeçar</button></div>
      <div class="dpad"><button data-d="0">▲</button><button data-d="3">◀</button><button data-d="2">▼</button><button data-d="1">▶</button></div></div>`);
    const mz = ctx.$('#mz'), have = ctx.$('#have');
    function draw() {
      mz.innerHTML = cells.map((c, i) => `<div class="mc" style="border-top:${c.w[0] ? 3 : 0}px solid #8a7fb0;border-right:${c.w[1] ? 3 : 0}px solid #8a7fb0;border-bottom:${c.w[2] ? 3 : 0}px solid #8a7fb0;border-left:${c.w[3] ? 3 : 0}px solid #8a7fb0">${coins[i] ? `<i class="mcoin v${coins[i] < 100 ? 50 : coins[i] === 100 ? 100 : 'n'}">${R(coins[i]).replace('R$ ', '')}</i>` : ''}${i === W * H - 1 ? '<i class="mexit">SAÍDA</i>' : ''}${i === pos ? `<span class="mplayer">${icon('ghost')}</span>` : ''}</div>`).join('');
      have.textContent = R(sum);
    }
    function go(d) {
      const D = [[0, -1], [1, 0], [0, 1], [-1, 0]]; if (cells[pos].w[d] || ctx.done) { ctx.sfx('err'); return; }
      pos += D[d][0] + D[d][1] * W; ctx.sfx('step');
      if (coins[pos]) { sum += coins[pos]; delete coins[pos]; ctx.sfx('key'); }
      draw();
      if (pos === W * H - 1) { if (sum === target) { ctx.sfx('done'); ctx.after(800, () => ctx.win()); } else { ctx.mistake(3, sum > target ? `Você juntou ${R(sum)}, passou da meta! Toque em Recomeçar.` : `Você tem só ${R(sum)}. Faltam moedas do caminho certo!`); } }
    }
    ctx.$$('.dpad button').forEach(b => ctx.on(b, 'click', () => go(+b.dataset.d)));
    ctx.on(document, 'keydown', e => { const m = { ArrowUp: 0, w: 0, W: 0, ArrowRight: 1, d: 1, D: 1, ArrowDown: 2, s: 2, S: 2, ArrowLeft: 3, a: 3, A: 3 }[e.key]; if (m !== undefined) { e.preventDefault(); go(m); } });
    let sx = 0, sy = 0; ctx.on(mz, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    ctx.on(mz, 'pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); });
    ctx.on(ctx.$('#again'), 'click', () => { coins = JSON.parse(JSON.stringify(start)); pos = 0; sum = 0; ctx.sfx('click'); draw(); });
    draw();
  }
});

/* =====================================================================
   29 — QUEBRA-CABEÇA DAS CONTAS
   ===================================================================== */
M.phase({
  id: 29, title: 'Quebra-cabeça das Contas', room: 'attic', transition: 'stairs', transitionText: 'Subindo para o sótão…', difficulty: 3, kind: 'Quebra-cabeça deslizante', par: 400, extra: true,
  intro: 'No sótão há uma caixa de madeira com 8 peças de conta e um buraco vazio. As peças estão embaralhadas! Coloque cada uma na ordem certa para o mecanismo abrir.',
  objective: 'Toque nas peças ao lado do buraco para deslizá-las. Resolva a conta de cada peça e organize do MENOR resultado (1) ao MAIOR (8), da esquerda para a direita, de cima para baixo. O buraco fica no canto de baixo.',
  success: 'CLIC! As peças se encaixaram e a caixa revelou uma chave dourada.',
  hints: [
    'Calcule o resultado de cada peça primeiro. Depois arrume a primeira linha (1, 2, 3) e siga para as próximas.',
    rt => `Os resultados são: ${rt.res}.`,
    rt => `A ordem final é: ${rt.ordem}. O buraco fica no canto inferior direito.`
  ],
  start(ctx) {
    const expr = r => { const o = []; if (r >= 2) { const a = ri(1, r - 1); o.push(`${a} + ${r - a}`); } const k = ri(2, 9); o.push(`${r + k} − ${k}`); o.push(`${r * 2} ÷ 2`); [2, 3, 4].forEach(f => { if (r % f === 0 && r / f > 1) o.push(`${f} × ${r / f}`); }); return pick(o); };
    const ex = Array.from({ length: 9 }, (_, i) => i ? expr(i) : ''), size = 3;
    let t = [1, 2, 3, 4, 5, 6, 7, 8, 0], moves = 0, last = -1;
    const nb = i => { const x = i % 3, y = Math.floor(i / 3), o = []; if (y > 0) o.push(i - 3); if (x < 2) o.push(i + 1); if (y < 2) o.push(i + 3); if (x > 0) o.push(i - 1); return o; };
    for (let s = 0; s < 22; s++) { const z = t.indexOf(0), opts = nb(z).filter(n => n !== last); const n = pick(opts); [t[z], t[n]] = [t[n], t[z]]; last = z; }
    if (t.every((v, i) => v === (i + 1) % 9)) { [t[7], t[8]] = [t[8], t[7]]; }
    Object.assign(ctx.rt, { res: ex.slice(1).map((e, i) => `${e} = ${i + 1}`).join(' · '), ordem: '1 2 3 / 4 5 6 / 7 8 ▢' });
    ctx.mount(`<div class="p29"><p class="title-line">Ordene do <b>1</b> ao <b>8</b>, tocando nas peças ao lado do buraco. Movimentos: <b id="mv">0</b></p><div class="slide" id="sl"></div></div>`);
    const sl = ctx.$('#sl');
    sl.innerHTML = Array.from({ length: 8 }, (_, k) => `<button class="stile" data-v="${k + 1}">${ex[k + 1]}</button>`).join('');
    const place = () => { ctx.$$('.stile').forEach(b => { const i = t.indexOf(+b.dataset.v); b.style.transform = `translate(${(i % 3) * 100}%,${Math.floor(i / 3) * 100}%)`; b.classList.toggle('ok', i === +b.dataset.v - 1); }); };
    ctx.$$('.stile').forEach(b => ctx.on(b, 'click', () => {
      const v = +b.dataset.v, i = t.indexOf(v), z = t.indexOf(0); if (!nb(i).includes(z)) { ctx.sfx('err'); ctx.shake(b); return; }
      [t[i], t[z]] = [t[z], t[i]]; moves++; ctx.$('#mv').textContent = moves; ctx.sfx('pop'); place();
      if (t.every((x, k) => x === (k + 1) % 9)) { ctx.say('Todas as peças no lugar!', 2000); ctx.after(1000, () => ctx.win()); }
    }));
    place();
  }
});

/* =====================================================================
   30 — A FESTA DOS BALÕES
   ===================================================================== */
M.phase({
  id: 30, title: 'A Festa dos Balões', room: 'ballroom', transition: 'door', difficulty: 3, kind: 'Múltiplos e divisores', par: 300, extra: true,
  intro: 'Que festa! Os fantasminhas soltaram balões coloridos no salão de baile, cada um com um número. Só que a piñata mágica quer que você estoure apenas os balões CERTOS.',
  objective: 'Leia a regra no alto (múltiplos ou divisores) e toque nos balões que combinam com ela. Estourou o errado? Perde um pouquinho. Estoure 6 balões certos em cada uma das 3 rodadas.',
  success: 'Confetes por todo lado! O último balão soltou uma chave brilhante que caiu no seu colo.',
  hints: [
    'Múltiplos de 4 são os números da tabuada do 4: 4, 8, 12, 16… Divisores de 24 são os números que dividem 24 sem sobrar nada.',
    rt => `Regra atual: ${rt.regra}. Exemplos certos: ${rt.ex}.`,
    rt => `Certos: ${rt.ex}, e mais os que seguem a regra. Ignore os outros!`
  ],
  start(ctx) {
    const rounds = [
      { regra: 'múltiplos de 4', ok: n => n % 4 === 0, good: () => 4 * ri(1, 12), bad: () => { let n; do { n = ri(1, 50); } while (n % 4 === 0); return n; }, ex: '4, 8, 12, 16, 20' },
      { regra: 'múltiplos de 6', ok: n => n % 6 === 0, good: () => 6 * ri(1, 10), bad: () => { let n; do { n = ri(1, 60); } while (n % 6 === 0); return n; }, ex: '6, 12, 18, 24, 30' },
      { regra: 'divisores de 24', ok: n => 24 % n === 0, good: () => pick([1, 2, 3, 4, 6, 8, 12, 24]), bad: () => pick([5, 7, 9, 10, 11, 13, 14, 15, 16, 18, 20, 21]), ex: '1, 2, 3, 4, 6, 8, 12, 24' }
    ];
    let r = 0, got = 0, acc = 0, balls = []; const NEED = 6, COL = ['#ff8fc0', '#7fe0c3', '#ffd23f', '#b79cff', '#ff9a5a', '#7fc4ff'];
    ctx.mount(`<div class="p30"><p class="title-line" id="t30"></p><div class="sky" id="sky"></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const sky = ctx.$('#sky'), dots = ctx.$$('#pg i');
    const head = () => { const rd = rounds[r]; Object.assign(ctx.rt, { regra: rd.regra, ex: rd.ex }); ctx.$('#t30').innerHTML = `Rodada ${r + 1} de 3: estoure os <b>${rd.regra}</b> — <b>${got}</b> de ${NEED}`; };
    function spawn() {
      const rd = rounds[r], good = Math.random() < .5, n = good ? rd.good() : rd.bad(), b = document.createElement('button');
      b.className = 'balloon'; b.textContent = n; b.style.background = pick(COL); b.style.left = rnd(4, 86) + '%'; sky.appendChild(b);
      const o = { el: b, y: sky.clientHeight || 300, n, v: rnd(45, 70) + r * 14 }; balls.push(o);
      b.addEventListener('pointerdown', e => { e.preventDefault(); pop(o); });
    }
    function pop(o) {
      if (!balls.includes(o) || ctx.done) return; balls.splice(balls.indexOf(o), 1); o.el.classList.add('popped'); ctx.after(250, () => o.el.remove());
      if (rounds[r].ok(o.n)) { got++; ctx.sfx('ok'); head(); if (got >= NEED) { dots[r].classList.add('on'); r++; got = 0; sky.innerHTML = ''; balls = []; if (r === 3) ctx.after(700, () => ctx.win()); else { ctx.say('Rodada vencida! Nova regra…', 2000); head(); } } }
      else { ctx.sfx('pop'); ctx.mistake(4, `${o.n} não é ${rounds[r].regra.replace('múltiplos', 'múltiplo').replace('divisores', 'divisor')}!`); }
    }
    ctx.frame(dt => { acc += dt; if (acc > 900 - r * 100) { acc = 0; if (balls.length < 9) spawn(); }
      balls.slice().forEach(o => { o.y -= o.v * dt / 1000; o.el.style.transform = `translateY(${o.y}px)`; if (o.y < -90) { o.el.remove(); balls.splice(balls.indexOf(o), 1); } }); });
    head();
  }
});

/* =====================================================================
   31 — O MAPA DO TESOURO
   ===================================================================== */
M.phase({
  id: 31, title: 'O Mapa do Tesouro', room: 'attic', transition: 'stairs', transitionText: 'Um mapa velho no baú…', difficulty: 3, kind: 'Plano cartesiano', par: 400, extra: true, checkpoint: false,
  intro: 'Dentro de um baú antigo, o fantasminha Bruma achou um mapa do tesouro cheio de linhas cruzadas! Para achar o "X" é preciso saber ler coordenadas.',
  objective: 'Toque no ponto do mapa que a dica pede. As coordenadas são (x, y): primeiro ande para o lado (x), depois para cima (y). Encontre 3 tesouros!',
  success: 'X marca o lugar! Os 3 tesouros estavam enterrados e você achou todos.',
  hints: [
    'As coordenadas se escrevem (x, y): x é quanto você anda para a DIREITA e y é quanto você sobe.',
    rt => rt.dica,
    rt => `O tesouro está no ponto (${rt.x}, ${rt.y}).`
  ],
  start(ctx) {
    const S = 44, N = 8, ox = 34, oy = 8 + N * S, X = x => ox + x * S, Y = y => oy - y * S; let r = 0, cur = null;
    const gens = [
      () => { const x = ri(2, 6), y = ri(1, 5); return { pts: [{ x: 0, y: 0, ic: 'ghost', lb: 'Navio' }], tx: x, ty: y, txt: `Você está no <b>navio</b>, em (0, 0). Ande <b>${x}</b> para a direita e <b>${y}</b> para cima. Onde está o tesouro?`, dica: `Começando em (0, 0): x = 0 + ${x} = ${x}; y = 0 + ${y} = ${y}.` }; },
      () => { const cx = ri(1, 3), cy = ri(1, 3), a = ri(2, 4), b = ri(2, 4); return { pts: [{ x: cx, y: cy, ic: 'crown', lb: 'Coqueiro' }], tx: cx + a, ty: cy + b, txt: `Do <b>coqueiro</b>, em (${cx}, ${cy}), ande <b>${a}</b> para a direita e <b>${b}</b> para cima.`, dica: `x = ${cx} + ${a} = ${cx + a}; y = ${cy} + ${b} = ${cy + b}.` }; },
      () => { const fx_ = ri(0, 3), fy = ri(4, 7), px = ri(4, 8), py = ri(0, 3); return { pts: [{ x: fx_, y: fy, ic: 'flame', lb: 'Farol' }, { x: px, y: py, ic: 'star', lb: 'Pedra' }], tx: px, ty: fy, txt: `O tesouro está na <b>mesma altura</b> (mesmo y) do <b>farol</b> (${fx_}, ${fy}) e na <b>mesma coluna</b> (mesmo x) da <b>pedra</b> (${px}, ${py}).`, dica: `Da pedra pegue o x = ${px}. Do farol pegue o y = ${fy}.` }; }
    ];
    ctx.mount(`<div class="p31"><div class="panel probbox"><div class="qstats"><span>Tesouro <b id="pn">1</b> de 3</span><span class="tiny">(x, y): primeiro lado, depois cima</span></div><div class="qtext" id="q31"></div></div><div class="map" id="map"></div><div class="tiny" id="cd">Toque num ponto do mapa</div></div>`);
    const map = ctx.$('#map');
    function newRound() {
      cur = gens[r](); Object.assign(ctx.rt, { x: cur.tx, y: cur.ty, dica: cur.dica }); ctx.$('#pn').textContent = r + 1; ctx.$('#q31').innerHTML = cur.txt;
      let s = `<svg viewBox="0 0 ${ox + N * S + 20} ${oy + 34}">`;
      for (let i = 0; i <= N; i++) { s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(N)}" class="gl${i ? '' : ' ax'}"/><line x1="${X(0)}" y1="${Y(i)}" x2="${X(N)}" y2="${Y(i)}" class="gl${i ? '' : ' ax'}"/><text x="${X(i)}" y="${Y(0) + 18}" class="tl2">${i}</text><text x="${X(0) - 12}" y="${Y(i) + 4}" class="tl2">${i}</text>`; }
      cur.pts.forEach(p => { s += `<g transform="translate(${X(p.x) - 13} ${Y(p.y) - 13}) scale(.55)" style="color:#ffb347">${icon(p.ic).replace(/<svg[^>]*>|<\/svg>/g, '')}</g><text x="${X(p.x)}" y="${Y(p.y) - 18}" class="lb">${p.lb}</text>`; });
      for (let x = 0; x <= N; x++) for (let y = 0; y <= N; y++) s += `<circle class="pt" data-x="${x}" data-y="${y}" cx="${X(x)}" cy="${Y(y)}" r="12"/>`;
      map.innerHTML = s + '<g id="marks"></g></svg>';
      ctx.$$('.pt').forEach(c => { ctx.on(c, 'click', () => choose(+c.dataset.x, +c.dataset.y)); ctx.on(c, 'mouseenter', () => { ctx.$('#cd').textContent = `Ponto (${c.dataset.x}, ${c.dataset.y})`; }); });
    }
    function choose(x, y) {
      if (ctx.done) return; ctx.$('#cd').textContent = `Você tocou em (${x}, ${y})`; const m = ctx.$('#marks');
      if (x === cur.tx && y === cur.ty) { m.innerHTML += `<text x="${X(x)}" y="${Y(y) + 10}" class="mk good">✖</text>`; ctx.sfx('done'); r++; if (r === 3) ctx.after(1000, () => ctx.win()); else { ctx.say('Achou um tesouro!', 1800); ctx.after(1500, newRound); } }
      else { m.innerHTML += `<text x="${X(x)}" y="${Y(y) + 8}" class="mk">✖</text>`; ctx.mistake(4, `(${x}, ${y}) não é o tesouro. Confira: primeiro x, depois y.`); }
    }
    newRound();
  }
});

/* =====================================================================
   32 — O JARDIM DO FANTASMA
   ===================================================================== */
M.phase({
  id: 32, title: 'O Jardim do Fantasma', room: 'lounge', transition: 'door', difficulty: 3, kind: 'Área e perímetro', par: 400, extra: true,
  intro: 'O fantasminha jardineiro quer plantar um canteiro retangular no quadrado de grama, mas cada pedido tem um tamanho especial. Ele precisa da sua ajuda com área e perímetro!',
  objective: 'Arraste o cantinho do canteiro (ou use os botões) para mudar a largura e a altura. Ele precisa ter a ÁREA ou o PERÍMETRO pedido. Cada quadradinho vale 1. Depois, toque em Plantar!',
  success: 'O canteiro ficou lindo! As flores brotaram na hora e a porta do jardim se abriu.',
  hints: [
    'Área = largura × altura (quantos quadradinhos cabem dentro). Perímetro = tamanho do contorno = 2 × (largura + altura).',
    rt => rt.dica,
    rt => `Uma boa resposta: largura ${rt.w} e altura ${rt.h}.`
  ],
  start(ctx) {
    const rounds = [
      { txt: 'Faça um canteiro com <b>ÁREA de 12</b> quadradinhos.', ok: (w, h) => w * h === 12, w: 4, h: 3, dica: 'Procure dois números que multiplicados dão 12: 3 × 4, 2 × 6…' },
      { txt: 'Faça um canteiro com <b>PERÍMETRO de 14</b>.', ok: (w, h) => 2 * (w + h) === 14, w: 4, h: 3, dica: '2 × (largura + altura) = 14, então largura + altura = 7.' },
      { txt: 'Agora o desafio: <b>ÁREA 24</b> e <b>PERÍMETRO 22</b> ao mesmo tempo!', ok: (w, h) => w * h === 24 && 2 * (w + h) === 22, w: 8, h: 3, dica: 'largura + altura = 11 e largura × altura = 24. Quais dois números somam 11 e multiplicam 24?' }
    ];
    const CW = 10, CH = 8; let r = 0, w = 1, h = 1;
    ctx.mount(`<div class="p32"><p class="title-line" id="t32"></p><div class="lawn drag" id="lawn" style="--cw:${CW};--ch:${CH}"><div class="bed" id="bed"><i class="handle" id="hd"></i></div></div>
      <div class="qstats"><span>Largura: <b id="lw">1</b></span><span>Altura: <b id="lh">1</b></span></div>
      <div class="row"><button class="btn sm" id="wm">− largura</button><button class="btn sm" id="wp">+ largura</button><button class="btn sm" id="hm">− altura</button><button class="btn sm" id="hp">+ altura</button></div>
      <button class="btn primary" id="plant">Plantar!</button><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const lawn = ctx.$('#lawn'), bed = ctx.$('#bed'), dots = ctx.$$('#pg i');
    const draw = () => { bed.style.width = w / CW * 100 + '%'; bed.style.height = h / CH * 100 + '%'; ctx.$('#lw').textContent = w; ctx.$('#lh').textContent = h; };
    function newRound() { const rd = rounds[r]; w = 1; h = 1; Object.assign(ctx.rt, { w: rd.w, h: rd.h, dica: rd.dica }); ctx.$('#t32').innerHTML = `Canteiro ${r + 1} de 3: ${rd.txt}`; draw(); }
    const cell = e => { const b = lawn.getBoundingClientRect(); return [clamp(Math.round((e.clientX - b.left) / b.width * CW), 1, CW), clamp(Math.round((e.clientY - b.top) / b.height * CH), 1, CH)]; };
    T.drag(ctx, ctx.$('#hd'), { down() { }, move(e) { const [a, b] = cell(e); if (a !== w || b !== h) { w = a; h = b; draw(); ctx.sfx('tick'); } } });
    const btn = (id, f) => ctx.on(ctx.$(id), 'click', () => { f(); ctx.sfx('tick'); draw(); });
    btn('#wm', () => w = Math.max(1, w - 1)); btn('#wp', () => w = Math.min(CW, w + 1)); btn('#hm', () => h = Math.max(1, h - 1)); btn('#hp', () => h = Math.min(CH, h + 1));
    ctx.on(ctx.$('#plant'), 'click', () => {
      if (rounds[r].ok(w, h)) { ctx.sfx('done'); bed.classList.add('bloom'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1100, () => ctx.win()); else { ctx.say('Que lindo! Próximo canteiro…', 1800); ctx.after(1500, () => { bed.classList.remove('bloom'); newRound(); }); } }
      else ctx.mistake(4, `Um canteiro ${w} × ${h} tem área ${w * h} e perímetro ${2 * (w + h)}. Não é o pedido!`);
    });
    newRound();
  }
});

/* =====================================================================
   33 — A TORRE DO BARÃO
   ===================================================================== */
M.phase({
  id: 33, title: 'A Torre do Barão', room: 'stairs', transition: 'stairs', transitionText: 'Subindo a torre…', difficulty: 3, kind: 'Torre de Hanói e padrões', par: 500, extra: true,
  intro: 'No alto da mansão está a Torre do Barão: 3 pinos e discos coloridos. É um quebra-cabeça muito antigo! Quem resolver descobre também um segredo sobre números.',
  objective: 'Mova todos os discos do pino da esquerda para o da direita, um de cada vez, SEM pôr um disco maior em cima de um menor. (Arraste o disco, ou toque no pino de saída e depois no de chegada.) Depois, responda 2 perguntas sobre o padrão.',
  success: 'A torre inteira mudou de lugar! O Barão bateu palmas e declarou você Mestre da Mansão.',
  hints: [
    'Truque: para mover a torre de 3 discos, primeiro leve os 2 discos de cima para o pino do meio, depois o grande para o pino da direita, depois os 2 do meio para a direita.',
    rt => 'Padrão: 1 disco = 1 movimento; 2 discos = 3; 3 discos = 7. Cada novo disco DOBRA o número anterior e soma 1.',
    rt => 'Respostas: 3 discos → 7 movimentos. 4 discos → 2 × 7 + 1 = 15 movimentos.'
  ],
  start(ctx) {
    const N = 3; let pegs = [[3, 2, 1], [], []], from = -1, moves = 0, stage = 'play';
    ctx.mount(`<div class="p33"><p class="title-line" id="t33">Leve a torre para o pino da <b>direita</b>. Movimentos: <b id="mv">0</b></p>
      <div class="pegs" id="pegs"></div>
      <div class="qbox" id="qb" hidden><div class="tabpad"><span>1 disco → <b>1</b></span><span>2 discos → <b>3</b></span><span>3 discos → <b>?</b></span></div><p class="qtext" id="q33"></p><div class="row"><input id="a33" class="inp" inputmode="numeric" autocomplete="off" placeholder="Digite o número"><button class="btn primary" id="s33">Responder</button></div></div></div>`);
    const box = ctx.$('#pegs');
    function draw() {
      box.innerHTML = pegs.map((p, i) => `<div class="peg drop${from === i ? ' from' : ''}" data-p="${i}"><div class="pole"></div>${p.map((d, k) => `<i class="disc d${d}${k === p.length - 1 ? ' top drag' : ''}" data-d="${d}" data-p="${i}"></i>`).join('')}</div>`).join('');
      ctx.$$('.peg').forEach(pg => ctx.on(pg, 'click', e => { if (e.target.closest('.disc.top')) return; tapPeg(+pg.dataset.p); }));
      ctx.$$('.disc.top').forEach(d => { const i = +d.dataset.p; dragItem(ctx, d, { tap() { tapPeg(i); }, drop(x, y) { const z = ctx.$$('.peg').find(p => T.inside(p, x, y, 10)); if (z) move(i, +z.dataset.p); else { from = -1; draw(); } } }); });
    }
    function tapPeg(i) { if (stage !== 'play') return; if (from < 0) { if (pegs[i].length) { from = i; ctx.sfx('click'); draw(); } } else { const f = from; from = -1; if (f === i) draw(); else move(f, i); } }
    function move(a, b) {
      from = -1; const d = pegs[a][pegs[a].length - 1];
      if (!d) { draw(); return; }
      if (pegs[b].length && pegs[b][pegs[b].length - 1] < d) { ctx.say('Disco maior não pode ficar em cima de um menor!', 2200); ctx.sfx('err'); draw(); return; }
      pegs[a].pop(); pegs[b].push(d); moves++; ctx.$('#mv').textContent = moves; ctx.sfx('pop'); draw();
      if (pegs[2].length === N) { stage = 'q'; ctx.sfx('done'); ctx.after(900, questions); }
    }
    let qi = 0; const Q = [['Quantos movimentos, no MÍNIMO, são necessários para mover 3 discos?', 7], ['E para 4 discos? (Cada disco novo dobra o número anterior e soma 1.)', 15]];
    function questions() {
      ctx.$('#pegs').hidden = true; ctx.$('#qb').hidden = false; ctx.$('#t33').innerHTML = `Você fez <b>${moves}</b> movimentos! Agora descubra o padrão.`; ask();
    }
    function ask() { ctx.$('#q33').textContent = Q[qi][0]; ctx.$('#a33').value = ''; ctx.$('#a33').focus(); }
    function send() { const v = ctx.$('#a33').value.trim(); if (!v) return;
      if (T.same(v, Q[qi][1])) { ctx.sfx('ok'); qi++; if (qi === Q.length) { ctx.say('Você descobriu o padrão!', 2000); ctx.after(900, () => ctx.win()); } else { ctx.$('.tabpad').innerHTML += '<span>4 discos → <b>?</b></span>'; ask(); } }
      else { ctx.mistake(3, qi ? '4 discos: pegue o resultado de 3 discos (7), dobre e some 1.' : 'Use a tabelinha: 1 → 1, 2 → 3, depois dobre e some 1.'); ctx.shake(ctx.$('#a33')); } }
    ctx.on(ctx.$('#s33'), 'click', send); ctx.on(ctx.$('#a33'), 'keydown', e => { if (e.key === 'Enter') send(); });
    draw();
  }
});

})();
