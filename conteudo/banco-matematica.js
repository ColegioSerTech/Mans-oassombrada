/* =====================================================================
   BANCO DE PROBLEMAS DE MATEMÁTICA — 5º ano
   Gera problemas com números sorteados (nunca se repetem) em 6 temas:
     soma-sub     Adição e subtração com números inteiros
     mult-div     Multiplicação e divisão (totais, partes iguais, nº de grupos)
     dinheiro     Sistema monetário (mesada, cinema, brinquedos, troco)
     fracoes      Noção de fração (pizza, bolo, fração de uma quantidade)
     multietapas  Problemas com mais de uma operação
   Cada problema = { tema, nivel, q, a, w:[3 erradas], dica, sol }
     nivel: 1 fácil · 2 médio · 3 difícil
   Uso nas fases:  Mansao.Banco.plano([['fracoes',2],['dinheiro',2]])  → lista de problemas
                   Mansao.Banco.gerar('dinheiro')                   → 1 problema
   ===================================================================== */
(function () {
'use strict';
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[ri(0, a.length - 1)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const N = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');            // 1.250
const R = c => 'R$ ' + (c / 100).toFixed(2).replace('.', ',');              // centavos → R$ 12,50
const NOMES = ['Bia', 'Caio', 'Lia', 'Téo', 'Nina', 'Davi', 'Duda', 'Enzo'];
const dois = () => { const a = pick(NOMES); let b; do { b = pick(NOMES); } while (b === a); return [a, b]; };
const lista = v => v.length < 2 ? String(v[0]) : v.slice(0, -1).join(', ') + ' e ' + v[v.length - 1];

/** monta o problema com 3 alternativas erradas únicas (números) */
function numPack(tema, nivel, q, ans, cands, dica, sol, fmt = N, step = 1) {
  const seen = new Set([ans]), w = [];
  for (const c of shuffle(cands)) if (Number.isFinite(c) && c >= 0 && Number.isInteger(c) && !seen.has(c) && w.length < 3) { seen.add(c); w.push(c); }
  for (let k = 1; w.length < 3 && k < 60; k++) { const c = k % 2 ? ans + Math.ceil(k / 2) * step : ans - (k / 2) * step; if (c >= 0 && !seen.has(c)) { seen.add(c); w.push(c); } }
  return { tema, nivel, q, a: fmt(ans), w: w.map(fmt), dica, sol };
}
/** idem, para respostas em texto (frações, nomes) */
function txtPack(tema, nivel, q, ans, cands, fallback, dica, sol) {
  const seen = new Set([ans]), w = [];
  for (const c of shuffle(cands).concat(fallback)) if (c != null && !seen.has(c) && w.length < 3) { seen.add(c); w.push(c); }
  return { tema, nivel, q, a: ans, w, dica, sol };
}

/* ---------------------------------------------------------------------
   ADIÇÃO E SUBTRAÇÃO
   --------------------------------------------------------------------- */
const somaSub = [
  () => { const a = ri(120, 650), b = ri(30, 300);
    return numPack('soma-sub', 1, `No cesto do Barão havia ${N(a)} maçãs. Pipoca colocou mais ${N(b)}. Quantas maçãs há no cesto agora?`, a + b, [a - b, a + b + 10, a + b - 10, a + b + 100, a + b - 100],
      'Juntar quantidades pede uma adição (+).', `${N(a)} + ${N(b)} = ${N(a + b)}`); },
  () => { const a = ri(200, 900), b = ri(40, a - 60);
    return numPack('soma-sub', 1, `Uma caixa tinha ${N(a)} bombons. Os fantasminhas comeram ${N(b)}. Quantos bombons sobraram?`, a - b, [a + b, a - b + 10, a - b - 10, a - b + 100, b],
      'O que sobra depois de tirar uma parte pede uma subtração (−).', `${N(a)} − ${N(b)} = ${N(a - b)}`); },
  () => { const a = pick([40, 44, 46, 48, 50, 52]), b = ri(12, a - 6);
    return numPack('soma-sub', 1, `O ônibus da excursão tem ${a} lugares. Já estão sentados ${b} alunos. Quantos lugares ainda estão vazios?`, a - b, [a + b, a - b + 10, a - b - 1, a - b + 1],
      'Lugares vazios = total de lugares − lugares ocupados.', `${a} − ${b} = ${a - b}`); },
  () => { const a = ri(150, 500), b = ri(60, 300);
    return numPack('soma-sub', 1, `Na festa da mansão havia ${N(a)} balões vermelhos e ${N(b)} balões azuis. Quantos balões havia ao todo?`, a + b, [a - b, a + b + 10, a + b - 10, a + b + 100],
      '"Ao todo" quer dizer juntar: adição.', `${N(a)} + ${N(b)} = ${N(a + b)}`); },
  () => { const [x, y] = dois(), b = ri(80, 400), a = b + ri(30, 250);
    return numPack('soma-sub', 2, `${x} tem ${N(a)} figurinhas e ${y} tem ${N(b)}. Quantas figurinhas ${x} tem a mais que ${y}?`, a - b, [a + b, a - b + 10, a - b - 10, a - b + 100],
      '"A mais" é uma comparação: subtraia o menor do maior.', `${N(a)} − ${N(b)} = ${N(a - b)}`); }
];

/* ---------------------------------------------------------------------
   MULTIPLICAÇÃO E DIVISÃO
   --------------------------------------------------------------------- */
const multDiv = [
  () => { const a = ri(6, 15), b = ri(4, 12);
    return numPack('mult-div', 1, `Cada pacote de balas tem ${a} balas. Quantas balas há em ${b} pacotes?`, a * b, [a + b, a * b + a, a * b - a, a * b + 10, a * b - 10],
      'Grupos iguais repetidos pedem multiplicação (×).', `${a} × ${b} = ${a * b}`); },
  () => { const x = pick(NOMES), a = ri(8, 25), b = ri(5, 12);
    return numPack('mult-div', 1, `${x} estuda ${a} páginas por dia. Quantas páginas estuda em ${b} dias?`, a * b, [a + b, a * b + a, a * b - a, a * b + 10],
      'Mesma quantidade em cada dia: multiplique pelo número de dias.', `${a} × ${b} = ${a * b}`); },
  () => { const n = ri(3, 9), k = ri(4, 10), t = n * k;
    return numPack('mult-div', 1, `${t} chocolates serão divididos igualmente entre ${n} amigos. Quantos chocolates cada amigo recebe?`, k, [k + 1, k - 1, t - n, n + k, k + 2],
      'Repartir em partes iguais pede uma divisão (÷).', `${t} ÷ ${n} = ${k}`); },
  () => { const n = ri(4, 10), k = ri(5, 10), t = n * k;
    return numPack('mult-div', 2, `Um pacote de figurinhas tem ${k} figurinhas. Quantos pacotes são necessários para juntar ${t} figurinhas?`, n, [n + 1, n - 1, t - k, n + 2],
      'Quantos grupos de ' + k + ' cabem em ' + t + '? Use a divisão.', `${t} ÷ ${k} = ${n}`); },
  () => { const x = pick(NOMES), k = ri(4, 10), n = ri(4, 10), t = k * n;
    return numPack('mult-div', 2, `Um livro tem ${t} páginas. Lendo ${k} páginas por dia, em quantos dias ${x} termina o livro?`, n, [n + 1, n - 1, t - k, n + 2],
      'Total de páginas ÷ páginas lidas por dia = número de dias.', `${t} ÷ ${k} = ${n}`); },
  () => { const a = ri(4, 9), b = ri(6, 12);
    return numPack('mult-div', 1, `Uma caixa de ovos de chocolate tem ${a} fileiras com ${b} ovos em cada fileira. Quantos ovos há na caixa?`, a * b, [a + b, a * b + b, a * b - b, a * b + 10],
      'Fileiras iguais: multiplique fileiras × ovos por fileira.', `${a} × ${b} = ${a * b}`); }
];

/* ---------------------------------------------------------------------
   DINHEIRO  (valores em centavos, formatados como R$ 0,00)
   --------------------------------------------------------------------- */
const dinheiro = [
  () => { const x = pick(NOMES), m = ri(30, 90) * 100, g = ri(5, 25) * 100;
    return numPack('dinheiro', 1, `${x} recebeu ${R(m)} de mesada e gastou ${R(g)} no cinema. Com quanto dinheiro ficou?`, m - g, [m + g, m - g + 200, m - g - 200, g, m - g + 500],
      'Gastar é tirar dinheiro: subtraia.', `${R(m)} − ${R(g)} = ${R(m - g)}`, R, 100); },
  () => { const x = pick(NOMES), nota = pick([20, 50, 100]) * 100, p = ri(6, nota / 50 - 2) * 50;
    return numPack('dinheiro', 2, `Um brinquedo custa ${R(p)}. ${x} pagou com uma nota de ${R(nota)}. Quanto recebeu de troco?`, nota - p, [p, nota + p, nota - p + 100, nota - p - 100, nota - p + 50],
      'Troco = o que você entregou − o preço.', `${R(nota)} − ${R(p)} = ${R(nota - p)}`, R, 50); },
  () => { const x = pick(NOMES), r = ri(5, 15) * 100, w = ri(4, 10);
    return numPack('dinheiro', 1, `${x} guarda ${R(r)} por semana no cofrinho. Quanto terá guardado depois de ${w} semanas?`, r * w, [r + w * 100, r * w + r, r * w - r, r * w + 500],
      'Mesmo valor guardado várias vezes: multiplique.', `${R(r)} × ${w} = ${R(r * w)}`, R, 100); },
  () => { const p = ri(10, 25) * 100 + pick([0, 50]), n = ri(2, 5);
    return numPack('dinheiro', 1, `O ingresso do cinema custa ${R(p)}. Quanto custam ${n} ingressos?`, p * n, [p + n * 100, p * n + p, p * n - p, p * n + 500],
      'Vários ingressos com o mesmo preço: multiplique.', `${R(p)} × ${n} = ${R(p * n)}`, R, 50); },
  () => { const a = ri(6, 20) * 100 + pick([0, 50]), b = ri(8, 25) * 100 + pick([0, 50]);
    return numPack('dinheiro', 1, `Um carrinho custa ${R(a)} e uma bola custa ${R(b)}. Quanto custam os dois juntos?`, a + b, [Math.abs(b - a), a + b + 100, a + b - 100, a + b + 50],
      '"Os dois juntos": some os preços.', `${R(a)} + ${R(b)} = ${R(a + b)}`, R, 50); }
];

/* ---------------------------------------------------------------------
   FRAÇÕES (noção básica)
   --------------------------------------------------------------------- */
const fracoes = [
  () => { const d = pick([4, 6, 8, 10, 12]), n = ri(1, d - 1), x = pick(NOMES);
    return txtPack('fracoes', 1, `Uma pizza foi cortada em ${d} fatias iguais. ${x} comeu ${n} fatias. Que fração da pizza foi comida?`, `${n}/${d}`,
      [`${d - n}/${d}`, `${d}/${n}`, `1/${d}`, `${n}/${d + 2}`], ['1/2', '3/4', '2/5', '1/3', '5/6'],
      'A fração é: partes que interessam / total de partes iguais.', `${n} fatias de ${d} → ${n}/${d}`); },
  () => { const d = pick([6, 8, 10, 12]), r = ri(1, d - 1);
    return txtPack('fracoes', 1, `Um bolo foi dividido em ${d} pedaços iguais. Sobraram ${r} pedaços. Que fração do bolo sobrou?`, `${r}/${d}`,
      [`${d - r}/${d}`, `${d}/${r}`, `1/${d}`, `${r}/${d + 2}`], ['1/2', '3/4', '2/5', '1/3', '5/6'],
      'Escreva quantos pedaços sobraram em cima e o total de pedaços embaixo.', `${r} pedaços de ${d} → ${r}/${d}`); },
  () => { const [x, y] = dois(), d = pick([2, 3, 4, 5]), t = d * ri(2, 8);
    return numPack('fracoes', 2, `${x} tem ${t} bombons e deu 1/${d} deles para ${y}. Quantos bombons ${x} deu?`, t / d, [t - t / d, t / d + 2, t / d - 1, t / d + 1, d],
      `1/${d} de um total é o total dividido em ${d} partes iguais: divida por ${d}.`, `${t} ÷ ${d} = ${t / d}`); },
  () => { const F = pick([8, 12]), d = pick(F === 8 ? [2, 4] : [2, 3, 4, 6]), n = ri(1, d - 1), x = pick(NOMES), a = F / d * n;
    return numPack('fracoes', 2, `Uma pizza tem ${F} fatias. ${x} comeu ${n}/${d} da pizza. Quantas fatias ${x} comeu?`, a, [F / d, F - a, a + 1, n + d, a + 2],
      `Divida as ${F} fatias em ${d} partes iguais e pegue ${n} delas.`, `${F} ÷ ${d} = ${F / d}; ${F / d} × ${n} = ${a}`); },
  () => { const [x, y] = dois(), d1 = ri(2, 5), d2 = d1 + ri(1, 4);
    return txtPack('fracoes', 2, `${x} comeu 1/${d1} de uma barra de chocolate e ${y} comeu 1/${d2} da mesma barra. Quem comeu mais chocolate?`, x,
      [y, 'Comeram a mesma quantidade', 'Não dá para saber'], [],
      'Quanto MENOR o número de baixo (com o mesmo número em cima), MAIOR é o pedaço.', `1/${d1} é maior que 1/${d2}, porque a barra foi dividida em menos partes.`); }
];

/* ---------------------------------------------------------------------
   MÉDIA SIMPLES
   --------------------------------------------------------------------- */
function valores(n, m, lo, hi) {
  for (let t = 0; t < 200; t++) {
    const v = Array.from({ length: n - 1 }, () => ri(lo, hi)), last = n * m - v.reduce((a, b) => a + b, 0);
    if (last >= lo && last <= hi && !(new Set([...v, last]).size === 1)) return shuffle([...v, last]);
  }
  return Array.from({ length: n }, (_, i) => m + (i % 2 ? 1 : -1) * (i < n - 1 ? 1 : 0));
}
const media = [
  () => { const n = pick([3, 4]), m = ri(5, 9), v = valores(n, m, 3, 10), x = pick(NOMES), s = v.reduce((a, b) => a + b, 0);
    return numPack('media', 2, `${x} tirou ${lista(v)} em ${n} provas. Qual foi a média das notas?`, m, [s, m + 1, m - 1, m + 2, s - n],
      'Média = soma de todos os valores ÷ quantidade de valores.', `${v.join(' + ')} = ${s}; ${s} ÷ ${n} = ${m}`); },
  () => { const m = ri(8, 15), v = valores(4, m, 4, 22), x = pick(NOMES), s = v.reduce((a, b) => a + b, 0);
    return numPack('media', 2, `Em 4 dias, ${x} leu ${lista(v)} páginas. Qual foi a média de páginas lidas por dia?`, m, [s, m + 1, m - 1, m + 2, s - 4],
      'Some as páginas dos 4 dias e divida por 4.', `${v.join(' + ')} = ${s}; ${s} ÷ 4 = ${m}`); },
  () => { const m = ri(4, 8), v = valores(3, m, 2, 12), s = v.reduce((a, b) => a + b, 0);
    return numPack('media', 2, `Três fantasminhas assustaram ${lista(v)} visitantes em três noites. Qual foi a média de visitantes assustados por noite?`, m, [s, m + 1, m - 1, m + 2],
      'Média = soma ÷ quantidade de noites.', `${v.join(' + ')} = ${s}; ${s} ÷ 3 = ${m}`); }
];

/* ---------------------------------------------------------------------
   PROBLEMAS DE MÚLTIPLAS ETAPAS
   --------------------------------------------------------------------- */
const multietapas = [
  () => { const x = pick(NOMES), n = ri(3, 6), p = ri(2, 9), t = n * p + ri(3, 25);
    return numPack('multietapas', 3, `${x} tinha ${R(t * 100)}. Comprou ${n} balões de ${R(p * 100)} cada. Quanto dinheiro sobrou?`, (t - n * p) * 100, [(t - p) * 100, n * p * 100, (t + n * p) * 100, (t - n * p) * 100 + 200],
      '1º: quanto custaram os balões (×). 2º: tire do que tinha (−).', `${n} × ${R(p * 100)} = ${R(n * p * 100)}; ${R(t * 100)} − ${R(n * p * 100)} = ${R((t - n * p) * 100)}`, R, 100); },
  () => { const x = pick(NOMES), a = ri(40, 120), b = ri(10, a - 10), c = ri(5, 40);
    return numPack('multietapas', 3, `${x} tinha ${a} figurinhas. Doou ${b} e depois ganhou ${c}. Com quantas figurinhas ficou?`, a - b + c, [a - b - c, a + b + c, a - b, a + b - c],
      'Faça na ordem da história: doar é tirar (−), ganhar é juntar (+).', `${a} − ${b} = ${a - b}; ${a - b} + ${c} = ${a - b + c}`); },
  () => { const a = ri(30, 50), b = ri(5, 20), c = ri(3, 15);
    return numPack('multietapas', 3, `Um ônibus saiu com ${a} passageiros. No primeiro ponto, desceram ${b} e subiram ${c}. Quantos passageiros ficaram no ônibus?`, a - b + c, [a - b - c, a + b + c, a - b, a + b - c],
      'Quem desce sai (−); quem sobe entra (+).', `${a} − ${b} = ${a - b}; ${a - b} + ${c} = ${a - b + c}`); },
  () => { let n, k, t, ds; do { n = ri(2, 6); k = ri(2, 6); t = n * k; ds = []; for (let d = 2; d <= 10; d++) if (t % d === 0 && t / d <= 10 && d !== n && d !== k) ds.push(d); } while (!ds.length);
    const p = pick(ds);
    return numPack('multietapas', 3, `${n} caixas com ${k} bombons cada foram divididas igualmente entre ${p} fantasminhas. Quantos bombons cada fantasminha recebeu?`, t / p, [t, k, t / p + 1, t / p - 1, n + k],
      '1º: quantos bombons há ao todo (×). 2º: reparta entre os fantasminhas (÷).', `${n} × ${k} = ${t}; ${t} ÷ ${p} = ${t / p}`); },
  () => { const x = pick(NOMES), a = ri(10, 40), b = ri(10, 40), p = ri(8, a + b - 5);
    return numPack('multietapas', 3, `${x} ganhou ${R(a * 100)} da avó e ${R(b * 100)} do tio. Depois comprou um livro de ${R(p * 100)}. Quanto sobrou?`, (a + b - p) * 100, [(a + b) * 100, (a + b + p) * 100, Math.abs(a - b) * 100, (a + b - p) * 100 + 500],
      '1º: some o dinheiro recebido (+). 2º: tire o preço do livro (−).', `${R(a * 100)} + ${R(b * 100)} = ${R((a + b) * 100)}; ${R((a + b) * 100)} − ${R(p * 100)} = ${R((a + b - p) * 100)}`, R, 100); },
  () => { const F = pick([8, 12]), [x, y] = dois(), a = ri(1, F / 2 - 1), b = ri(1, F / 2 - 1);
    return txtPack('multietapas', 3, `Uma pizza tem ${F} fatias. ${x} comeu ${a} fatias e ${y} comeu ${b} fatias. Que fração da pizza sobrou?`, `${F - a - b}/${F}`,
      [`${a + b}/${F}`, `${F - a}/${F}`, `${F - a - b}/${a + b}`, `${F - b}/${F}`], ['1/2', '1/4', '3/4', '2/3'],
      '1º: quantas fatias foram comidas (+). 2º: quantas sobraram (−). 3º: escreva sobras/total.', `${a} + ${b} = ${a + b}; ${F} − ${a + b} = ${F - a - b} → ${F - a - b}/${F}`); },
  () => { const x = pick(NOMES), k = ri(4, 10), n = ri(3, 9), A = ri(20, 60), T = A + k * n;
    return numPack('multietapas', 3, `Um livro tem ${T} páginas. ${x} já leu ${A}. Lendo ${k} páginas por dia, em quantos dias termina o livro?`, n, [n + 1, n - 1, Math.floor(T / k), Math.floor(A / k) + n, n + 2],
      '1º: quantas páginas faltam (−). 2º: divida pelo que lê por dia (÷).', `${T} − ${A} = ${T - A}; ${T - A} ÷ ${k} = ${n}`); },
  () => { const a = ri(6, 12), b = ri(3, 6), c = ri(4, 15);
    return numPack('multietapas', 3, `Um pacote tem ${a} bombons. Pipoca comprou ${b} pacotes e ganhou mais ${c} bombons de presente. Quantos bombons Pipoca tem agora?`, a * b + c, [a * b - c, a + b + c, a * (b + c), a * b],
      '1º: bombons dos pacotes (×). 2º: some o presente (+).', `${a} × ${b} = ${a * b}; ${a * b} + ${c} = ${a * b + c}`); },
  () => { const x = pick(NOMES), n = ri(6, 15), p = ri(3, 8), g = ri(5, n * p - 5);
    return numPack('multietapas', 3, `${x} vendeu ${n} bolinhos a ${R(p * 100)} cada e gastou ${R(g * 100)} com os ingredientes. Quanto sobrou de lucro?`, (n * p - g) * 100, [n * p * 100, (n * p + g) * 100, (p - g > 0 ? p - g : g) * 100, (n * p - g) * 100 + 500],
      '1º: quanto entrou com as vendas (×). 2º: tire o gasto (−).', `${n} × ${R(p * 100)} = ${R(n * p * 100)}; ${R(n * p * 100)} − ${R(g * 100)} = ${R((n * p - g) * 100)}`, R, 100); }
];

/* ---------------------------------------------------------------------
   API
   --------------------------------------------------------------------- */
const TEMAS = { 'soma-sub': somaSub, 'mult-div': multDiv, dinheiro, fracoes, multietapas };   // 'media' retirado a pedido (lista 'media' fica guardada acima, sem uso)
const NOMES_TEMAS = { 'soma-sub': 'Adição e subtração', 'mult-div': 'Multiplicação e divisão', dinheiro: 'Dinheiro', fracoes: 'Frações', media: 'Média', multietapas: 'Várias etapas' };
const gerar = tema => pick(TEMAS[tema])();
/** plano([['fracoes',2],['media',2]]) → lista embaralhada, sem enunciados repetidos */
function plano(pares) {
  const out = [], seen = new Set();
  for (const [tema, n] of pares) for (let i = 0; i < n; i++) { let p; for (let t = 0; t < 40; t++) { p = gerar(tema); if (!seen.has(p.q)) break; } seen.add(p.q); out.push(p); }
  return shuffle(out);
}
const api = { _h: { ri, pick, shuffle, NOMES, lista, valores, dois, N, R }, gerar, plano, temas: Object.keys(TEMAS), nomes: NOMES_TEMAS, N, R };
const root = typeof window !== 'undefined' ? window : globalThis;
(root.Mansao = root.Mansao || {}).Banco = api;
})();
