/* =====================================================================
   FASES 9 a 16  —  "A Mansão dos Espíritos"
   9  A Sala Escura        lanterna + duplo clique + soma de dinheiro
   10 O Cadeado            girar rodas de um cadeado (arrastar/rolar) — 4 contas
   11 O Pote de Balas      clicar várias vezes, tocar e SEGURAR o botão (fração)
   12 Códigos Piscantes    reflexo: clicar quando o visor mostra o resultado
   13 Os Quadros           jogo do copo com quadros de frações
   14 O Corredor Infinito  corredor 3D: achar a porta que quebra o padrão
   15 O Sussurro dos Preços memorizar preços e DIGITAR o total/troco
   16 Espelhos Mentirosos  achar o espelho que mente
   ===================================================================== */
(function () {
'use strict';
const M = Mansao, icon = M.icon, T = M.Tools, B = M.Banco, fx = T.fx, { rnd, ri, pick, shuffle, clamp, cap } = M.util, R = B.R;
const nm = { book: ['o', 'Livro'], bell: ['o', 'Sino'], crown: ['a', 'Coroa'], key: ['a', 'Chave'], star: ['a', 'Estrela'], moon: ['a', 'Lua'] };

/* =====================================================================
   FASE 9 — A SALA ESCURA
   ===================================================================== */
M.phase({
  id: 9, title: 'A Sala Escura', room: 'attic', transition: 'stairs', transitionText: 'Subindo para o sótão…', difficulty: 1, kind: 'Lanterna e dinheiro', par: 240,
  intro: 'No sótão, a luz se apagou! Você só tem uma lanterninha. Dizem que os fantasminhas esconderam moedas e notas pelos cantos escuros…',
  objective: 'Passe a lanterna pelo sótão (mouse ou dedo). Dê 2 cliques em cada moeda ou nota que achar. Depois, some todo o dinheiro!',
  success: 'A soma estava certa! Uma tábua do chão se levantou e mostrou a escada para o porão.',
  hints: [
    'Passe a lanterna devagar, de canto em canto, principalmente ao lado e atrás dos móveis.',
    rt => `Ainda faltam ${rt.left} para achar. Depois de pegar tudo, some os valores que aparecem na bolsa.`,
    rt => `Os valores são ${rt.coins.map(R).join(' + ')} = ${R(rt.total)}.`
  ],
  start(ctx) {
    const VALS = [50, 100, 100, 200, 500, 1000], coins = Array.from({ length: 5 }, () => pick(VALS)), total = coins.reduce((a, b) => a + b, 0);
    Object.assign(ctx.rt, { coins, total, left: 5 });
    const spots = shuffle([[10, 24], [30, 72], [52, 26], [72, 64], [88, 30], [20, 48], [60, 52], [84, 80], [42, 86], [8, 82], [64, 14], [34, 34]]).slice(0, 5);
    const furn = [['chest', 4, 56], ['chair', 34, 50], ['box', 68, 46], ['cab', 84, 8], ['box', 16, 8], ['chest', 46, 72], ['chair', 78, 68], ['box', 56, 8]];
    ctx.mount(`<div class="p9"><p class="title-line" id="p9t">Ache as moedas e notas no escuro! <small>(0 de 5)</small></p>
      <div class="darkfield" id="df">${furn.map(f => `<i class="furn ${f[0]}" style="left:${f[1]}%;top:${f[2]}%"></i>`).join('')}
        ${coins.map((v, i) => `<button class="coin v${v}" data-i="${i}" style="left:${spots[i][0]}%;top:${spots[i][1]}%" aria-label="moeda escondida"><span>${R(v).replace('R$ ', '')}</span></button>`).join('')}
        <div class="dark" id="dk"></div></div>
      <div class="bag" id="bag"><b>Bolsa:</b> <span id="chips">vazia</span></div>
      <div class="qbox" id="qbox" hidden><p class="qtext">Quanto dinheiro você guardou na bolsa?</p><div class="opts" id="qo"></div></div></div>`);
    const df = ctx.$('#df'), dk = ctx.$('#dk'), chips = ctx.$('#chips'), t = ctx.$('#p9t'); let got = 0, last = { el: null, t: 0 }, told = false;
    const light = e => { const r = df.getBoundingClientRect(); dk.style.setProperty('--x', (e.clientX - r.left) + 'px'); dk.style.setProperty('--y', (e.clientY - r.top) + 'px'); };
    ctx.on(df, 'pointermove', light); ctx.on(df, 'pointerdown', light);
    ctx.$$('.coin').forEach(c => ctx.on(c, 'click', () => {
      const now = performance.now();
      if (last.el === c && now - last.t < 550) { last = { el: null, t: 0 }; collect(c); }
      else { last = { el: c, t: now }; ctx.sfx('click'); if (!told) { told = true; ctx.say('Achou! Dê 2 cliques (ou toque 2 vezes) para pegar.', 3500); } }
    }));
    function collect(c) {
      const v = coins[+c.dataset.i]; c.classList.add('taken'); ctx.after(450, () => c.remove()); ctx.sfx('key');
      if (!got) chips.innerHTML = ''; got++; ctx.rt.left = 5 - got; chips.insertAdjacentHTML('beforeend', `<span class="chip">${R(v)}</span>`);
      t.innerHTML = `Ache as moedas e notas no escuro! <small>(${got} de 5)</small>`;
      if (got === 5) { ctx.say('Tudo na bolsa! Agora é hora de somar.', 3000); ctx.after(900, ask); }
    }
    function ask() {
      const box = ctx.$('#qbox'); box.hidden = false; df.classList.add('lit');
      const c = shuffle([total + 50, total - 50, total + 100, total - 100, total + 200, total - 200, total + 500].filter(x => x > 0 && x !== total)).slice(0, 3);
      ctx.$('#qo').innerHTML = shuffle([total, ...c]).map((v, i) => `<button class="btn" data-v="${v}"><small style="opacity:.6">${i + 1}</small> ${R(v)}</button>`).join('');
      ctx.$$('#qo .btn').forEach(b => ctx.on(b, 'click', () => {
        if (+b.dataset.v === total) { ctx.sfx('ok'); b.classList.add('right'); ctx.after(900, () => ctx.win()); }
        else { b.classList.add('wrong'); b.disabled = true; ctx.mistake(3, 'Confira os valores dentro da bolsa e some de novo!'); }
      }));
    }
  }
});

/* =====================================================================
   FASE 10 — O CADEADO
   ===================================================================== */
M.phase({
  id: 10, title: 'O Cadeado', room: 'corridor', transition: 'corridor', transitionText: 'Passos no corredor…', difficulty: 1, kind: 'Girar o cadeado', par: 240,
  intro: 'Uma velha porta de ferro está fechada com um cadeado de 4 rodinhas. Perto dele, quatro bilhetes contam o segredo: cada bilhete é uma continha, e a resposta é o número de uma roda.',
  objective: 'Resolva as 4 contas e gire cada roda do cadeado até o número certo (arraste, role o mouse ou use as setas). Depois toque em Abrir.',
  success: 'CLAC! O cadeado se abriu e a porta de ferro rangeu devagarinho.',
  hints: [
    'O 1º bilhete é para a 1ª roda, o 2º para a 2ª, e assim por diante. A resposta de cada conta é UM número de 0 a 9.',
    rt => `Roda 1 = ${rt.code[0]} e roda 2 = ${rt.code[1]}.`,
    rt => `O código é ${rt.code.join(' ')}. ` + rt.probs.map((p, i) => `(${i + 1}ª: ${p.sol})`).join(' ')
  ],
  start(ctx) {
    const probs = B.digito(4), code = probs.map(p => p.d); Object.assign(ctx.rt, { probs, code });
    const cur = [0, 0, 0, 0]; let opened = false;
    ctx.mount(`<div class="p10"><div class="notes10">${probs.map((p, i) => `<div class="note sm"><h4>${i + 1}ª roda</h4><p>${fx(p.q)}</p></div>`).join('')}</div>
      <div class="lock" id="lock"><div class="shackle"></div><div class="lockbody"><div class="dials">${cur.map((_, i) => `<div class="dial" data-i="${i}">
        <button class="dbtn" data-d="1" aria-label="aumentar">▲</button>
        <div class="drum drag" tabindex="0" aria-label="roda ${i + 1}"><span class="dp"></span><b class="dc"></b><span class="dn"></span></div>
        <button class="dbtn" data-d="-1" aria-label="diminuir">▼</button></div>`).join('')}</div></div></div>
      <button class="btn primary" id="open">Abrir</button></div>`);
    const dials = ctx.$$('.dial');
    const paint = (i, dir) => { const d = dials[i], dr = d.querySelector('.drum'); d.querySelector('.dc').textContent = cur[i]; d.querySelector('.dp').textContent = (cur[i] + 9) % 10; d.querySelector('.dn').textContent = (cur[i] + 1) % 10;
      if (dir) { dr.classList.remove('up', 'dn2'); void dr.offsetWidth; dr.classList.add(dir > 0 ? 'up' : 'dn2'); } };
    const change = (i, d) => { if (opened) return; cur[i] = (cur[i] + d + 10) % 10; paint(i, d); ctx.sfx('tick'); };
    dials.forEach((d, i) => {
      paint(i);
      d.querySelectorAll('.dbtn').forEach(b => ctx.on(b, 'click', () => change(i, +b.dataset.d)));
      const drum = d.querySelector('.drum'); let y0 = 0, acc = 0;
      T.drag(ctx, drum, { down(e) { y0 = e.clientY; acc = 0; drum.focus(); }, move(e) { const s = Math.trunc((y0 - e.clientY) / 24); if (s !== acc) { change(i, s - acc); acc = s; } } });
      ctx.on(drum, 'wheel', e => { e.preventDefault(); change(i, e.deltaY < 0 ? 1 : -1); }, { passive: false });
      ctx.on(drum, 'keydown', e => { if (e.key === 'ArrowUp') { e.preventDefault(); change(i, 1); } if (e.key === 'ArrowDown') { e.preventDefault(); change(i, -1); } });
    });
    ctx.on(ctx.$('#open'), 'click', () => {
      if (opened) return;
      if (cur.every((v, i) => v === code[i])) { opened = true; ctx.clue('p10', code.join('')); ctx.sfx('key'); ctx.after(300, () => ctx.sfx('door')); ctx.$('#lock').classList.add('open'); ctx.after(1600, () => ctx.win()); }
      else { ctx.mistake(4, 'O cadeado não abriu! Confira as contas.'); ctx.shake(ctx.$('#lock')); }
    });
  }
});

/* =====================================================================
   FASE 11 — O POTE DE BALAS
   ===================================================================== */
M.phase({
  id: 11, title: 'O Pote de Balas', room: 'lounge', transition: 'door', difficulty: 1, kind: 'Clicar e segurar', par: 240,
  intro: 'Na cozinha da mansão, um pote gigante de balas guarda a chave da próxima porta. Só que ele obedece a um botão mágico: cada aperto é uma bala. E uma jarra de leite espera para ser enchida…',
  objective: 'Três desafios: 1) aperte o botão tantas vezes quanto a conta pede; 2) toque nas balas que foram comidas; 3) SEGURE o botão para encher a jarra até a fração pedida.',
  success: 'O pote tremeu, a tampa saltou e a chave apareceu entre as balas!',
  hints: [
    'Faça a conta primeiro (na cabeça ou no papel) e só depois aperte o botão. Você pode tirar uma bala se passar do número.',
    rt => rt.dica,
    rt => rt.sol
  ],
  start(ctx) {
    const COL = ['#ff8fc0', '#7fe0c3', '#ffd23f', '#b79cff', '#ff9a5a'], candy = () => `<i class="candy" style="background:${pick(COL)}"></i>`;
    ctx.mount(`<div class="p11"><p class="title-line" id="t11"></p><div class="row" id="area"></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const area = ctx.$('#area'), t = ctx.$('#t11'), dots = ctx.$$('#pg i'); let r = 0;
    const done = () => { dots[r].classList.add('on'); ctx.sfx('ok'); r++; if (r === 3) ctx.after(700, () => ctx.win()); else ctx.after(900, () => rounds[r]()); };
    const rounds = [
      /* 1 — apertar N vezes (multiplicação) */
      () => { const a = ri(3, 5), b = ri(3, 5), n = a * b; ctx.rt.dica = 'Grupos iguais: multiplique o número de balas de cada pacote pelo número de pacotes.'; ctx.rt.sol = `${a} × ${b} = ${n} balas: aperte o botão ${n} vezes.`;
        t.innerHTML = `1) Cada pacote tem <b>${a}</b> balas. Coloque no pote as balas de <b>${b}</b> pacotes: aperte o botão uma vez para cada bala.`;
        area.innerHTML = `<div class="jar"><div class="candies" id="cd"></div></div><div class="col"><button class="bigbtn" id="bala">BALA!</button><div class="row"><button class="btn sm" id="tira">− Tirar uma</button><button class="btn primary" id="pronto">Pronto!</button></div><p class="tiny">No pote: <b id="cnt">0</b> balas</p></div>`;
        let c = 0; const cd = ctx.$('#cd'), cnt = ctx.$('#cnt');
        const upd = () => cnt.textContent = c;
        ctx.on(ctx.$('#bala'), 'click', () => { if (c >= 40) return; c++; cd.insertAdjacentHTML('beforeend', candy()); ctx.sfx('pop'); upd(); });
        ctx.on(ctx.$('#tira'), 'click', () => { if (c) { c--; cd.lastElementChild.remove(); ctx.sfx('click'); upd(); } });
        ctx.on(ctx.$('#pronto'), 'click', () => { if (c === n) done(); else ctx.mistake(3, 'Hmm, o número de balas não bate com a conta. Confira!'); });
      },
      /* 2 — tocar nas balas comidas (subtração) */
      () => { const N = ri(14, 22), s = ri(6, N - 5), k = N - s; ctx.rt.dica = 'Comidas = as que tinha − as que sobraram.'; ctx.rt.sol = `${N} − ${s} = ${k}: toque em ${k} balas.`;
        t.innerHTML = `2) O pote tinha <b>${N}</b> balas. Os fantasminhas comeram algumas e sobraram <b>${s}</b>. Toque nas balas que foram comidas.`;
        area.innerHTML = `<div class="jar"><div class="candies">${Array.from({ length: N }, () => candy().replace('<i ', '<i role="button" ')).join('')}</div></div><div class="col"><p class="tiny">Comidas: <b id="cnt">0</b></p><button class="btn primary" id="pronto">Pronto!</button></div>`;
        const cs = ctx.$$('.candy'), cnt = ctx.$('#cnt');
        cs.forEach(c => ctx.on(c, 'click', () => { c.classList.toggle('eaten'); ctx.sfx('pop'); cnt.textContent = cs.filter(x => x.classList.contains('eaten')).length; }));
        ctx.on(ctx.$('#pronto'), 'click', () => { if (+cnt.textContent === k) done(); else ctx.mistake(3, 'Quantas balas foram comidas mesmo? Faça a subtração.'); });
      },
      /* 3 — SEGURAR o botão (fração) */
      () => { const [n, d] = pick([[1, 2], [3, 4], [1, 4]]), target = n / d * 100; ctx.rt.dica = `Divida a jarra em ${d} partes iguais e encha ${n} delas.`; ctx.rt.sol = `${n}/${d} da jarra: as risquinhas dividem a jarra em 4 partes iguais. Solte na ${{ 25: '1ª risquinha (de baixo para cima)', 50: 'risquinha do meio', 75: '3ª risquinha (de baixo para cima)' }[target]}.`;
        t.innerHTML = `3) <b>Segure</b> o botão para encher a jarra e <b>solte</b> quando o leite chegar em <b>${fx(n + '/' + d)}</b> da jarra.`;
        area.innerHTML = `<div class="pitcher" id="pit"><div class="liq" id="liq"></div>${[25, 50, 75].map(p => `<u style="bottom:${p}%"></u>`).join('')}</div><div class="col"><button class="bigbtn hold" id="seg">SEGURE</button><p class="tiny">Solte na marca certa. (No teclado: barra de espaço)</p></div>`;
        const liq = ctx.$('#liq'); let level = 0, holding = false, fin = false;
        T.hold(ctx, ctx.$('#seg'), v => {
          if (fin) return; holding = v;
          if (!v && level > 0) { if (Math.abs(level - target) <= 6) { fin = true; liq.style.height = target + '%'; done(); } else { ctx.mistake(3, level > target ? 'Passou! O leite derramou. Tente de novo.' : 'Faltou leite! Tente de novo.'); level = 0; liq.style.height = '0%'; } }
        });
        ctx.frame(dt => { if (holding && !fin) { level = Math.min(100, level + dt / 1000 * 34); liq.style.height = level + '%'; if (Math.floor(level / 5) !== Math.floor((level - 1) / 5)) ctx.sfx('tick'); } });
      }
    ];
    rounds[0]();
  }
});

/* =====================================================================
   FASE 12 — CÓDIGOS PISCANTES
   ===================================================================== */
M.phase({
  id: 12, title: 'Códigos Piscantes', room: 'hall', transition: 'door', difficulty: 2, kind: 'Reflexo e cálculo', par: 200,
  intro: 'A porta do salão tem um visor mágico que pisca números sem parar. Ela só abre se você apertar o botão EXATAMENTE quando o visor mostrar o resultado certo!',
  objective: 'Calcule a conta do bilhete e aperte AGORA! (ou a barra de espaço) quando o visor mostrar o resultado. Acerte 4 vezes.',
  success: 'O visor ficou verde, a porta fez "bip-bip" e destrancou!',
  hints: [
    'Resolva a conta antes de olhar para o visor. Assim você já sabe o número que está esperando.',
    rt => `A conta é ${rt.e}. Faça passo a passo!`,
    rt => `O resultado é ${rt.r}. Aperte AGORA! quando o visor mostrar ${rt.r}.`
  ],
  start(ctx) {
    const levels = [1, 2, 2, 3], speeds = [1800, 1600, 1400, 1250]; let r = 0, seq = [], step = 0, acc = 0, target = 0, frozen = false;
    ctx.mount(`<div class="p12"><div class="note"><h4>Bilhete da porta</h4><p id="conta" style="font-size:22px;text-align:center"></p></div>
      <div class="door12"><div class="visor" id="visor">--</div></div>
      <button class="bigbtn" id="agora">AGORA!</button><div class="prog" id="pg">${'<i></i>'.repeat(4)}</div></div>`);
    const visor = ctx.$('#visor'), dots = ctx.$$('#pg i');
    function newRound() {
      const c = B.conta(levels[r]); target = c.r; Object.assign(ctx.rt, { e: c.e, r: c.r });
      ctx.$('#conta').textContent = c.e + ' = ?';
      const ds = new Set(); const offs = shuffle([-10, -1, 1, 2, -2, 10, 11, -11, 3, -3, 5, -5, 20, 9, -9]);
      for (const o of offs) if (c.r + o > 0 && ds.size < 7) ds.add(c.r + o);
      seq = [...ds]; seq.splice(ri(2, 6), 0, c.r); step = 0; acc = 0; frozen = false; show();
    }
    const show = () => { visor.textContent = seq[step]; visor.className = 'visor'; };
    ctx.frame(dt => { if (frozen) return; acc += dt; if (acc >= speeds[r]) { acc = 0; step = (step + 1) % seq.length; show(); ctx.sfx('tick'); } });
    const press = () => {
      if (frozen || ctx.done) return;
      if (seq[step] === target) { frozen = true; visor.classList.add('good'); ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 4) ctx.after(800, () => ctx.win()); else ctx.after(1100, newRound); }
      else { visor.classList.add('bad'); ctx.mistake(3, 'Esse não era o resultado! Espere o número certo.'); ctx.after(400, show); }
    };
    ctx.on(ctx.$('#agora'), 'click', press); ctx.on(document, 'keydown', e => { if (e.code === 'Space') { e.preventDefault(); press(); } });
    newRound();
  }
});

/* =====================================================================
   FASE 13 — OS QUADROS (jogo do copo com frações)
   ===================================================================== */
const pie = (n, d) => { let s = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#241540"/>';
  for (let i = 0; i < d; i++) { const a0 = i / d * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2, p = a => `${50 + 46 * Math.cos(a)} ${50 + 46 * Math.sin(a)}`;
    s += `<path d="M50 50 L${p(a0)} A46 46 0 0 1 ${p(a1)} Z" fill="${i < n ? '#ffb347' : 'none'}" stroke="#e8d9b5" stroke-width="2.5"/>`; }
  return s + '</svg>'; };
M.phase({
  id: 13, title: 'Os Quadros', room: 'ballroom', transition: 'door', difficulty: 2, kind: 'Memória e frações', par: 240,
  intro: 'A galeria de arte da mansão tem quadros de pizzas encantadas. Quando ninguém olha, os quadros trocam de lugar! Um fantasminha travesso adora essa brincadeira.',
  objective: 'Descubra qual fração cada pizza mostra e memorize onde está o quadro pedido. As luzes vão apagar, os quadros vão trocar de lugar… e você aponta o certo!',
  success: 'Os quadros pararam quietinhos. O fantasminha riu e abriu a porta da galeria.',
  hints: [
    'Conte quantas fatias a pizza tem no total (embaixo) e quantas estão pintadas de laranja (em cima).',
    rt => `Foque no quadro de ${rt.target}. Siga com os olhos: ele é o que está trocando de lugar!`,
    rt => `Nesta rodada, o quadro de ${rt.target} está na posição ${rt.slot + 1} (contando da esquerda).`
  ],
  start(ctx) {
    const FR = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [3, 8], [5, 8], [7, 8]], rounds = [{ n: 3, sw: 3 }, { n: 4, sw: 4 }, { n: 5, sw: 5 }], W = 130; let r = 0, phase = 'show', slots = [], frames = [], target = 0;
    ctx.mount(`<div class="p13"><p class="title-line" id="t13"></p><div class="frames" id="fr"></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const fr = ctx.$('#fr'), t = ctx.$('#t13'), dots = ctx.$$('#pg i');
    function newRound() {
      const { n, sw } = rounds[r]; const list = shuffle(FR).slice(0, n); target = ri(0, n - 1); slots = list.map((_, i) => i); phase = 'show';
      ctx.rt.target = list[target].join('/');
      fr.style.width = (n * W - 20) + 'px'; fr.style.height = '150px';
      fr.innerHTML = list.map((f, i) => `<button class="qfr" data-i="${i}" style="transform:translateX(${i * W}px)"><div class="face">${pie(f[0], f[1])}</div><div class="cover"><span>?</span></div></button>`).join('');
      frames = ctx.$$('.qfr'); frames.forEach(b => ctx.on(b, 'click', () => pick_(+b.dataset.i)));
      t.innerHTML = `Memorize os quadros! Depois, ache o de <b>${fx(ctx.rt.target)}</b>.`;
      ctx.after(4800, cover);
      function cover() { frames.forEach(b => b.classList.add('down')); ctx.sfx('page'); t.innerHTML = `As luzes piscaram! Fique de olho no quadro de <b>${fx(ctx.rt.target)}</b>…`; ctx.$('#fr').classList.add('blink'); ctx.after(1000, () => { fr.classList.remove('blink'); swap(0); }); }
      function swap(k) {
        if (k >= sw) { phase = 'pick'; t.innerHTML = `Onde está o quadro de <b>${fx(ctx.rt.target)}</b>? Toque nele!`; return; }
        let a = k === 0 ? slots.indexOf(target) : ri(0, n - 1), b; do { b = ri(0, n - 1); } while (b === a);
        [slots[a], slots[b]] = [slots[b], slots[a]]; slots.forEach((fi, si) => frames[fi].style.transform = `translateX(${si * W}px)`); ctx.sfx('wisp'); ctx.after(850, () => swap(k + 1));
      }
    }
    function pick_(i) {
      if (phase !== 'pick' || ctx.done) return; phase = 'wait'; ctx.rt.slot = slots.indexOf(target);
      if (i === target) { frames[i].classList.remove('down'); ctx.sfx('ok'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1000, () => ctx.win()); else ctx.after(1400, newRound); }
      else { frames[i].classList.remove('down'); ctx.mistake(2, 'Esse não! Olhe onde estava o certo…'); frames.forEach(b => b.classList.remove('down')); ctx.after(2200, newRound); }
    }
    newRound();
  }
});

/* =====================================================================
   FASE 14 — O CORREDOR INFINITO
   ===================================================================== */
M.phase({
  id: 14, title: 'O Corredor Infinito', room: 'corridor', transition: 'corridor', transitionText: 'O corredor não acaba…', difficulty: 2, kind: 'Padrões e sequências', par: 240,
  intro: 'Que corredor comprido! As portas parecem nunca acabar, e cada uma tem um número. Todas seguem uma regra… menos UMA porta enganadora que está com o número errado.',
  objective: 'Descubra a regra da sequência de números nas portas e toque na porta intrusa. São 3 corredores!',
  success: 'A porta intrusa se desfez em fumaça e o corredor finalmente terminou.',
  hints: [
    'Olhe a diferença entre duas portas vizinhas. Ela é sempre a mesma? Ou os números dobram?',
    rt => `A regra deste corredor é: ${rt.rule}.`,
    rt => `A porta errada é a ${rt.bad + 1}ª (contando da mais próxima). O certo seria ${rt.right}.`
  ],
  start(ctx) {
    const gens = [
      [() => { const a = ri(2, 9), d = ri(2, 6); return { seq: Array.from({ length: 8 }, (_, i) => a + d * i), rule: `some ${d} a cada porta` }; },
       () => { const k = ri(3, 9); return { seq: Array.from({ length: 8 }, (_, i) => k * (i + 1)), rule: `os múltiplos de ${k} (tabuada do ${k})` }; }],
      [() => { const a = ri(1, 3); return { seq: Array.from({ length: 7 }, (_, i) => a * 2 ** i), rule: 'cada número é o dobro do anterior' }; },
       () => { const s = ri(70, 95), d = ri(4, 8); return { seq: Array.from({ length: 8 }, (_, i) => s - d * i), rule: `subtraia ${d} a cada porta` }; }],
      [() => ({ seq: Array.from({ length: 8 }, (_, i) => (i + 1) ** 2), rule: 'os quadrados: 1×1, 2×2, 3×3…' }),
       () => { const a = ri(1, 6); let v = a; const seq = [v]; for (let i = 1; i < 8; i++) { v += i % 2 ? 2 : 3; seq.push(v); } return { seq, rule: 'some 2, depois some 3, depois 2, depois 3…' }; }]
    ];
    let r = 0;
    ctx.mount(`<div class="p14"><p class="title-line" id="t14"></p><div class="hall3d" id="hall"><div class="hfloor"></div><div id="doors"></div></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const doors = ctx.$('#doors'), dots = ctx.$$('#pg i'), t = ctx.$('#t14');
    function newRound() {
      const g = pick(gens[r])(); g.seq = g.seq.slice(0, 6); const n = 6, bad = ri(2, n - 1), right = g.seq[bad]; let wrong; do { wrong = right + pick([-3, -2, -1, 1, 2, 3, 4]); } while (wrong <= 0 || g.seq.includes(wrong));
      const shown = g.seq.map((v, i) => i === bad ? wrong : v); Object.assign(ctx.rt, { rule: g.rule, bad, right });
      t.innerHTML = `Corredor ${r + 1} de 3: qual porta quebra a regra?`;
      // porta 0 = mais perto. Desenhamos das mais distantes para as mais próximas.
      doors.innerHTML = shown.map((v, i) => { const x = (i % 2 ? 1 : -1) * 250, z = -i * 115; return `<button class="door14" data-i="${i}" style="transform:translate3d(${x}px,0,${z}px)"><b>${v}</b><i></i></button>`; }).reverse().join('');
      ctx.$$('.door14').forEach(b => ctx.on(b, 'click', () => choose(b, +b.dataset.i)));
    }
    function choose(b, i) {
      if (ctx.done || b.classList.contains('gone')) return;
      if (i === ctx.rt.bad) { b.classList.add('gone'); ctx.sfx('wisp'); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1000, () => ctx.win()); else { ctx.say('Isso! Era a porta intrusa.', 1800); ctx.after(1300, newRound); } }
      else { ctx.shake(b); ctx.mistake(3, 'Essa porta segue a regra. Procure outra!'); }
    }
    newRound();
  }
});

/* =====================================================================
   FASE 15 — O SUSSURRO DOS PREÇOS
   ===================================================================== */
M.phase({
  id: 15, title: 'O Sussurro dos Preços', room: 'lounge', transition: 'door', difficulty: 2, kind: 'Memorizar e digitar', par: 300,
  intro: 'Na lojinha da mansão, um fantasminha sussurra os preços de três objetos. Mas os sussurros somem depressa! Quem lembrar bem e fizer as contas ganha a chave.',
  objective: 'Memorize os preços dos 3 objetos. Depois responda 3 perguntas DIGITANDO o valor (ex.: 12,50). Se precisar, ouça o sussurro de novo (custa pontos).',
  success: 'O fantasminha bateu palmas: "Que memória!" E entregou a chave da lojinha.',
  hints: [
    'Ligue cada objeto ao seu preço: "o Sino custa…". Repita em voz baixa. Você também pode ouvir o sussurro de novo.',
    rt => `Os preços eram: ${rt.items.map(i => `${i.art} ${i.n} ${R(i.p)}`).join('; ')}.`,
    rt => `Respostas: ${rt.ans.map(R).join(' · ')}.`
  ],
  start(ctx) {
    const pool = shuffle(['book', 'bell', 'crown', 'key', 'star']).slice(0, 3), prices = shuffle([350, 450, 550, 650, 750, 850, 950, 1050, 1250, 1450, 1550, 1750]).slice(0, 3);
    const items = pool.map((k, i) => ({ k, art: nm[k][0], n: nm[k][1], p: prices[i] }));
    const [a, b, c] = items, qs = [
      { q: `Qual era o preço d${a.art} ${a.n}?`, ans: a.p },
      { q: `Quanto custam ${a.art} ${a.n} e ${b.art} ${b.n} juntos?`, ans: a.p + b.p },
      { q: `Você paga ${c.art} ${c.n} com uma nota de R$ 20,00. Quanto recebe de troco?`, ans: 2000 - c.p }
    ];
    Object.assign(ctx.rt, { items, ans: qs.map(q => q.ans) });
    ctx.mount(`<div class="p15"><p class="title-line" id="t15"></p><div class="row" id="cards">${items.map(i => `<div class="shopcard"><div class="ic">${icon(i.k)}</div><b>${cap(i.art)} ${i.n}</b><span class="price">${R(i.p)}</span></div>`).join('')}</div>
      <div class="bar" id="lb"><i></i></div>
      <div class="qbox" id="qbox" hidden><p class="qtext" id="q15"></p><div class="row"><input id="inp" class="inp" inputmode="decimal" autocomplete="off" placeholder="Ex.: 12,50"><button class="btn primary" id="send">Responder</button></div>
        <button class="btn sm plain" id="again">Ouvir o sussurro de novo (−15 pontos)</button></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const cards = ctx.$('#cards'), t = ctx.$('#t15'), box = ctx.$('#qbox'), inp = ctx.$('#inp'), lb = ctx.$('#lb'), dots = ctx.$$('#pg i'); let qi = 0, showing = true, gen = 0;
    function reveal(ms) {
      showing = true; gen++; const my = gen; cards.classList.remove('faded'); lb.hidden = false; box.hidden = true; t.textContent = 'Shhh… escute o sussurro e memorize os preços!'; ctx.sfx('whisper');
      let left = ms; const fill = lb.firstElementChild; ctx.frame(dt => { if (my !== gen) return false; left -= dt; fill.style.width = clamp(left / ms * 100, 0, 100) + '%'; if (left <= 0) { hide(); return false; } });
    }
    function hide() { showing = false; cards.classList.add('faded'); lb.hidden = true; box.hidden = false; ask(); ctx.sfx('wind'); }
    function ask() { t.textContent = `Pergunta ${qi + 1} de 3`; ctx.$('#q15').textContent = qs[qi].q; inp.value = ''; inp.focus(); }
    function send() {
      if (showing || ctx.done) return; if (!inp.value.trim()) return;
      if (T.same(inp.value, R(qs[qi].ans))) { ctx.sfx('ok'); dots[qi].classList.add('on'); qi++; if (qi === 3) { ctx.say('Tudo certo!', 2000); ctx.after(900, () => ctx.win()); } else ask(); }
      else { ctx.mistake(4, 'Hmm, não é esse valor. Faça a conta com calma ou ouça o sussurro de novo.'); ctx.shake(inp); inp.select(); }
    }
    ctx.on(ctx.$('#send'), 'click', send); ctx.on(inp, 'keydown', e => { if (e.key === 'Enter') send(); });
    ctx.on(ctx.$('#again'), 'click', () => { if (showing) return; ctx.spend(15); reveal(9000); });
    reveal(13000);
  }
});

/* =====================================================================
   FASE 16 — ESPELHOS MENTIROSOS
   ===================================================================== */
M.phase({
  id: 16, title: 'Espelhos Mentirosos', room: 'mirrors', transition: 'door', difficulty: 2, kind: 'Detetive de contas', par: 240,
  intro: 'A Sala dos Espelhos é mágica: cada espelho mostra uma igualdade. Todos dizem a verdade… menos UM, que é um espelho mentiroso! Ele adora contar contas erradas.',
  objective: 'Confira as contas de cada espelho e toque no espelho que MENTE. Ele vai rachar! São 3 salas.',
  success: 'O espelho mentiroso rachou em mil pedacinhos brilhantes — e uma passagem secreta apareceu atrás dele!',
  hints: [
    'Resolva a conta de cada espelho, um por vez. Aquele em que o resultado NÃO confere é o mentiroso.',
    rt => `O mentiroso está na posição ${rt.liar + 1} (contando da esquerda, de cima para baixo).`,
    rt => `O espelho mentiroso mostra "${rt.liarText}". O certo seria "${rt.rightText}".`
  ],
  start(ctx) {
    const TF = [['1/2', '2/4'], ['1/2', '3/6'], ['1/3', '2/6'], ['2/3', '4/6'], ['1/4', '2/8'], ['3/4', '6/8'], ['1/5', '2/10']];
    const FF = [['1/3', '2/5'], ['1/2', '2/3'], ['3/4', '6/10'], ['2/3', '3/4'], ['1/4', '2/6'], ['3/6', '1/3'], ['2/5', '4/8']];
    const arith = () => { const k = pick(['+', '−', '×', '÷']); let a, b, r;
      if (k === '+') { a = ri(12, 60); b = ri(8, 40); r = a + b; } else if (k === '−') { a = ri(30, 99); b = ri(8, a - 5); r = a - b; }
      else if (k === '×') { a = ri(3, 9); b = ri(4, 9); r = a * b; } else { b = ri(3, 9); r = ri(4, 9); a = b * r; }
      return { t: `${a} ${k} ${b} = ${r}`, w: (d) => `${a} ${k} ${b} = ${r + d}`, ok: true }; };
    const money = () => { const a = ri(3, 20) * 100 + pick([0, 50]), b = ri(2, 15) * 100 + pick([0, 50]); return { t: `${R(a)} + ${R(b)} = ${R(a + b)}`, w: d => `${R(a)} + ${R(b)} = ${R(a + b + d * 50)}` }; };
    const frac = () => { const [x, y] = pick(TF); return { t: `${x} = ${y}`, w: () => { const [p, q] = pick(FF); return `${p} = ${q}`; } }; };
    const makers = [[arith], [money, frac, arith], [money, frac, arith, arith]];
    let r = 0;
    ctx.mount(`<div class="p16"><p class="title-line" id="t16"></p><div class="mirrors" id="mr"></div><div class="prog" id="pg">${'<i></i>'.repeat(3)}</div></div>`);
    const mr = ctx.$('#mr'), t = ctx.$('#t16'), dots = ctx.$$('#pg i');
    function newRound() {
      const n = 6, liar = ri(0, n - 1); const list = Array.from({ length: n }, () => pick(makers[r])()); const texts = list.map(o => o.t);
      const wrong = list[liar].w(pick([-2, -1, 1, 2, 3])); const rightText = texts[liar]; texts[liar] = wrong;
      Object.assign(ctx.rt, { liar, liarText: wrong, rightText });
      t.innerHTML = `Sala ${r + 1} de 3: qual espelho está mentindo?`;
      mr.innerHTML = texts.map((s, i) => `<button class="mirror" data-i="${i}"><span>${fx(s)}</span></button>`).join('');
      ctx.$$('.mirror').forEach(b => ctx.on(b, 'click', () => pick_(b, +b.dataset.i)));
    }
    function pick_(b, i) {
      if (ctx.done || b.classList.contains('cracked')) return;
      if (i === ctx.rt.liar) { b.classList.add('cracked'); ctx.sfx('key'); ctx.after(150, () => ctx.sfx('pop')); dots[r].classList.add('on'); r++; if (r === 3) ctx.after(1200, () => ctx.win()); else { ctx.say('CRAC! Era ele. Vamos para a próxima sala…', 2200); ctx.after(1600, newRound); } }
      else { b.classList.add('truth'); ctx.mistake(3, 'Esse espelho diz a verdade! Confira as contas dos outros.'); ctx.after(900, () => b.classList.remove('truth')); }
    }
    newRound();
  }
});

})();
