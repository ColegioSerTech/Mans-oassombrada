/* =====================================================================
   BANCO — problemas de RESPOSTA CURTA (cadeados, cofres, reflexos)
     Banco.digito(n)   n problemas cuja resposta é UM dígito (0–9)      → { d, q, dica, sol, tema }
     Banco.numero(n)   n problemas cuja resposta está entre 10 e 39     → { n, q, dica, sol, tema }
     Banco.conta(nivel) uma conta solta: 1 (+ −) · 2 (× ÷) · 3 (2 operações) → { e:'7 × 8', r:56 }
   ===================================================================== */
(function () {
'use strict';
const B = Mansao.Banco, { ri, pick, shuffle, NOMES, lista, valores } = B._h;

const digitos = [
  () => { const x = pick(NOMES), a = ri(1, 5), b = ri(1, 9 - a);
    return { d: a + b, tema: 'soma-sub', q: `${x} tinha ${a} balas e ganhou mais ${b}. Quantas balas tem agora?`, dica: 'Ganhar é juntar: some.', sol: `${a} + ${b} = ${a + b}` }; },
  () => { const a = ri(2, 4), b = ri(2, Math.floor(9 / a));
    return { d: a * b, tema: 'mult-div', q: `${a} pacotes com ${b} balas em cada um. Quantas balas há ao todo?`, dica: 'Grupos iguais: multiplique.', sol: `${a} × ${b} = ${a * b}` }; },
  () => { const n = ri(2, 4), k = ri(2, Math.floor(9 / n));
    return { d: k, tema: 'mult-div', q: `${n * k} chocolates divididos igualmente entre ${n} amigos. Quantos chocolates cada um recebe?`, dica: 'Repartir em partes iguais: divida.', sol: `${n * k} ÷ ${n} = ${k}` }; },
  () => { const x = pick(NOMES), m = ri(6, 9), g = ri(2, m - 1);
    return { d: m - g, tema: 'dinheiro', q: `${x} tinha R$ ${m},00 e gastou R$ ${g},00 no cinema. Quantos reais sobraram?`, dica: 'Gastar é tirar: subtraia.', sol: `${m} − ${g} = ${m - g}` }; },
  () => { const den = pick([2, 3, 4]), k = ri(2, Math.floor(9 / den));
    return { d: k, tema: 'fracoes', q: `Quanto é 1/${den} de ${den * k} bombons?`, dica: `Divida o total em ${den} partes iguais.`, sol: `${den * k} ÷ ${den} = ${k}` }; },
  () => { let a, b, c; do { a = ri(2, 4); b = ri(2, 4); c = ri(1, 5); } while (a * b - c < 0 || a * b - c > 9);
    return { d: a * b - c, tema: 'multietapas', q: `${a} pacotes com ${b} balas cada. Os fantasminhas comeram ${c} balas. Quantas balas sobraram?`, dica: '1º: quantas balas há (×). 2º: tire as comidas (−).', sol: `${a} × ${b} = ${a * b}; ${a * b} − ${c} = ${a * b - c}` }; }
];
const numeros = [
  () => { const a = ri(3, 6), b = ri(3, 9);
    return { n: a * b, tema: 'mult-div', q: `${a} caixas com ${b} velas cada. Quantas velas há ao todo?`, dica: 'Multiplique.', sol: `${a} × ${b} = ${a * b}` }; },
  () => { const a = ri(12, 25), b = ri(8, 39 - a);
    return { n: a + b, tema: 'soma-sub', q: `O Barão tinha ${a} moedas e achou mais ${b}. Com quantas ficou?`, dica: 'Some.', sol: `${a} + ${b} = ${a + b}` }; },
  () => { const a = ri(30, 39), b = ri(6, 18);
    return { n: a - b, tema: 'soma-sub', q: `Havia ${a} livros na estante e ${b} foram emprestados. Quantos ficaram?`, dica: 'Subtraia.', sol: `${a} − ${b} = ${a - b}` }; },
  () => { const a = ri(3, 6), b = ri(3, 6), c = ri(2, 8);
    return { n: a * b + c, tema: 'multietapas', q: `Há ${a} fileiras com ${b} cadeiras cada, mais ${c} cadeiras soltas. Quantas cadeiras há?`, dica: '1º: multiplique. 2º: some as soltas.', sol: `${a} × ${b} = ${a * b}; ${a * b} + ${c} = ${a * b + c}` }; },
  () => { const p = ri(2, 4), r = ri(3, 9);
    return { n: p * r, tema: 'dinheiro', q: `Cada livro custa R$ ${r},00. Quantos reais custam ${p} livros?`, dica: 'Multiplique o preço pela quantidade.', sol: `${p} × ${r} = ${p * r}` }; },
  () => { const den = pick([2, 3, 4, 5]), k = ri(Math.ceil(10 / den), Math.floor(39 / den));
    return { n: k * den, tema: 'fracoes', q: `Uma parte, que é 1/${den} da coleção, tem ${k} figurinhas. Quantas figurinhas tem a coleção toda?`, dica: `A coleção tem ${den} partes iguais: multiplique.`, sol: `${k} × ${den} = ${k * den}` }; }
];

const digito = (n = 4) => shuffle(digitos).slice(0, n).map(f => f());
const numero = (n = 3) => { let out; do { out = shuffle(numeros).slice(0, n).map(f => f()); } while (out.some(o => o.n < 10 || o.n > 39)); return out; };

function conta(nivel = 1) {
  const t = nivel === 1 ? pick(['+', '−']) : nivel === 2 ? pick(['×', '÷', '×']) : pick(['×+', '×−', '+×']);
  if (t === '+') { const a = ri(12, 60), b = ri(8, 40); return { e: `${a} + ${b}`, r: a + b }; }
  if (t === '−') { const a = ri(30, 99), b = ri(8, a - 5); return { e: `${a} − ${b}`, r: a - b }; }
  if (t === '×') { const a = ri(3, 9), b = ri(4, 9); return { e: `${a} × ${b}`, r: a * b }; }
  if (t === '÷') { const b = ri(3, 9), q = ri(4, 9); return { e: `${b * q} ÷ ${b}`, r: q }; }
  if (t === '×+') { const a = ri(3, 7), b = ri(3, 7), c = ri(2, 12); return { e: `${a} × ${b} + ${c}`, r: a * b + c }; }
  if (t === '×−') { const a = ri(4, 8), b = ri(4, 8), c = ri(2, a * b - 5); return { e: `${a} × ${b} − ${c}`, r: a * b - c }; }
  const a = ri(5, 20), b = ri(3, 7), c = ri(2, 6); return { e: `${a} + ${b} × ${c}`, r: a + b * c };
}
Object.assign(B, { digito, numero, conta });
})();
