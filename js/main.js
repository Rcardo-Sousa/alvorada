/* liga o cenário à câmera e deixa o scroll conduzir o sobrevoo */

import { lim } from './utils.js';
import { montarCenario } from './cenario.js';
import { criarCamera } from './camera.js';
import { iniciarExperiencia, pintarEntrada } from './experiencia.js';
import { iniciarNarrativa, pintarNarrativa } from './narrativa.js';
import { iniciarTema } from './tema.js';
import { iniciarAtmosfera } from './atmosfera.js';

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const estreito = window.innerWidth < 760;

const pega = (id) => document.getElementById(id);

const el = {
  palco: pega('palco'),
  chao: pega('chao'),
  cenario: pega('cenario'),
  mundo: pega('mundo'),
  wrap: pega('mundoWrap'),
  camera: pega('camera'),
  lente: pega('lente'),
  aerea: pega('aerea'),
  bruma: pega('bruma'),
  vinheta: pega('vinheta'),
  raios: pega('raios'),
  hud: pega('hud'),
  altValor: pega('altValor'),
  rolar: pega('rolar'),
  trilho: pega('trilho'),
  ponte: pega('ponte'),
  cenas: [1, 2, 3, 4, 5].map((n) => pega('cena' + n))
};

const pecas = montarCenario(el.cenario, { estreito, reduz });
const cam = criarCamera(el, pecas);

let alvo = 0, atual = 0;

function loop(){
  /* lerp mais macio = scroll menos “degrau” no dissolve */
  atual += (alvo - atual) * (reduz ? 1 : .065);
  if (Math.abs(alvo - atual) < .15) atual = alvo;

  const p = lim(atual / cam.max, 0, 1);
  /* handoff começa quando a câmera já estabilizou e o editorial sobe */
  const handoff = lim((atual - cam.max) / (window.innerHeight * (estreito ? 1.15 : 1.5)), 0, 1);

  cam.pintar(p, handoff);
  pintarEntrada(atual, cam.max);
  pintarNarrativa();
  requestAnimationFrame(loop);
}

window.addEventListener('scroll', () => { alvo = window.scrollY; }, { passive: true });
window.addEventListener('resize', cam.medir);

cam.medir();
alvo = atual = window.scrollY;

iniciarTema();
iniciarExperiencia();
iniciarNarrativa(document.getElementById('conteudo'));
iniciarAtmosfera();

const p0 = lim(atual / cam.max, 0, 1);
const h0 = lim((atual - cam.max) / (window.innerHeight * (estreito ? 1.15 : 1.5)), 0, 1);
cam.pintar(p0, h0);
pintarEntrada(atual, cam.max);
pintarNarrativa();
requestAnimationFrame(loop);
