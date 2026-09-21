# A Mansão dos Espíritos

Jogo de escape room 3D (CSS 3D) para o 5º ano. Fantasminhas travessos, enigmas variados, 30 fases planejadas.
**Para jogar: dê dois cliques em `index.html`.** Não precisa instalar nada nem ter internet.

## Situação atual — Etapa 1
Motor completo + fases 1 a 8. As fases 9 a 30 entram nas próximas etapas.

| Fase | Nome | Mecânica |
|---|---|---|
| 1 | O Quadro | explorar, clicar, sequência |
| 2 | O Código do Relógio | observação, ler hora, código numérico |
| 3 | A Porta dos Símbolos | lógica de ordem (frases-pista), reinicia se errar |
| 4 | Memória dos Fantasmas | memorizar, 3 rodadas crescentes |
| 5 | O Livro Proibido | livro 3D, busca visual |
| 6 | Resposta Rápida | problemas de matemática com cronômetro que sobe (soma/subtração, × ÷, dinheiro) |
| 7 | O Fantasma Ascendente | problemas de frações, média e várias etapas contra um fantasma que sobe |
| 8 | Caçador de Fantasmas | reflexos, alvo em movimento, 5 rodadas |

## Arquivos
```
index.html          estrutura das telas
style.css           visual, sala 3D, HUD, transições
game.js             MOTOR: save, áudio, relógio, fantasmas, HUD, dicas, vidas, pontos
fases/fases-01-08.js  as fases (uma por objeto)
serve.js            servidor opcional só para desenvolvimento (node serve.js)
assets/             pastas reservadas (imagens, sons, fontes) — hoje tudo é gerado por código
```

## Como criar uma fase nova
Em `fases/`, crie um arquivo (ex.: `fases-09-16.js`), adicione `<script src="fases/fases-09-16.js">` no `index.html` e registre:

```js
Mansao.phase({
  id: 9, title: 'Nome', room: 'study',        // hall | lounge | corridor | study | ballroom | stairs
  transition: 'door',                          // door | corridor | stairs | down | fade
  difficulty: 1, kind: 'Tipo de desafio', par: 120,   // par = segundos para o bônus de rapidez
  intro: '...', objective: '...', success: '...',
  hints: ['dica 1', rt => 'dica 2 usando ctx.rt', 'solução'],
  start(ctx) {
    ctx.mount('<div>...html da fase...</div>');
    // ctx.on(el,'click',fn)  ctx.after(ms,fn)  ctx.every(ms,fn)  ctx.frame(dt=>{})   (limpos sozinhos)
    // ctx.mistake(3)  -> registra erro; a cada 3 erros uma velinha se apaga
    // ctx.loseLife()  ctx.win({bonus:50})  ctx.clue('p9', valor)  ctx.say('sussurro')
  }
});
```

## Regras do jogo
- 3 velinhas (vidas). Concluir uma fase devolve 1. Zerou: tentar a fase de novo ou voltar ao checkpoint (fases 1, 6, 11, 16, 21, 26).
- Pontos: base por dificuldade + rapidez + velinhas + "sem erros" − erros. Dicas: 25 / 50 / 150 pontos. Pontos nunca bloqueiam o avanço.
- Um olhinho escondido em cada sala vale +50.
- Progresso salvo em `localStorage`. Acessibilidade: opção "reduzir tremores, sustos e luzes".

## Testes
`index.html?fase=5` abre direto a fase 5 (atalho de desenvolvimento).

## Conteúdo de matemática (5º ano)
`conteudo/banco-matematica.js` gera problemas com números sorteados, em 6 temas: `soma-sub`, `mult-div`, `dinheiro`, `fracoes`, `media`, `multietapas`.
Cada problema traz enunciado, resposta certa, 3 erradas plausíveis (erros típicos de aluno), uma dica da operação e o passo a passo.
```js
const lista = Mansao.Banco.plano([['fracoes', 2], ['media', 2], ['multietapas', 4]]);  // já vem embaralhada
lista[0] // { tema, nivel, q, a, w:[...], dica, sol }
```
Para novos tipos de problema, basta acrescentar uma função na lista do tema.
