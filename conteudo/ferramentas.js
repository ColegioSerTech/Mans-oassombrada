/* =====================================================================
   FERRAMENTAS COMPARTILHADAS PELAS FASES  (Mansao.Tools)
   ===================================================================== */
(function () {
'use strict';
const root = typeof window !== 'undefined' ? window : globalThis;
const M = root.Mansao = root.Mansao || {};

/** Arrastar com mouse/dedo. h = { down(e), move(e), up(e) }. O elemento precisa da classe .drag (touch-action:none). */
function drag(ctx, el, h) {
  ctx.on(el, 'pointerdown', e => {
    if (e.button > 0) return;
    e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { }
    const mv = ev => h.move && h.move(ev);
    const up = ev => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); h.up && h.up(ev); };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    h.down && h.down(e);
  });
}

/** Normaliza o que o aluno digitou: "R$ 12,50" → 12.5 ; "3/8" → "3/8" ; texto → sem acento e minúsculo */
function norm(s) {
  s = String(s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/r\$/g, '').replace(/\s+/g, '');
  if (s.includes('/')) return s;
  const t = s.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(t) ? String(parseFloat(t)) : s;
}
const same = (input, answer) => norm(input) === norm(answer);

/** true se o ponto (x,y) da tela está dentro do elemento */
function inside(el, x, y, pad = 0) { const r = el.getBoundingClientRect(); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; }

/** Segurar um botão (mouse, toque ou barra de espaço). cb(true/false) ao apertar/soltar */
function hold(ctx, el, cb) {
  let on = false;
  const set = v => { if (on !== v) { on = v; el.classList.toggle('held', v); cb(v); } };
  ctx.on(el, 'pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) { } set(true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => ctx.on(el, ev, () => set(false)));
  ctx.on(document, 'keydown', e => { if (e.code === 'Space' && !e.repeat) { e.preventDefault(); set(true); } });
  ctx.on(document, 'keyup', e => { if (e.code === 'Space') set(false); });
}

/** mostra frações (3/8) em formato de fração empilhada */
const fx = t => String(t).replace(/(\d+)\/(\d+)/g, '<span class="frac"><sup>$1</sup><sub>$2</sub></span>');

M.Tools = { drag, norm, same, inside, hold, fx };
})();
