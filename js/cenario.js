/* ---------------- cenário ----------------
   coordenadas do mundo: (0,0) é o altar, y cresce em direção à entrada,
   x positivo é a fileira da direita. peças em pé têm a base no ponto do chão. */

import { esc, um, por } from './utils.js';

const ROUPAS = ['#2f3a52','#3d3a3a','#6d2a2f','#4a5741','#8d97a8','#b4736b','#5b4a63','#2c4a4d'];
const CABELOS = ['#2b1e18','#4a3524','#6d5238','#8d7a63','#b9b0a4','#d8d2c8'];
const PELES = ['#f0cdb0','#dfb190','#c08c66','#9a6742','#7a4f32'];

/* monta tudo dentro de `cenario` e devolve a lista de peças,
   que é o que a câmera precisa para sumir com o que passa por baixo dela */
export function montarCenario(cenario, { estreito, reduz, leve }){
  var pecas = [];
  var lite = !!leve || !!estreito;

  function grupo(x, y, dx, dy, tipo){
    var g = document.createElement('div');
    g.className = 'grupo';
    cenario.appendChild(g);
    pecas.push({ el: g, x: x, y: y, dx: dx, dy: dy, alto: tipo === 'epe', op: 1 });
    return g;
  }

  var decalques = grupo(0, 600, 1400, 1200, 'plano');
  var luz = document.createElement('div'); luz.className = 'luz';
  var sombra = document.createElement('div'); sombra.className = 'sombra';
  decalques.appendChild(luz); decalques.appendChild(sombra);

  var PISO_INI = -280, PISO_FIM = 3700, PISO_N = lite ? 5 : 16;
  var pisoPasso = (PISO_FIM - PISO_INI) / PISO_N;
  for (var ps = 0; ps < PISO_N; ps++){
    var yP = PISO_INI + ps * pisoPasso;
    var gP = grupo(0, yP + pisoPasso / 2, 640, pisoPasso / 2, 'plano');
    var laje = document.createElement('div');
    laje.className = 'piso-pedra';
    laje.style.top = yP + 'px';
    laje.style.height = (pisoPasso + 2) + 'px';
    if (ps % 2) laje.classList.add('piso-alt');
    gP.appendChild(laje);
  }

  var nCant = lite ? 2 : 6;
  for (var cj = 0; cj < nCant; cj++){
    var yCant = 200 + cj * (lite ? 900 : 520);
    canteiro(-980, yCant);
    canteiro(980, yCant);
  }

  function canteiro(x, y){
    var gCant = grupo(x, y, 160, 200, 'plano');
    var c = document.createElement('div');
    c.className = 'canteiro';
    por(c, x, y, 280, 420, true);
    gCant.appendChild(c);
  }

  if (!reduz && !lite){
    var gPetChao = grupo(0, 900, 120, 800, 'plano');
    for (var pc = 0; pc < 28; pc++){
      var pCh = document.createElement('div');
      pCh.className = 'petala-chao';
      pCh.style.width = (7 + esc(8)) + 'px';
      pCh.style.height = (5 + esc(5)) + 'px';
      pCh.style.transform = 'rotate(' + esc(360) + 'deg)';
      pCh.style.opacity = (.35 + esc(.45)).toFixed(2);
      por(pCh, esc(220) - 110, 200 + esc(2200), 12, 9, true);
      gPetChao.appendChild(pCh);
    }
  }

  var TAP_INI = -60, TAP_FIM = 3400, TAP_N = lite ? 6 : 12;
  var tapPasso = (TAP_FIM - TAP_INI) / TAP_N;
  for (var s = 0; s < TAP_N; s++){
    var yA = TAP_INI + s * tapPasso;
    var g = grupo(0, yA + tapPasso / 2, 150, tapPasso / 2, 'plano');
    var f = document.createElement('div');
    f.className = 'faixa-tapete';
    f.style.top = yA + 'px';
    f.style.height = (tapPasso + 1) + 'px';
    g.appendChild(f);
  }

  var gMuro = grupo(0, -180, 320, 40, 'epe');
  var muro = document.createElement('div');
  muro.className = 'epe mureta';
  muro.innerHTML = '<i class="mureta-topo"></i><i class="mureta-nicho"></i>';
  por(muro, 0, -180, 520, 160, false);
  gMuro.appendChild(muro);

  var gCel = grupo(0, -130, 40, 24, 'epe');
  var cel = document.createElement('div');
  cel.className = 'epe celebrante';
  cel.innerHTML = '<i class="cel-corpo"></i><i class="cel-cab"></i><i class="cel-cabelo"></i><i class="cel-livro"></i>';
  por(cel, 0, -130, 70, 210, false);
  gCel.appendChild(cel);

  var nCol = lite ? 2 : 6;
  for (var ci = 0; ci < nCol; ci++){
    var yCol = 220 + ci * (lite ? 700 : 360);
    coluna(-680, yCol, 440 + esc(36));
    coluna(680, yCol, 440 + esc(36));
  }

  function coluna(x, y, h){
    var gSombra = grupo(x, y, 50, 36, 'plano');
    var sh = document.createElement('div');
    sh.className = 'sombra-pe';
    por(sh, x + 18, y + 10, 90, 48, true);
    gSombra.appendChild(sh);

    var gC = grupo(x, y, 48, 48, 'epe');
    var el = document.createElement('div');
    el.className = 'epe coluna';
    el.style.height = h + 'px';
    el.innerHTML = lite
      ? '<i class="coluna-capitel"></i><i class="coluna-base"></i>'
      : '<i class="coluna-capitel"></i><i class="coluna-base"></i><i class="coluna-canalura"></i>';
    por(el, x, y, 68, h, false);
    gC.appendChild(el);
  }

  var nArv = lite ? 3 : 11;
  for (var ai = 0; ai < nArv; ai++){
    var ladoA = ai % 2 === 0 ? -1 : 1;
    var xArv = ladoA * (920 + (ai % 4) * 140 + esc(70));
    var yArv = -480 + ai * (lite ? 420 : 260) + esc(50);
    var hArv = 540 + esc(200);
    var gShA = grupo(xArv, yArv, 40, 30, 'plano');
    var shA = document.createElement('div');
    shA.className = 'sombra-pe sombra-arv';
    por(shA, xArv + 12, yArv + 8, 70, 40, true);
    gShA.appendChild(shA);

    var gArv = grupo(xArv, yArv, 60, 40, 'epe');
    var arv = document.createElement('div');
    arv.className = 'epe cipreste';
    arv.style.height = hArv + 'px';
    arv.innerHTML = '<i class="cipreste-copa"></i><i class="cipreste-tronco"></i>';
    por(arv, xArv, yArv, 90, hArv, false);
    gArv.appendChild(arv);
  }

  var nLan = lite ? 3 : 9;
  for (var lj = 0; lj < nLan; lj++){
    var yLan = 340 + lj * (lite ? 520 : 310);
    lanterna(-148, yLan, lj);
    lanterna(148, yLan, lj + 4);
  }

  function lanterna(x, y, idx){
    var gShL = grupo(x, y, 20, 16, 'plano');
    var shL = document.createElement('div');
    shL.className = 'sombra-pe sombra-lan';
    por(shL, x + 6, y + 4, 40, 24, true);
    gShL.appendChild(shL);

    var gL = grupo(x, y, 28, 28, 'epe');
    var el = document.createElement('div');
    el.className = 'epe lanterna';
    el.innerHTML = lite
      ? '<i class="lanterna-haste"></i><i class="lanterna-copa"></i><i class="lanterna-fogo"></i>'
      : '<i class="lanterna-haste"></i><i class="lanterna-copa"></i><i class="lanterna-fogo"></i><i class="lanterna-brilho"></i>';
    if (!reduz && !lite){
      el.querySelector('.lanterna-fogo').style.animationDelay = (-(idx * .7)).toFixed(1) + 's';
      el.querySelector('.lanterna-brilho').style.animationDelay = (-(idx * .7)).toFixed(1) + 's';
    }
    por(el, x, y, 36, 88, false);
    gL.appendChild(el);
  }

  var linhas = lite ? 4 : 10;
  var colunas = lite ? 2 : 4;
  for (var r = 0; r < linhas; r++){
    for (var lado = -1; lado <= 1; lado += 2){
      var yL = 420 + r * (lite ? 280 : 160);
      var gl = grupo(lado * 357, yL, 188, 60, 'epe');
      for (var c = 0; c < colunas; c++){
        var x = lado * (215 + c * 118);
        var jit = esc(7) - 3.5;

        var assento = document.createElement('div');
        assento.className = 'assento';
        por(assento, x, yL, 92, 74, true);
        gl.appendChild(assento);

        if (Math.random() > (lite ? 0.35 : 0.18)){
          var gv = document.createElement('div');
          gv.className = 'epe convidado';
          gv.style.background = 'linear-gradient(180deg,' + um(ROUPAS) + ',rgba(0,0,0,.35))';
          gv.style.transform = 'rotateZ(calc(var(--giro) + ' + jit.toFixed(1) + 'deg)) rotateX(var(--tomb))';
          gv.innerHTML = '<div class="cabeca" style="background:' + um(PELES) + '"></div>' +
                         '<div class="coque" style="background:' + um(CABELOS) + '"></div>';
          por(gv, x + esc(8) - 4, yL + 6, 58, 96, false);
          gl.appendChild(gv);
        }

        var cd = document.createElement('div');
        cd.className = 'epe cadeira';
        cd.style.transform = 'rotateZ(calc(var(--giro) + ' + jit.toFixed(1) + 'deg)) rotateX(var(--tomb))';
        cd.innerHTML = lite
          ? '<div class="quadro"></div>'
          : '<div class="quadro"></div><div class="barra a"></div><div class="barra b"></div>';
        por(cd, x, yL + 34, 92, 104, false);
        gl.appendChild(cd);
      }
    }
  }

  function buque(x, y, altura){
    var g = grupo(x, y, 56, 56, 'epe');

    var st = document.createElement('div');
    st.className = 'epe suporte';
    st.style.height = altura + 'px';
    st.innerHTML = '<div class="taca"></div>';
    por(st, x, y, 22, altura, false);
    g.appendChild(st);

    var b = document.createElement('div');
    b.className = 'epe buque';
    var h = '';
    var nFlor = lite ? 5 : 16;
    for (var i = 0; i < nFlor; i++){
      var d = 20 + esc(26), verde = i % 3 === 0;
      h += '<i class="flor" style="width:' + d + 'px;height:' + (d * (verde ? .72 : 1)) +
           'px;left:' + esc(100 - d) + 'px;top:' + esc(92 - d) + 'px;background:' +
           (verde ? 'radial-gradient(circle at 34% 30%,#b6c9ac,#7f9878)'
                  : 'radial-gradient(circle at 32% 28%,#fffdf8,#f0e3cf 58%,#d9c3a4)') + '"></i>';
    }
    b.innerHTML = h;
    b.style.transform = 'translateZ(' + altura + 'px) rotateZ(var(--giro)) rotateX(var(--tomb))';
    por(b, x, y, 112, 104, false);
    g.appendChild(b);
  }
  var nBuq = lite ? 3 : 7;
  for (var i2 = 0; i2 < nBuq; i2++){
    buque(-185, 470 + i2 * (lite ? 480 : 290), 150);
    buque(185, 470 + i2 * (lite ? 480 : 290), 150);
  }

  var gArco = grupo(0, 0, 280, 30, 'epe');
  var arco = document.createElement('div');
  arco.className = 'epe arco';
  var R = 212, PERNA = 150, CX = 280, ha = '', pontos = [];
  var passoPerna = lite ? 40 : 22;
  var passoArco = lite ? 12 : 5;
  for (var y1 = 0; y1 <= PERNA; y1 += passoPerna){ pontos.push([-R, y1]); pontos.push([R, y1]); }
  for (var a1 = 182; a1 >= -2; a1 -= passoArco){
    var rad = a1 * Math.PI / 180;
    pontos.push([Math.cos(rad) * R, PERNA + Math.sin(rad) * R]);
  }
  for (var p1 = 0; p1 < pontos.length; p1++){
    var d1 = 26 + esc(30), verde1 = p1 % 4 === 0, rosa = !verde1 && Math.random() > .55;
    ha += '<i class="flor" style="width:' + d1 + 'px;height:' + (d1 * (verde1 ? .74 : 1)) +
          'px;left:' + (CX + pontos[p1][0] - d1 / 2 + esc(16) - 8) +
          'px;bottom:' + (pontos[p1][1] - d1 / 2 + esc(16) - 8) + 'px;background:' +
          (verde1 ? 'radial-gradient(circle at 34% 30%,#bcd0b2,#7f9878)'
           : rosa ? 'radial-gradient(circle at 32% 28%,#fbe3e0,#f0c3bd 60%,#d99e97)'
                  : 'radial-gradient(circle at 32% 28%,#fffdf8,#f4e8d6 58%,#dcc6a6)') + '"></i>';
  }
  arco.innerHTML = ha;
  por(arco, 0, 0, 560, 520, false);
  gArco.appendChild(arco);

  var gNoivos = grupo(0, -70, 115, 30, 'epe');
  var nv = document.createElement('div');
  nv.className = 'epe noivos';
  nv.innerHTML = '<i class="veu"></i><i class="ele"></i><i class="ele-cab"></i><i class="ele-cabelo"></i>' +
                 '<i class="ela"></i><i class="ela-cab"></i><i class="ela-coque"></i><i class="buque-mao"></i>';
  por(nv, 0, -70, 230, 264, false);
  gNoivos.appendChild(nv);

  if (!reduz && !lite){
    var gPet = grupo(0, 450, 500, 550, 'epe');
    for (var p2 = 0; p2 < 26; p2++){
      var pt = document.createElement('div');
      pt.className = 'epe petala';
      pt.style.animationDuration = (7 + esc(7)).toFixed(2) + 's';
      pt.style.animationDelay = (-esc(12)).toFixed(2) + 's';
      por(pt, esc(1000) - 500, -100 + esc(1100), 15, 11, false);
      gPet.appendChild(pt);
    }
  }

  return pecas;
}
