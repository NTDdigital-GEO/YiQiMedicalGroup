// Post-build QA: leftover draft markers, broken internal links/images, H1 count, JSON-LD validity, title/meta length.
// Run:  npm run check   (after npm run build)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') && files.push(p); } })(OUT);

const redirects = new Set(fs.readFileSync(path.join(OUT, '_redirects'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => decodeURI(l.split(/\s+/)[0])));
const exists = (u) => {
  let p = decodeURI(u.split('#')[0].split('?')[0]);
  if (!p) return true;
  if (redirects.has(p)) return true;
  const f = path.join(OUT, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return true;
  return fs.existsSync(path.join(f, 'index.html'));
};
const BAD = /\bTBC\b|待確認|待核對|Audit #|mockup|Mockup|Photo:|照片：|client to confirm|Pricing TBC|holistic|journey|janeapp/i;
let problems = 0;
const warn = (f, msg) => { problems++; console.log(`✗ ${path.relative(OUT, f)}: ${msg}`); };

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(html);
  const text = $('main').text();
  const m = text.match(BAD); if (m) warn(f, `leftover marker "${m[0]}"`);
  const h1 = $('h1').length; if (h1 !== 1) warn(f, `${h1} <h1> elements`);
  const title = $('title').text(), desc = $('meta[name=description]').attr('content') || '';
  if (!title) warn(f, 'missing <title>');
  if (!desc) warn(f, 'missing meta description');
  if (title.length > 62) warn(f, `title ${title.length} chars`);
  if (desc.length > 165) warn(f, `description ${desc.length} chars`);
  $('script[type="application/ld+json"]').each((_, s) => { try { JSON.parse($(s).text()); } catch (e) { warn(f, 'invalid JSON-LD'); } });
  $('a[href^="/"], img[src^="/"], link[href^="/"], script[src^="/"]').each((_, el) => {
    const u = $(el).attr('href') || $(el).attr('src');
    if (u.startsWith('//')) return;
    if (!exists(u)) warn(f, `broken ${el.tagName} → ${u}`);
  });
  $('img').each((_, el) => { if ($(el).attr('alt') === undefined) warn(f, `img without alt: ${$(el).attr('src')}`); });
  const ids = new Set(); $('[id]').each((_, el) => { const i = $(el).attr('id'); if (ids.has(i)) warn(f, `duplicate id "${i}"`); ids.add(i); });
  $('a[href*="#"]').each((_, el) => {
    const h = $(el).attr('href'); if (!h.startsWith('#')) return;
    if (h.length > 1 && !ids.has(h.slice(1))) warn(f, `dead anchor ${h}`);
  });
  if (/\+1-650-788-9918|650-788-9918/.test(html)) warn(f, 'wrong phone number 9918');
}
console.log(problems ? `\n${problems} problem(s) in ${files.length} pages` : `✓ ${files.length} pages clean`);
process.exit(problems ? 1 : 0);
