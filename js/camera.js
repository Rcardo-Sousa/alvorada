/* ---------------- câmera ----------------
   uma única trajetória: o scroll interpola entre os pontos-chave abaixo.
   cx,cy = ponto observado (fica sempre no centro do quadro)
   A = giro em volta desse ponto   P = inclinação (0 = de cima, 90 = na horizontal)
   d = distância da câmera até o ponto   fy = deslocamento do enquadramento */

import { lim, faixa, suave, suave2, lerp } from './utils.js';

const CHAVES = [
  /* hold curto → desce; no fim estabiliza atrás dos noivos e respira */
  { p:.00, cx:   0, cy:  900, A:   0, P:  0, d:7200, fy:0     },
  { p:.06, cx:   0, cy:  900, A:   0, P:  0, d:7200, fy:0     },
  { p:.18, cx:   0, cy: 1000, A:   0, P: 18, d:6000, fy:0.01  },
  { p:.32, cx:   0, cy: 1400, A:   0, P: 48, d:4200, fy:0.03  },
  { p:.46, cx: 380, cy:  580, A:   0, P: 66, d:3200, fy:0.03  },
  { p:.56, cx:   0, cy:  -40, A:   0, P: 62, d:3000, fy:0.05  },
  { p:.70, cx:   0, cy:  280, A: 180, P: 46, d:5600, fy:0.06  },
  { p:.82, cx:   0, cy:  420, A: 180, P: 40, d:7000, fy:0.08  },
  { p:.90, cx:   0, cy:  460, A: 180, P: 37, d:7600, fy:0.09  }, /* estabiliza */
  { p:.96, cx:   0, cy:  480, A: 180, P: 36, d:7800, fy:0.09  }, /* respiração */
  { p:1.0, cx:   0, cy:  490, A: 180, P: 35, d:7900, fy:0.095 }  /* micro-afastar */
];

/* entrada e saída de cada legenda — cena 1 já começa visível na foto aérea */
const JANELAS = [
  [-.05, 0, .08, .14],
  [.20, .26, .34, .40],
  [.38, .44, .52, .58],
  [.56, .62, .70, .76],
  [.74, .80, .88, .94]
];

const PERSP_BASE = 1500;   // recalculado em medir() a cada altura de tela
const H_REF = 800;         // referência usada ao calibrar os pontos-chave

export function criarCamera(el, pecas, opts){
  var PERSP = PERSP_BASE, H = 800, kW = 1;
  var giroAnt = null, tombAnt = null;
  var leve = !!(opts && opts.leve);
  var pecasTick = 0;

  var cam = {
    max: 1,
    medir: medir,
    pintar: pintar
  };

  function medir(){
    cam.max = Math.max(el.trilho.offsetHeight - window.innerHeight, 1);
    H = window.innerHeight;
    // a distância focal acompanha a altura da tela, então o campo de visão
    // vertical fica igual em qualquer janela — sem isso, telas altas mostravam
    // uma fatia maior do cenário (tudo minúsculo) e a câmera ficava perto
    // demais do plano de corte (o glitch preto)
    PERSP = PERSP_BASE * (H / H_REF);
    el.camera.style.perspective = PERSP.toFixed(1) + 'px';
    // só telas estreitas precisam de ajuste: afasta um pouco a câmera para
    // não cortar as laterais do arco e das cadeiras
    kW = lim(900 / window.innerWidth, 1, 1.8);
  }

  /* p = progresso do sobrevoo (0–1); handoff = quanto o editorial já assume (0–1) */
  function pintar(p, handoff){
    var i = 0;
    while (i < CHAVES.length - 2 && p > CHAVES[i + 1].p) i++;
    var a = CHAVES[i], b = CHAVES[i + 1];
    var t = suave(lim((p - a.p) / (b.p - a.p), 0, 1));
    var h = lim(handoff || 0, 0, 1);

    var cx = lerp(a.cx, b.cx, t), cy = lerp(a.cy, b.cy, t);
    var A = lerp(a.A, b.A, t), P = lerp(a.P, b.P, t), fy = lerp(a.fy, b.fy, t);
    // distância física da câmera: só recua em telas estreitas, nunca em telas altas
    var d = lerp(a.d, b.d, t) * kW;
    var Zc = PERSP - d;

    var rA = A * Math.PI / 180, rP = P * Math.PI / 180;
    var sinA = Math.sin(rA), cosA = Math.cos(rA), sinP = Math.sin(rP), cosP = Math.cos(rP);

    el.mundo.style.transform = 'translateZ(' + Zc.toFixed(1) + 'px) rotateX(' + P.toFixed(2) +
      'deg) rotateZ(' + A.toFixed(2) + 'deg) translateX(' + (-cx).toFixed(1) +
      'px) translateY(' + (-cy).toFixed(1) + 'px)';

    // as peças em pé giram junto para nunca ficarem de perfil
    var gi = -A, ti = -P;
    if (giroAnt === null || Math.abs(gi - giroAnt) > .05){
      el.cenario.style.setProperty('--giro', gi.toFixed(2) + 'deg'); giroAnt = gi;
    }
    if (tombAnt === null || Math.abs(ti - tombAnt) > .05){
      el.cenario.style.setProperty('--tomb', ti.toFixed(2) + 'deg'); tombAnt = ti;
    }

    // chão acompanha a câmera: nunca sobra piso atrás dela para cruzar a lente
    var altura = d * cosP;
    var recuo = P < 2 ? 3200 : Math.min(altura / Math.tan(rP) * .85, 3200);
    var raio = d * sinP + recuo;
    el.chao.style.transform = 'translate3d(' + (cx + raio * sinA).toFixed(1) + 'px,' +
      (cy + raio * cosA).toFixed(1) + 'px,0) rotateZ(' + (-A).toFixed(2) + 'deg)';

    el.lente.style.transform = 'translateY(' + (fy * H).toFixed(1) + 'px)';

    // a borda inferior do quadro, em profundidade: depende do campo de visão,
    // que muda com a altura da viewport. só então dá para sumir sem aparecer.
    var corta = sinP > .35, zChao = 0, zPe = 0;
    if (corta){
      var meio = H / 2 + fy * H;
      var C = (H - meio) * sinP / (cosP * PERSP);
      zChao = (Zc + C * PERSP) / (1 + C);
      var prB = PERSP / (PERSP - zChao);
      var C2 = (H + 210 * prB * sinP - meio) * sinP / (cosP * PERSP);
      zPe = (Zc + C2 * PERSP) / (1 + C2);
    }

    for (var j = 0; j < pecas.length; j++){
      /* no celular: atualiza opacidade a cada 2 frames — menos thrash no Safari */
      if (leve && ((pecasTick + j) & 1)) continue;
      var q = pecas[j], op = 1;
      if (corta){
        // profundidade da extremidade mais distante: some só quando a peça inteira saiu
        var zq = ((q.x - cx) * sinA + (q.y - cy) * cosA) * sinP + Zc
               - (Math.abs(q.dx * sinA) + Math.abs(q.dy * cosA)) * sinP;
        op = q.alto ? lim((zPe + 300 - zq) / 300, 0, 1) : (zq > zChao + 40 ? 0 : 1);
      }
      if (op !== q.op){
        q.op = op;
        q.el.style.visibility = op <= 0 ? 'hidden' : 'visible';
        q.el.style.opacity = op >= 1 ? '' : op.toFixed(2);
      }
    }
    pecasTick++;

    /* ── dissolve foto→desenho ─────────────────────────────────────────
       Opacidades complementares (sempre algo no quadro), foto vira “desenho”
       (dessatura + clareia) antes de sumir, bruma no meio como ponte. */
    var tMix = suave2(faixa(p, .04, .32));
    var tFoto = suave2(faixa(p, .04, .36));
    var tCena = suave2(faixa(p, .05, .30));

    /* cena sobe um pouco antes; foto ainda cobre — nunca há “buraco” */
    el.wrap.style.opacity = tCena.toFixed(4);

    /* bruma em sino: pico no dissolve foto→cena; depois no handoff editorial */
    var bruma = Math.sin(Math.PI * lim(tMix, 0, 1)) * .88;
    var brumaHandoff = Math.sin(Math.PI * faixa(h, 0, .48)) * .38;
    el.bruma.style.opacity = Math.max(bruma, brumaHandoff).toFixed(4);

    if (el.raios){
      el.raios.style.opacity = (faixa(p, .22, .36) * (1 - faixa(p, .72, .88)) * .55).toFixed(3);
    }

    /* foto: quase sem zoom (só 3%) para não mentir a altura */
    var afast = suave(faixa(p, .04, .32));
    el.aerea.style.transform = 'scale(' + (1 - .03 * afast).toFixed(4) + ')';

    /* cauda bem longa: ainda dá para ver resíduos sem corte seco */
    var opFoto = Math.pow(1 - tFoto, 2.6);
    el.aerea.style.opacity = opFoto.toFixed(4);

    /* morfagem visual — blur só no desktop (no iOS derruba a aba) */
    var sat = 1 - .72 * tMix;
    var bright = 1 + .22 * tMix;
    var contrast = 1 - .12 * tMix;
    if (leve){
      el.aerea.style.filter =
        'brightness(' + bright.toFixed(3) + ') saturate(' + sat.toFixed(3) +
        ') contrast(' + contrast.toFixed(3) + ')';
    } else {
      var blurPx = 2 + 14 * suave(faixa(p, .06, .34));
      el.aerea.style.filter =
        'brightness(' + bright.toFixed(3) + ') saturate(' + sat.toFixed(3) +
        ') contrast(' + contrast.toFixed(3) + ') blur(' + blurPx.toFixed(2) + 'px)';
    }

    el.aerea.style.visibility = opFoto < .003 ? 'hidden' : 'visible';
    el.aerea.style.pointerEvents = 'none';

    /* HUD some antes da respiração final */
    el.hud.style.opacity = ((1 - faixa(p, .84, .90)) * (1 - h)).toFixed(3);
    el.altValor.textContent = Math.max(0, Math.round(altura / 32)) + ' m';
    el.rolar.style.opacity = (1 - faixa(p, .06, .12)).toFixed(3);

    /* callout: surge na estabilização e cede lugar ao editorial */
    if (el.ponte){
      var ponteOp = faixa(p, .86, .91) * (1 - faixa(p, .94, .99)) * (1 - suave2(faixa(h, 0, .22)));
      el.ponte.style.opacity = ponteOp.toFixed(3);
      el.ponte.style.transform = 'translateX(-50%) translateY(' + ((1 - ponteOp) * 22).toFixed(1) + 'px)';
      var ativa = ponteOp > .2;
      el.ponte.classList.toggle('is-ativa', ativa);
      el.ponte.setAttribute('aria-hidden', ativa ? 'false' : 'true');
    }

    for (var n = 0; n < 5; n++){
      var w = JANELAS[n];
      var o = faixa(p, w[0], w[1]) * (1 - faixa(p, w[2], w[3])) * (1 - h);
      el.cenas[n].style.opacity = o.toFixed(3);
      el.cenas[n].style.transform = 'translateX(-50%) translateY(' + ((1 - o) * 26).toFixed(1) + 'px)';
    }

    /* handoff: a cena cede profundidade sem corte — scroll controla */
    if (el.palco){
      var saida = suave2(h);
      var soft = suave2(faixa(h, 0, .55));
      el.palco.style.opacity = (1 - saida * .72).toFixed(4);
      /* blur no palco inteiro mata Safari mobile — só opacity/scale no leve */
      if (leve){
        el.palco.style.filter = 'none';
      } else {
        el.palco.style.filter = 'blur(' + (soft * 5.5).toFixed(2) + 'px)';
      }
      el.palco.style.transform = 'scale(' + (1 + soft * .028).toFixed(4) + ')';
      el.palco.style.pointerEvents = 'none';
      /* libera GPU quando o editorial assumiu */
      if (h > .92){
        el.palco.style.visibility = 'hidden';
        el.palco.style.willChange = 'auto';
      } else {
        el.palco.style.visibility = '';
      }
    }
    if (el.vinheta){
      el.vinheta.style.opacity = (suave2(faixa(h, .05, .45)) * .55).toFixed(3);
    }
  }

  return cam;
}
