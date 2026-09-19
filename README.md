# Alvorada

Prévia de conceito para a Alvorada Cerimonial: um sobrevoo de drone em CSS 3D, seguido do conteúdo editorial do site.

## Estrutura

```
.
├── index.html          # página principal
├── server.js           # servidor estático local
├── package.json
├── assets/images/      # fotografias do site
├── css/                # estilos (tokens, cena 3D, editorial)
├── js/                 # módulos ES (câmera, narrativa, tema…)
└── docs/               # PRODUCT.md · DESIGN.md
```

## Como rodar

Node.js 20.11 ou mais recente. Não há pacotes para instalar.

```bash
npm start
```

Abra [http://localhost:5173](http://localhost:5173).

Outra porta:

```bash
PORT=3000 npm start
```

O servidor só entrega arquivos estáticos — os módulos ES não carregam via `file://`.

## Documentação

- Produto: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- Design: [`docs/DESIGN.md`](docs/DESIGN.md)
