/* liga o cenário à câmera e deixa o scroll conduzir o sobrevoo */

import { lim } from './utils.js';
import { leve, reduz } from './device.js';
import { iniciarExperiencia, pintarEntrada, pintarHandoff } from './experiencia.js';
import { iniciarNarrativa, pintarNarrativa } from './narrativa.js';
import { iniciarTema } from './tema.js';

const pega = (id) => document.getElementById(id);

document.documentElement.classList.add(leve ? 'modo-leve' : 'modo-desktop');
if (leve) document.documentElement.classList.add('sem-drone');

iniciarTema();

function limparDroneResidual(){
  const lixo = [
    'palco', 'aerea', 'raios', 'bruma', 'vinheta',
    'hud', 'rolar', 'trilho', 'ponte', 'luzRastro'
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
  document.querySelectorAll('.legendas, .fundo-vivo').forEach((n) => n.remove());
}

function revelarSiteDireto(main){
  if (!main) return;
  main.classList.add('entrada-pronta', 'menu-pronta', 'entrada-ativa', 'site-entrada');
  [
    '--e', '--e-papel', '--e-faixa', '--e-contexto',
    '--e-titulo1', '--e-titulo2', '--e-foto', '--e-menu',
    '--e-rodape', '--e-tracos'
  ].forEach((v) => main.style.setProperty(v, '1'));
  document.documentElement.classList.add('porta-aberta');
}

/* ── celular / toque: sem cena 3D — o Safari derruba a aba com o sobrevoo ── */
if (leve){
  limparDroneResidual();

  const main = document.getElementById('conteudo');
  const porta = document.getElementById('portaMobile');
  const portaTrilho = document.getElementById('portaTrilho');

  iniciarExperiencia();
  iniciarNarrativa(main);

  /* reduced motion ou hash interno: pula a porta */
  const pularPorta = reduz || (location.hash && location.hash !== '#conteudo' && location.hash !== '#');

  if (pularPorta || !porta || !portaTrilho){
    if (porta) porta.hidden = true;
    revelarSiteDireto(main);
    pintarNarrativa();
    window.addEventListener('scroll', pintarNarrativa, { passive: true });
    window.addEventListener('resize', pintarNarrativa);
  } else {
    porta.hidden = false;
    porta.style.setProperty('--p', '0');
    pintarHandoff(0);

    function camMax(){
      return Math.max(portaTrilho.offsetHeight - window.innerHeight * .05, 1);
    }

    function pintarPorta(){
      const y = window.scrollY;
      const max = camMax();
      const p = lim(y / max, 0, 1);
      /* site nasce junto com a saída da porta */
      const handoff = lim((p - .12) / .78, 0, 1);
      porta.style.setProperty('--p', p.toFixed(4));
      porta.classList.toggle('porta-feita', p > .94);
      document.documentElement.classList.toggle('porta-aberta', handoff > .4);
      pintarHandoff(handoff);
      if (handoff > .15) pintarNarrativa();
    }

    window.addEventListener('scroll', pintarPorta, { passive: true });
    window.addEventListener('resize', pintarPorta);
    pintarPorta();
  }
} else {
  const porta = document.getElementById('portaMobile');
  if (porta) porta.remove();

  /* módulos 3D só no desktop — não parseiam no Safari mobile */
  Promise.all([
    import('./cenario.js'),
    import('./camera.js'),
    import('./atmosfera.js'),
    import('./device.js')
  ]).then(([{ montarCenario }, { criarCamera }, { iniciarAtmosfera }, { estreito, reduz }]) => {
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
  });
}
