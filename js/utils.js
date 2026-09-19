/* funções curtas usadas pelo cenário e pela câmera */

export function lim(v, a, b){ return v < a ? a : v > b ? b : v; }

/* quanto de p já andou entre a e b, de 0 a 1 */
export function faixa(p, a, b){ return lim((p - a) / (b - a), 0, 1); }

export function suave(t){ return t * t * (3 - 2 * t); }

/* ease ainda mais longa — bom para dissolves */
export function suave2(t){ return suave(suave(t)); }

export function lerp(a, b, t){ return a + (b - a) * t; }

export function esc(a){ return Math.random() * a; }

export function um(l){ return l[Math.floor(Math.random() * l.length)]; }

/* posiciona pelo ponto de apoio: centro do chão para peças deitadas, base para as em pé */
export function por(el, x, y, w, h, deitado){
  el.style.left = (x - w / 2) + 'px';
  el.style.top = (y - (deitado ? h / 2 : h)) + 'px';
}
