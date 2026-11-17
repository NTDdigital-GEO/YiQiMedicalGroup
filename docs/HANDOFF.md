# Handoff — YiQi site rebuild

## 1. Audit finding → where it is fixed

| # | Audit action | Fixed in this build |
| --- | --- | --- |
| 1 | Schema phone 9918 → 9818 | `MedicalBusiness` JSON-LD uses +1-650-788-9818; `npm run check` fails the build if 9918 appears anywhere |
| 2 | Book Online button, real social links, remove "AI-generated" line | "Book Online" pill in the nav on every page, mobile sticky Call / Book bar; wix.com social icons removed; stray AI line removed from Privacy |
| 3 | Title, meta, H1, hero | Titles ≤ 60 and descriptions ≤ 160 characters, set per page in `tools/build.mjs`; home H1 is "Acupuncture in San Carlos: five licensed TCM doctors, PPO accepted"; "Holistic Wellness / Journey" removed |
| 4 | Duplicate pages, clean slugs | New URLs below; 301s in `site/_redirects` (EN and `/zh/…`) |
| 6 | FAQ, schema, llms.txt | `/faq` (11 Q&As) with FAQPage JSON-LD; LocalBusiness with geo, hasMap, priceRange, languages; Service, ItemList (doctors) and BreadcrumbList JSON-LD; `llms.txt` now describes the clinic |
| 7 | $60 Community Clinic page | `/community-clinic` (Mon everyone, Thu 65+), plus the home feature card and slide |
| 8 | Tui Na, Fertility, Acu-Facial pages | Rebuilt with price, practitioner and one CTA; condition list trimmed; unsourced "20–30%" fertility statistic removed |
| 9 | Reviews on site | 5.0★ in the trust strip and three verbatim Google quotes (see open item 1) |
| 11 | hreflang | `en-US`, `zh-Hant`, `x-default` on every page and in `sitemap.xml` (the old site declared Chinese as `de-cn`) |

Off-site audit items (5 keyword map, 10 Google Business Profile / directories, review-request workflow) are not part of this repo.

### URL map

`/` · `/services` · `/acupuncture` · `/community-clinic` · `/fertility-acupuncture` · `/tui-na-massage` · `/acu-facial` ·
`/dietetics` · `/zi-wu-liu-zhu` · `/tai-chi` · `/our-team` · `/faq` · `/contact` · `/privacy` · `/terms` — and the same under `/zh/`.

## 2. What deliberately did not change (the look)

Header with vertical 益氣堂 + logo, "San Carlos, California" italic tagline, caps nav, language box, Patient / Staff Login
pills; full-width photo slider; white card over the branch photo; tan "Embrace Traditional Chinese Medicine… Unleash Your Best"
band over the hands-heart photo; "VISIT US" with logo, address and sage form card; footer with phone, address and email.

Small intentional differences: free fonts instead of the Wix fonts; a few text colors (lime heading on white, sage nav text) are
darkened slightly so they stay readable; the "Treatable Conditions" wall of text, the "Senior Clinic" label and the
`/general-clean` "OUTREACH" nav item are replaced by the content the mockup specifies.

## 3. Client must confirm before launch

1. **Google rating**: the trust strip says "★ 5.0 Google reviews" with no count. Re-check the live Google rating before going live.
2. **Condition claims removed** (erectile dysfunction, Parkinson's, stroke rehab, long COVID, RA, etc.) until the clinic and legal sign off.
3. **Fertility and Acu-Facial**: shown as "price confirmed at booking" and "confirmed at consultation". Add real pricing when known.
4. **Regular (non-community) clinic hours**: not published anywhere. Pages say "book online for current availability". Add hours in the copy and `openingHoursSpecification`.
5. **Credentials**: Sifu Amy (Tui Na) license; Dr. Ronkos' NCCAOM® status (page shows "DTCM, L.Ac." only).
6. **Founding story**: live site says Dr. Wang interned in Taichung, brand file says Hanoi. The build leaves it out.
7. **Social links**: `social` in `src/config.json` is empty, so the footer shows none. Add the real Facebook / Instagram URLs.
8. **Patient Login / Staff Login** still point to `spark-3026.tailb63399.ts.net/...` exactly as on the live site. Confirm that is the intended permanent address.
9. **Terms of Use** is a generic draft and needs legal review. Privacy and Terms are English-only on the `/zh/` pages (with a Chinese note).
10. **Five Elements Tea** (sold or only taught?) and upcoming community events are not shown.
11. `/appointments` and `/giftcards` (not reviewed in the audit) have no redirect. Decide keep or retire.

## 4. Technical set-up still needed

- **Contact forms** open the visitor's email app (`mailto:` with a prefilled message) because there is no backend yet.
  Set `formEndpoint` in `src/config.json` (Formspree, Getform, a Cloudflare Worker…) to post directly.
- **Analytics**: set `ga4Id` in `src/config.json`. Google Analytics loads only after a visitor clicks Accept in the cookie banner; "Cookie Settings" in the footer reopens it (the Privacy Policy promises both).
- **Map** uses the keyless Google Maps embed for 555 Old County Rd.
- **Cut-over**: deploy `site/`, point the domain, keep `_redirects` live, then submit `sitemap.xml` in Search Console. Check PageSpeed on the new pages.

## 5. GitHub Pages

`.github/workflows/pages.yml` builds, runs `npm run check` and publishes `site/` on every push to `main`.

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. **Custom domain** (www.yiqimedicalgroup.com): set the domain under Settings → Pages, add the DNS CNAME, leave the variable below unset.
3. **Preview at `https://<user>.github.io/<repo>/`**: add a repository variable (Settings → Secrets and variables → Actions → Variables) named `PAGES_BASE_PATH` with the value `/<repo>`. That build prefixes all internal links and is marked `noindex`; canonical URLs still point at the real domain.
4. Local test of a prefixed build: `BASE_PATH=/<repo> npm run build && BASE_PATH=/<repo> npm run serve`, then open `http://localhost:4173/<repo>/`. Run a plain `npm run build` afterwards before committing `site/`.

GitHub Pages ignores `site/_redirects`, so old Wix URLs will not 301 there. For the real cut-over use Cloudflare Pages or Netlify.
