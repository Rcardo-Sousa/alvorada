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

document.documentElement.classList.add(leve ? 'modo-leve' : 'modo-desktop');
if (leve) document.documentElement.classList.add('sem-drone');

iniciarTema();

/* ── celular / toque: sem cena 3D — o Safari derruba a aba com o sobrevoo ── */
if (leve){
  const lixo = [
    'palco', 'aerea', 'raios', 'bruma', 'vinheta',
    'hud', 'rolar', 'trilho', 'ponte'
  ];
  lixo.forEach((id) => {
    const n = pega(id);
    if (!n) return;
    if (id === 'aerea'){
      n.removeAttribute('src');
      n.removeAttribute('srcset');
    }
    n.remove();
  });
  document.querySelectorAll('.legendas').forEach((n) => n.remove());

  const main = document.getElementById('conteudo');
  if (main){
    main.classList.add('entrada-pronta', 'menu-pronta', 'entrada-ativa', 'site-entrada');
    [
      '--e', '--e-papel', '--e-faixa', '--e-contexto',
      '--e-titulo1', '--e-titulo2', '--e-foto', '--e-menu',
      '--e-rodape', '--e-tracos'
    ].forEach((v) => main.style.setProperty(v, '1'));
  }

  iniciarExperiencia();
  iniciarNarrativa(document.getElementById('conteudo'));
  /* sem atmosfera pesada no mobile */
  pintarNarrativa();
  window.addEventListener('scroll', pintarNarrativa, { passive: true });
  window.addEventListener('resize', pintarNarrativa);
} else {
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

  /* carrega a aérea só no desktop */
  if (el.aerea && el.aerea.dataset.src){
    el.aerea.src = el.aerea.dataset.src;
  }

  const pecas = montarCenario(el.cenario, { estreito, reduz, leve: false });
  const cam = criarCamera(el, pecas, { leve: false });

  let alvo = 0, atual = 0;
  let rodando = false;
  const lerpRate = reduz ? 1 : .065;

  function spanHandoff(){
    return window.innerHeight * 1.5;
  }

  function tick(){
    rodando = true;
    atual += (alvo - atual) * lerpRate;
    if (Math.abs(alvo - atual) < .15) atual = alvo;

    const p = lim(atual / cam.max, 0, 1);
    const handoff = lim((atual - cam.max) / spanHandoff(), 0, 1);

    cam.pintar(p, handoff);
    pintarEntrada(atual, cam.max);
    if (handoff > .02 || atual > cam.max * .9) pintarNarrativa();

    if (atual !== alvo) requestAnimationFrame(tick);
    else rodando = false;
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

  iniciarExperiencia();
  iniciarNarrativa(document.getElementById('conteudo'));
  iniciarAtmosfera();

  const p0 = lim(atual / cam.max, 0, 1);
  const h0 = lim((atual - cam.max) / spanHandoff(), 0, 1);
  cam.pintar(p0, h0);
  pintarEntrada(atual, cam.max);
  pintarNarrativa();
  pedirFrame();
}
