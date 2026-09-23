// Gera ../SUBIR-NO-SITE/index.html: o jogo inteiro (HTML + CSS + JS) em UM arquivo só.
// Uso:  node build.js   (ou dê dois cliques em GERAR-VERSAO-SITE.bat)
const fs = require('fs'), path = require('path');
const root = __dirname, out = path.join(root, '..', 'SUBIR-NO-SITE');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const safe = txt => txt.replace(/<\/script/gi, '<\\/script').replace(/<\/style/gi, '<\\/style');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) =>
  `<style>\n${safe(fs.readFileSync(path.join(root, href), 'utf8'))}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
  `<script>\n${safe(fs.readFileSync(path.join(root, src), 'utf8'))}\n</script>`);

if (/(src|href)="(?!#|data:)[^"]*\.(js|css)"/.test(html)) throw new Error('Ainda há referência a arquivo externo!');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('OK! SUBIR-NO-SITE/index.html gerado (' + Math.round(html.length / 1024) + ' KB).');
