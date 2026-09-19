/* preferência de tema: salva escolha e respeita o sistema */

const CHAVE = 'alvorada-tema';

function preferenciaSistema(){
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function temaAtual(){
  const salvo = document.documentElement.getAttribute('data-theme');
  if (salvo === 'light' || salvo === 'dark') return salvo;
  return preferenciaSistema();
}

export function aplicarTema(tema){
  document.documentElement.setAttribute('data-theme', tema);
  try { localStorage.setItem(CHAVE, tema); } catch (_) {}
  atualizarBotao();
}

function atualizarBotao(){
  const botao = document.querySelector('.tema-botao');
  if (!botao) return;
  const escuro = temaAtual() === 'dark';
  botao.setAttribute('aria-pressed', escuro ? 'true' : 'false');
  botao.setAttribute('aria-label', escuro ? 'Ativar modo claro' : 'Ativar modo escuro');
  botao.title = escuro ? 'Modo claro' : 'Modo escuro';
}

export function iniciarTema(){
  const botao = document.querySelector('.tema-botao');
  if (!botao) return;

  atualizarBotao();

  botao.addEventListener('click', () => {
    aplicarTema(temaAtual() === 'dark' ? 'light' : 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    try {
      if (localStorage.getItem(CHAVE)) return;
    } catch (_) {}
    document.documentElement.removeAttribute('data-theme');
    atualizarBotao();
  });
}
