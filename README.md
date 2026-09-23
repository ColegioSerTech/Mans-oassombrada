# A Mansão dos Espíritos

Jogo de escape room 3D (CSS 3D) para o 5º ano. Fantasminhas travessos, enigmas variados, 15 fases e 3 finais.
**Para jogar: dê dois cliques em `index.html`.** Não precisa instalar nada nem ter internet.

## Situação atual — Etapas 1 e 2
O jogo tem **15 fases**, sem vidas, e 3 finais (Fuga, Misterioso e Secreto). A lista de fases usadas fica em `ORDEM`, no começo do `game.js` (números originais das fases).

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
| 9 | A Sala Escura | lanterna que segue o mouse/dedo, duplo clique, soma de dinheiro |
| 10 | O Cadeado | girar as rodas de um cadeado (arrastar, rolar, setas) — 4 contas de 1 dígito |
| 11 | O Pote de Balas | apertar N vezes (×), tocar nas balas comidas (−), SEGURAR o botão até uma fração |
| 12 | Códigos Piscantes | reflexo: apertar quando o visor mostra o resultado da conta |
| 13 | Os Quadros | jogo do copo: quadros de frações trocam de lugar no escuro |
| 14 | O Corredor Infinito | corredor 3D: achar a porta que quebra o padrão numérico |
| 15 | O Sussurro dos Preços | memorizar preços e DIGITAR total e troco |
| 16 | Espelhos Mentirosos | achar a igualdade falsa (contas, dinheiro, frações equivalentes) |
| 17 | Fantasmas Passageiros | tocar no fantasma que carrega a resposta certa (velocidade crescente) |
| 18 | O Cofre do Barão | girar um disco de cofre arrastando em círculo (3 números) |
| 19 | Os Sinos Musicais | repetir melodia, tocar os resultados de contas, repetir de trás para frente |
| 20 | O Mercadinho do Porão | ARRASTAR produtos para a cesta até somar o valor exato (com armadilhas) |
| 21 | O Relógio Encantado | ARRASTAR os ponteiros para marcar a hora de fim (problemas de tempo) |
| 22 | A Balança Mágica | ARRASTAR pesos até equilibrar (igualdade, várias etapas) |
| 23 | O Barão Interrogador | chefe: DIGITAR respostas para zerar a energia do Barão |

## Arquivos
```
index.html          estrutura das telas
style.css           visual, sala 3D, HUD, transições
game.js             MOTOR: save, áudio, relógio, fantasmas, HUD, dicas, vidas, pontos
fases/fases-01-08.js, fases-09-16.js, fases-17-23.js  as fases (uma por objeto)
fases/fases.css     estilos dos componentes das fases 9–23
conteudo/           banco-matematica.js (problemas), banco-extra.js (dígitos, números, contas), ferramentas.js (arrastar, segurar, comparar respostas)
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

## Ferramentas para novas fases (Mansao.Tools)
- `Tools.drag(ctx, el, {down, move, up})` — arrastar com mouse/dedo (o elemento precisa da classe `.drag`)
- `Tools.hold(ctx, el, cb)` — segurar botão/barra de espaço, `cb(true|false)`
- `Tools.same(digitado, resposta)` — aceita "12,50", "R$ 12,50", "12.5", "3/8", sem acento/maiúsculas
- `Tools.inside(el, x, y)` — o ponteiro está sobre o elemento? · `Tools.fx("3/8")` — fração empilhada
- `Banco.digito(4)` / `Banco.numero(3)` / `Banco.conta(1..3)` — respostas curtas para cadeados, cofres e reflexos
- `ctx.spend(pontos)` — gasta pontos (ex.: ver de novo)

## Pular fase
Teclas: **P** pula a fase atual (sem confirmação e sem pontos) · **R** volta para a fase anterior · **Esc** abre o menu · **H** pede dica. (P e R não funcionam enquanto se digita num campo de texto.) O menu de pausa também tem os botões "Pular esta fase" e "Voltar à fase anterior". A fase conta como concluída, mas sem pontos, e o jogo vai para a próxima (na última, vai para o final). Se uma fase quebrar ao iniciar, o menu de pausa abre sozinho com essa opção. As fases puladas aparecem na tela de final.

## Fases extras (arquivadas)
Um pacote de 10 fases extras (Confeitaria, Fila, Fios, Reta, Labirinto, Quebra-cabeça, Balões, Mapa, Jardim, Torre) foi feito e testado, mas foi RETIRADO do jogo a pedido. O código está guardado em `codigo-fonte/_arquivo-extras/`. Para reativar: mover os 2 arquivos de volta para `fases/`, incluí-los no `index.html` e rodar o build.

## Mudanças de 23/09/2026
- 15 fases (ORDEM = 2, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20, 22, 23). As outras (1, 3, 4, 5, 8, 13, 19, 21) continuam no código, fora da lista.
- Sem sistema de vidas: erros só tiram pontos; não há game over.
- Sem problemas de média.
- Divisões só até 10 (divisor e resultado no máximo 10).
- Save novo (chave v2): quem tinha progresso da versão de 23 fases começa do zero.

## Cuidado com a classe `ghost`
`.ghost` é a classe dos fantasminhas desenhados (position:absolute, width:76px, pointer-events:none). O botão "transparente" usa `.btn.plain` — **não** use `class="btn ghost"`, senão o botão fica invisível ao clique (o teclado e `.click()` ainda funcionam, então o problema passa despercebido em testes automáticos).
