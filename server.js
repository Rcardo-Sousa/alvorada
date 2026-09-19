/* servidor estático sem dependências: `npm start` */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname);
const PORTA = Number(process.env.PORT) || 5173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

createServer(async (req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  // normalize + prefixo garante que ../ não escape da pasta do projeto
  const arquivo = join(RAIZ, normalize(caminho).replace(/^(\.\.[/\\])+/, ''));
  const alvo = arquivo.startsWith(RAIZ) ? arquivo : RAIZ;

  try {
    const info = await stat(alvo);
    const final = info.isDirectory() ? join(alvo, 'index.html') : alvo;
    await stat(final);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(final).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    createReadStream(final).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — não encontrado');
  }
}).listen(PORTA, () => {
  console.log(`Alvorada rodando em http://localhost:${PORTA}`);
});
