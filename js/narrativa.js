/* timeline editorial — progresso por seção (sem conflitar com .cena das legendas)
   Ritmo no estilo “marketing scroll”: surge na zona legível, em sequência curta. */

import { lim, faixa, suave2 } from './utils.js';

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 760px)');

let main = null;
let cenas = [];
let ehMobile = mobile.matches;

mobile.addEventListener('change', (e) => { ehMobile = e.matches; });

/**
 * Progresso da seção: 0 abaixo da tela → 1 com o topo na metade superior.
 * Saída suave ao deixar o topo (scroll para cima reabre).
 */
function medirSecao(el, vh){
  const r = el.getBoundingClientRect();
  const nEnter = suave2(faixa(r.top, vh * .98, vh * .2));
  const nExit = suave2(faixa(r.bottom, vh * .35, vh * -.08));
  const n = lim(nEnter * (1 - nExit * .7), 0, 1);
  return { n, nEnter, nExit, r };
}

function revelarFaixas(n){
  return {
    reveal: n,
    title: suave2(faixa(n, .02, .38)),
    text: suave2(faixa(n, .12, .62)),
    image: suave2(faixa(n, .06, .5)),
    detail: suave2(faixa(n, .2, .75))
  };
}

/**
 * Como sites tipo Facepass: o item revela assim que entra na viewport
 * e completa ainda na metade inferior/média — legível sem precisar “subir mais”.
 */
function progressoItem(el, vh, atraso, janela, ancora){
  const alvo = ancora || el;
  const r = alvo.getBoundingClientRect();

  /* 0 = logo abaixo da dobra · 1 = topo ~45–55% da tela */
  const iniVista = vh * (ehMobile ? .97 : 1.0);
  const fimVista = vh * (ehMobile ? .48 : .5);
  let local = suave2(faixa(r.top, iniVista, fimVista));

  /* fração visível — se já está na tela, não fica preso em 0 */
  const visivel = Math.min(r.bottom, vh) - Math.max(r.top, 0);
  const alturaUtil = Math.max(Math.min(r.height, vh * .55), 1);
  const razao = lim(visivel / alturaUtil, 0, 1);
  local = Math.max(local, suave2(razao));

  /* stagger curto: só atrasa o começo, não a legibilidade */
  const ini = Math.min(atraso * .25, .08);
  const fim = Math.min(.92, .42 + (janela ?? .6) * .35 + atraso * .12);
  return suave2(faixa(local, ini, fim));
}

function balancoDe(ni){
  if (ni <= 0 || ni >= 1) return 0;
  return Math.sin(ni * Math.PI);
}

function aplicarCena(cena, medicao){
  const { n, nEnter, nExit } = medicao;
  const nIn = suave2(faixa(nEnter, 0, .4));
  const nMid = suave2(faixa(nEnter, .2, .8)) * (1 - suave2(faixa(nExit, 0, .45)));
  const nOut = nExit;
  const r = revelarFaixas(n);
  const vh = window.innerHeight || 1;

  cena.el.style.setProperty('--n', n.toFixed(4));
  cena.el.style.setProperty('--n-in', nIn.toFixed(4));
  cena.el.style.setProperty('--n-mid', nMid.toFixed(4));
  cena.el.style.setProperty('--n-out', nOut.toFixed(4));
  cena.el.style.setProperty('--reveal', r.reveal.toFixed(4));
  cena.el.style.setProperty('--reveal-title', r.title.toFixed(4));
  cena.el.style.setProperty('--reveal-text', r.text.toFixed(4));
  cena.el.style.setProperty('--reveal-image', r.image.toFixed(4));
  cena.el.style.setProperty('--reveal-detail', r.detail.toFixed(4));

  /* saída bem suave — não apaga conteúdo no meio da leitura */
  const saida = 1 - nOut * (ehMobile ? .2 : .35);

  cena.itens.forEach((item) => {
    let ni;
    if (item.local){
      let ancora = null;
      if (item.ancora){
        const escopo = item.el.closest('article, .projeto, figure, blockquote') || item.el.parentElement;
        ancora = escopo?.querySelector(item.ancora) || null;
      }
      ni = progressoItem(item.el, vh, item.atraso, item.janela, ancora);
    } else {
      const papel = r[item.role] ?? r.reveal;
      ni = suave2(faixa(papel, item.atraso * .25, Math.min(1, .5 + item.atraso * .15)));
    }
    ni = lim(ni * saida, 0, 1);
    const balanco = balancoDe(ni) * (ehMobile ? .4 : .75);

    item.el.style.setProperty('--ni', ni.toFixed(4));
    item.el.style.setProperty('--balanco', balanco.toFixed(4));
    item.el.style.setProperty('--bx', String(item.bx));
  });
}

function aplicarCompleto(cena){
  aplicarCena(cena, { n: 1, nEnter: 1, nExit: 0 });
  cena.itens.forEach((item) => {
    item.el.style.setProperty('--ni', '1');
    item.el.style.setProperty('--balanco', '0');
  });
}

export function pintarNarrativa(){
  if (!main || !cenas.length || reduz){
    cenas.forEach(aplicarCompleto);
    return;
  }

  const vh = window.innerHeight || 1;
  cenas.forEach((cena) => {
    if (cena.nome === 'abertura' && !main.classList.contains('entrada-pronta')){
      aplicarCompleto(cena);
      return;
    }
    aplicarCena(cena, medirSecao(cena.el, vh));
  });

  const abertura = cenas.find((c) => c.nome === 'abertura');
  const manifesto = cenas.find((c) => c.nome === 'manifesto');
  if (abertura && manifesto){
    const m = manifesto.el.getBoundingClientRect();
    const passagem = suave2(faixa(m.top, vh * .92, vh * .15));
    abertura.el.style.setProperty('--n-passagem', passagem.toFixed(4));
  }
}

function registrarItens(el, defs){
  return defs.flatMap((def) =>
    [...el.querySelectorAll(def.sel)].map((node, i) => {
      const bx = def.bx ?? ((i % 2 === 0) ? 1 : -1);
      node.classList.add('narrativa-item', `narrativa-${def.role}`);
      node.style.setProperty('--bx', String(bx));
      return {
        el: node,
        role: def.role,
        atraso: (def.atraso ?? 0) + i * (def.passo ?? 0),
        janela: def.janela,
        local: !!def.local,
        ancora: def.ancora || null,
        bx
      };
    })
  );
}

export function iniciarNarrativa(root){
  main = root;
  if (!main) return;

  const mapa = [
    {
      nome: 'abertura',
      sel: '.abertura',
      itens: [
        { sel: '.abertura-legenda', role: 'detail', atraso: .03 },
        { sel: '.abertura-rodape > p:nth-child(2)', role: 'text', atraso: .06 },
        { sel: '.abertura-rodape .link-seta', role: 'detail', atraso: .1 }
      ]
    },
    {
      nome: 'manifesto',
      sel: '.manifesto',
      itens: [
        { sel: '.imagem-editorial', role: 'image', atraso: 0, local: true, janela: .65, bx: -1 },
        { sel: '.imagem-editorial figcaption', role: 'detail', atraso: .08, local: true, janela: .6, ancora: '.imagem-editorial' },
        { sel: '.manifesto-texto h3', role: 'title', atraso: .04, local: true, janela: .62, bx: 1 },
        { sel: '.manifesto-texto > p', role: 'text', atraso: .08, passo: .05, local: true, janela: .65 }
      ]
    },
    {
      nome: 'trabalhos',
      sel: '#trabalhos',
      itens: [
        { sel: '.secao-cabecalho h2', role: 'title', atraso: 0, local: true, janela: .6 },
        { sel: '.secao-cabecalho > p', role: 'text', atraso: .04, local: true, janela: .58 },
        { sel: '.projeto-imagem', role: 'image', atraso: 0, passo: .04, local: true, janela: .65 },
        { sel: '.projeto-info', role: 'detail', atraso: .04, passo: .04, local: true, janela: .58, ancora: '.projeto-imagem' }
      ]
    },
    {
      nome: 'servicos',
      sel: '#servicos',
      itens: [
        { sel: '.servicos-titulo h2', role: 'title', atraso: 0, local: true, janela: .6 },
        { sel: '.servico', role: 'text', atraso: .02, passo: .05, local: true, janela: .58 }
      ]
    },
    {
      nome: 'processo',
      sel: '.processo',
      itens: [
        { sel: '.processo-frase span', role: 'title', atraso: 0, passo: .06, local: true, janela: .6 },
        { sel: '.etapas li', role: 'detail', atraso: .04, passo: .05, local: true, janela: .6 }
      ]
    },
    {
      nome: 'depoimento',
      sel: '.depoimento',
      itens: [
        { sel: '.depoimento-foto', role: 'image', atraso: 0, local: true, janela: .65, bx: -1 },
        { sel: '.aspas', role: 'detail', atraso: .04, local: true, janela: .58 },
        { sel: '.depoimento blockquote > p', role: 'title', atraso: .03, local: true, janela: .62, bx: 1 },
        { sel: '.depoimento blockquote footer', role: 'text', atraso: .1, local: true, janela: .58 }
      ]
    },
    {
      nome: 'contato',
      sel: '#contato',
      itens: [
        { sel: '.convite h2', role: 'title', atraso: 0, local: true, janela: .6 },
        { sel: '.convite .btn', role: 'detail', atraso: .08, local: true, janela: .58 },
        { sel: '.convite .contato', role: 'text', atraso: .12, local: true, janela: .55 },
        { sel: '.convite-orbita', role: 'detail', atraso: .03, local: true, janela: .55 }
      ]
    }
  ];

  cenas = mapa.map((def) => {
    const el = main.querySelector(def.sel);
    if (!el) return null;
    el.classList.add('narrativa');
    el.dataset.narrativa = def.nome;
    return { nome: def.nome, el, itens: registrarItens(el, def.itens) };
  }).filter(Boolean);

  pintarNarrativa();
}
