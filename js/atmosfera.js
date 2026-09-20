/* fundo vivo + luz com rastro no conteúdo editorial */

import { reduz, leve } from './device.js';

export function iniciarAtmosfera(){
  const main = document.getElementById('conteudo');
  if (!main) return;

  const fino = window.matchMedia('(pointer: fine)').matches;

  /* no celular, orbes com blur matam a GPU — pula */
  if (!reduz && !leve) main.classList.add('com-fundo-vivo');

  if (reduz || !fino || leve) return;

  const canvas = document.getElementById('luzRastro');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const rastro = [];
  let mx = -999, my = -999, lx = -999, ly = -999;
  let largura = 0, altura = 0;
  let noSite = false;
  let agendado = false;

  function medir(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = Math.floor(largura * dpr);
    canvas.height = Math.floor(altura * dpr);
    canvas.style.width = largura + 'px';
    canvas.style.height = altura + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cor(nome, alpha){
    const bruto = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    if (!bruto) return `rgba(192,154,62,${alpha})`;
    if (bruto.startsWith('#')){
      const h = bruto.length === 4
        ? '#' + [...bruto.slice(1)].map((c) => c + c).join('')
        : bruto;
      const n = parseInt(h.slice(1), 16);
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (bruto.startsWith('rgb')){
      return bruto.replace(/rgba?\(([^)]+)\)/, (_, miolo) => {
        const p = miolo.split(',').map((s) => s.trim());
        return `rgba(${p[0]},${p[1]},${p[2]},${alpha})`;
      });
    }
    return bruto;
  }

  function dentroDoSite(){
    const caixa = main.getBoundingClientRect();
    return caixa.top < altura * .92 && caixa.bottom > 80;
  }

  function pointer(e){
    if (!noSite) return;
    mx = e.clientX;
    my = e.clientY;
    const caixa = main.getBoundingClientRect();
    if (my < caixa.top || my > caixa.bottom) return;

    const ultimo = rastro[rastro.length - 1];
    if (!ultimo || Math.hypot(mx - ultimo.x, my - ultimo.y) > 10){
      rastro.push({ x: mx, y: my, vida: 1, raio: 28 + Math.random() * 36 });
      if (rastro.length > 28) rastro.shift();
    }
  }

  function forca(){
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--luz-forca'));
    return Number.isFinite(v) ? v : 1;
  }

  function pintar(){
    noSite = dentroDoSite();
    canvas.style.opacity = noSite ? '1' : '0';

    if (lx < 0){ lx = mx; ly = my; }
    else {
      lx += (mx - lx) * .18;
      ly += (my - ly) * .18;
    }

    ctx.clearRect(0, 0, largura, altura);

    if (noSite && mx > -100){
      const k = forca();
      for (let i = 0; i < rastro.length; i++){
        const p = rastro[i];
        p.vida -= .02;
        if (p.vida <= 0) continue;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.raio * 1.15);
        g.addColorStop(0, cor('--luz-rastro', Math.min(.42, .28 * p.vida * k)));
        g.addColorStop(.4, cor('--luz-rastro', Math.min(.2, .12 * p.vida * k)));
        g.addColorStop(1, cor('--luz-rastro', 0));
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.raio * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
      while (rastro.length && rastro[0].vida <= 0) rastro.shift();

      const foco = ctx.createRadialGradient(lx, ly, 0, lx, ly, 160);
      foco.addColorStop(0, cor('--luz-mouse', Math.min(.55, .42 * k)));
      foco.addColorStop(.3, cor('--luz-mouse', Math.min(.28, .2 * k)));
      foco.addColorStop(.65, cor('--luz-mouse', Math.min(.12, .08 * k)));
      foco.addColorStop(1, cor('--luz-mouse', 0));
      ctx.beginPath();
      ctx.fillStyle = foco;
      ctx.arc(lx, ly, 160, 0, Math.PI * 2);
      ctx.fill();

      const nucleo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 22);
      nucleo.addColorStop(0, cor('--luz-nucleo', Math.min(.7, .5 * k)));
      nucleo.addColorStop(1, cor('--luz-nucleo', 0));
      ctx.beginPath();
      ctx.fillStyle = nucleo;
      ctx.arc(lx, ly, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(pintar);
  }

  medir();
  window.addEventListener('resize', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { agendado = false; medir(); });
  });
  window.addEventListener('pointermove', pointer, { passive: true });
  main.addEventListener('pointerleave', () => {
    mx = -999; my = -999;
  });

  canvas.classList.add('luz-rastro-ativa');
  requestAnimationFrame(pintar);
}
