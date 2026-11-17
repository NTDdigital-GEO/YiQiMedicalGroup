# YiQi Medical Group 益氣堂 — website rebuild

Static rebuild of **www.yiqimedicalgroup.com** (currently on Wix). The client asked for the improvements in the
Oct 14 2026 audit and redesign mockup, **without changing how the site looks**. So:

- **Look** = the live site: cream page, sage and terracotta accents, lime display headings on photos, Didot-style
  italics, dark-green rounded "BOOK" button, white feature card over the branch photo, tan "Unleash Your Best" band,
  sage contact-form card, the clinic's own photos. (Wix webfonts can't be reused, so Brandon Grotesque / Avenir / Didot
  are replaced by the free look-alikes Jost / Nunito Sans / Playfair Display.)
- **Content, structure and SEO** = the audit fixes from `reference/mockup.html` (EN + 中文 copy, FAQ, $60 Community Clinic
  page, clean URLs, correct phone, schema, hreflang, redirects).

## Use

```bash
npm install
npm run build     # generates ./site  (15 pages x EN + 中文 = 30 pages, sitemap, robots, llms.txt, _redirects)
npm run check     # QA: leftover draft markers, broken links/images, one H1, JSON-LD validity, meta lengths
npm run serve     # preview at http://localhost:4173
```

`./site` is plain static files. Deploy it on Netlify, Cloudflare Pages or any static host. `site/_redirects` holds
the 301s from the old Wix URLs (Netlify / Cloudflare Pages syntax).

## Where things live

| Path | What |
| --- | --- |
| `reference/mockup.html` | Source of truth for page copy (EN + 中文). Edit copy here, then rebuild. |
| `src/site.css`, `src/site.js` | Look and behaviour |
| `src/img/` | Photos and logo taken from the live site |
| `src/content/privacy.html`, `terms.html` | Legal pages (privacy text carried over from the live site) |
| `src/config.json` | Phone, email, booking URL, login URLs, map, social links, GA4 ID, form endpoint |
| `tools/build.mjs` | Generator: page metadata, layout, JSON-LD, sitemap, redirects |
| `docs/HANDOFF.md` | What changed, what the client must confirm, launch checklist |
