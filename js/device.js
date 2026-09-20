/* detecção de dispositivo — modo leve no celular para não estourar Safari */

export const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Telas estreitas / toque: cena 3D enxuta, sem blur por frame. */
export const leve = (() => {
  if (reduz) return true;
  const estreito = window.matchMedia('(max-width: 900px)').matches;
  const toque = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const memoriaBaixa = typeof navigator !== 'undefined'
    && navigator.deviceMemory
    && navigator.deviceMemory <= 4;
  return estreito || toque || !!memoriaBaixa;
})();

export const estreito = window.innerWidth < 760 || leve;
