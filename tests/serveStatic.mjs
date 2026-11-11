import http from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../out/', import.meta.url));
const prefix = '/CobbleToolkit';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.md': 'text/plain' };
// Fail immediately rather than quietly serving a missing production export.
await stat(path.join(root, 'index.html'));
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
      res.writeHead(404).end('Not found');
      return;
    }
    const relative = pathname.slice(prefix.length).replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    if (path.relative(root, target).startsWith('..')) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    for (const candidate of [target, `${target}.html`, path.join(target, 'index.html')]) {
      try {
        if (!(await stat(candidate)).isFile()) continue;
        const body = await readFile(candidate);
        res.writeHead(200, { 'Content-Type': types[path.extname(candidate)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      } catch (error) {
        if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
      }
    }
    res.writeHead(404).end('Not found');
  } catch {
    res.writeHead(400).end('Bad request');
  }
});
server.listen(4173, () => console.log('Production export: http://localhost:4173/CobbleToolkit/'));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeAllConnections();
    setTimeout(() => process.exit(1), 2000).unref();
  });
}
