// Tiny static server for local preview: clean URLs (/acupuncture -> /acupuncture/index.html), 404.html, _redirects.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PORT = Number(process.env.PORT || 4173);
const BASE = (process.env.BASE_PATH || '').replace(/\/+$/, '');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const redirects = new Map();
try { for (const l of fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n')) { const p = l.trim().split(/\s+/); if (p.length >= 3 && !l.startsWith('#')) redirects.set(decodeURI(p[0]), p[1]); } } catch {}
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURI(u.pathname);
  if (BASE) { if (p !== BASE && !p.startsWith(BASE + '/')) { res.writeHead(404); return res.end('Not under ' + BASE); } p = p.slice(BASE.length) || '/'; }
  if (redirects.has(p)) { res.writeHead(301, { Location: redirects.get(p) }); return res.end(); }
  let f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  else if (!path.extname(f)) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); return res.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
