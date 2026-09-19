/* handoff editorial controlado pelo mesmo scroll da câmera */

import { lim, faixa, suave2 } from './utils.js';

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const estreito = () => window.innerWidth < 760;

let main = null;
let trilho = null;
let menu = null;
let pronto = false;

function aplicarCamadas(h){
  if (!main) return;

  /* respiração leve: overlapping curto, sem peso — papel → tipografia → foto → menu */
  const papel = suave2(faixa(h, .02, .28));
  const faixaLinha = suave2(faixa(h, .06, .22));
  const contexto = suave2(faixa(h, .10, .30));
  const titulo1 = suave2(faixa(h, .16, .40));
  const titulo2 = suave2(faixa(h, .24, .48));
  const foto = suave2(faixa(h, .28, .58));
  const tracos = suave2(faixa(h, .34, .66));
  const menuProg = suave2(faixa(h, .36, .64));
  const rodape = suave2(faixa(h, .46, .76));

  main.style.setProperty('--e', h.toFixed(4));
  main.style.setProperty('--e-papel', papel.toFixed(4));
  main.style.setProperty('--e-faixa', faixaLinha.toFixed(4));
  main.style.setProperty('--e-contexto', contexto.toFixed(4));
  main.style.setProperty('--e-titulo1', titulo1.toFixed(4));
  main.style.setProperty('--e-titulo2', titulo2.toFixed(4));
  main.style.setProperty('--e-foto', foto.toFixed(4));
  main.style.setProperty('--e-menu', menuProg.toFixed(4));
  main.style.setProperty('--e-rodape', rodape.toFixed(4));
  main.style.setProperty('--e-tracos', tracos.toFixed(4));

  main.classList.toggle('entrada-ativa', h > .02);
  main.classList.toggle('menu-pronta', menuProg > .35);
  main.classList.toggle('entrada-pronta', h > .88);

  /* header fixo: só o conteúdo editorial rola por baixo */
  let fixar = false;
  if (menu && menuProg > .5){
    if (main.classList.contains('menu-fixo')){
      fixar = main.getBoundingClientRect().top <= 0 && h > .15;
    } else {
      fixar = menu.getBoundingClientRect().top <= 0.5;
    }
  }
  main.classList.toggle('menu-fixo', fixar);
}

export function pintarEntrada(scrollY, camMax){
  if (!pronto || !main) return;

  if (reduz){
    aplicarCamadas(1);
    return;
  }

  const vh = window.innerHeight;
  /* span um pouco mais longo = entrada mais aérea, menos apressada */
  const span = vh * (estreito() ? 1.15 : 1.5);
  const h = suave2(faixa(scrollY, camMax, camMax + span));
  aplicarCamadas(h);
}

export function iniciarExperiencia(){
  main = document.getElementById('conteudo');
  trilho = document.getElementById('trilho');
  if (!main) return;
  menu = main.querySelector('.menu-site');
  pronto = true;

  main.classList.add('site-entrada', 'handoff-scroll');

  if (reduz){
    aplicarCamadas(1);
  }

  const imagens = [...document.querySelectorAll('.imagem-editorial img, .projeto-imagem img, .depoimento-foto img, .abertura-foto img')];
  let agendado = false;

  function moverImagens(){
    const altura = window.innerHeight;
    imagens.forEach((imagem) => {
      const caixa = imagem.parentElement.getBoundingClientRect();
      if (caixa.bottom < 0 || caixa.top > altura) return;
      const centro = caixa.top + caixa.height / 2;
      const deslocamento = Math.max(-10, Math.min(10, (altura / 2 - centro) * .018));
      imagem.style.setProperty('--paralaxe', deslocamento.toFixed(1) + 'px');
    });
    agendado = false;
  }

  window.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(moverImagens);
  }, { passive: true });

  moverImagens();

  if (trilho){
    pintarEntrada(window.scrollY, Math.max(trilho.offsetHeight - window.innerHeight, 1));
  }
}
