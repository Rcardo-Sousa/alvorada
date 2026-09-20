/* liga o cenário à câmera e deixa o scroll conduzir o sobrevoo */

import { lim } from './utils.js';
import { reduz, leve, estreito } from './device.js';
import { montarCenario } from './cenario.js';
import { criarCamera } from './camera.js';
import { iniciarExperiencia, pintarEntrada } from './experiencia.js';
import { iniciarNarrativa, pintarNarrativa } from './narrativa.js';
import { iniciarTema } from './tema.js';
import { iniciarAtmosfera } from './atmosfera.js';

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

if (leve) document.documentElement.classList.add('modo-leve');

const pecas = montarCenario(el.cenario, { estreito, reduz, leve });
const cam = criarCamera(el, pecas, { leve });

let alvo = 0, atual = 0;
let rodando = false;
const lerpRate = reduz ? 1 : (leve ? .12 : .065);

function spanHandoff(){
  return window.innerHeight * (estreito || leve ? 1.15 : 1.5);
}

function tick(){
  rodando = true;
  atual += (alvo - atual) * lerpRate;
  if (Math.abs(alvo - atual) < (leve ? .4 : .15)) atual = alvo;

  const p = lim(atual / cam.max, 0, 1);
  const handoff = lim((atual - cam.max) / spanHandoff(), 0, 1);

  cam.pintar(p, handoff);
  pintarEntrada(atual, cam.max);
  /* narrativa só depois do sobrevoo — economiza no celular */
  if (handoff > .02 || atual > cam.max * .9) pintarNarrativa();

  if (atual !== alvo){
    requestAnimationFrame(tick);
  } else {
    rodando = false;
  }
}

function pedirFrame(){
  if (!rodando) requestAnimationFrame(tick);
}

window.addEventListener('scroll', () => {
  alvo = window.scrollY;
  pedirFrame();
}, { passive: true });

window.addEventListener('resize', () => {
  cam.medir();
  pedirFrame();
});

cam.medir();
alvo = atual = window.scrollY;

iniciarTema();
iniciarExperiencia();
iniciarNarrativa(document.getElementById('conteudo'));
iniciarAtmosfera();

const p0 = lim(atual / cam.max, 0, 1);
const h0 = lim((atual - cam.max) / spanHandoff(), 0, 1);
cam.pintar(p0, h0);
pintarEntrada(atual, cam.max);
pintarNarrativa();
pedirFrame();
