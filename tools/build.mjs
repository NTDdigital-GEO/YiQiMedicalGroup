// Static-site generator for yiqimedicalgroup.com
// Source of truth for copy: reference/mockup.html (the Oct 14 2026 redesign mockup, EN + 中文).
// The mockup's *content* and audit fixes are kept; the *look* is the live Wix site's (src/site.css).
// Run:  npm install && npm run build   ->  ./site

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'site');
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/config.json'), 'utf8'));
const MOCK = fs.readFileSync(path.join(ROOT, 'reference/mockup.html'), 'utf8');
const LANGS = ['en', 'zh'];
const SITE = CFG.siteUrl.replace(/\/$/, '');
const BUILD_DATE = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ pages */
// slug '' = home. meta = proposed titles/descriptions from the mockup's handoff table (section 3).
const PAGES = [
  { id: 'home', slug: '', parent: null,
    t: { en: 'Acupuncture in San Carlos, CA | YiQi Medical Group 益氣堂', zh: '聖卡洛斯針灸｜益氣堂 YiQi Medical Group' },
    d: { en: 'Five licensed TCM doctors in San Carlos. PPO accepted. Try acupuncture at our $60 community clinic, no package. Book online or call 650-788-9818.', zh: '聖卡洛斯五位持照中醫師，接受 PPO 保險。$60 社區門診可無負擔體驗針灸，不需療程包。線上預約或來電 650-788-9818。' } },
  { id: 'services', slug: 'services', parent: 'home', banner: 'fabric.jpg', bannerPos: '50% 50%',
    t: { en: 'Services and Prices | YiQi Medical Group San Carlos', zh: '服務項目與價格｜聖卡洛斯益氣堂' },
    d: { en: 'Acupuncture, fertility support, Tui Na and Acu-Facial in San Carlos, with prices. $60 community clinic, $150 private acupuncture. PPO accepted.', zh: '聖卡洛斯益氣堂的針灸、生育調理、推拿與針灸美顏，附價格。$60 社區門診、$150 私人針灸，接受 PPO。' } },
  { id: 'acupuncture', slug: 'acupuncture', parent: 'services', banner: 'page-acupuncture.jpg', bannerPos: '50% 40%',
    t: { en: 'Acupuncture in San Carlos, CA | YiQi Medical Group', zh: '聖卡洛斯針灸｜益氣堂 YiQi Medical Group' },
    d: { en: 'Private acupuncture with a licensed TCM doctor in San Carlos. $150 per session, PPO accepted, benefits verified first. Book online.', zh: '聖卡洛斯持照中醫師一對一針灸，每次 $150，接受 PPO，就診前先核對保險給付。線上預約。' } },
  { id: 'community', slug: 'community-clinic', parent: 'home', banner: 'page-community.jpg', bannerPos: '50% 35%',
    t: { en: '$60 Community Acupuncture in San Carlos | YiQi', zh: '$60 社區針灸｜聖卡洛斯益氣堂' },
    d: { en: 'Acupuncture for $60: Mondays 3–6 pm (everyone) and Thursdays 10 am–6 pm (seniors 65+). No package, pay per visit. Book at YiQi in San Carlos.', zh: '$60 針灸：週一下午 3–6 點（所有民眾）、週四上午 10 點至下午 6 點（65 歲以上）。不需療程包，單次付費。' } },
  { id: 'fertility', slug: 'fertility-acupuncture', parent: 'services', banner: 'svc-fertility.jpg', bannerPos: '50% 55%',
    t: { en: 'Fertility Acupuncture in San Carlos | YiQi Medical', zh: '聖卡洛斯生育針灸｜益氣堂' },
    d: { en: 'Fertility acupuncture and TCM support in San Carlos, alone or alongside IUI/IVF. Licensed doctors. PPO accepted. Book a consult.', zh: '聖卡洛斯生育針灸與中醫調理，可單獨進行或配合 IUI／IVF。持照醫師，接受 PPO。預約諮詢。' } },
  { id: 'tuina', slug: 'tui-na-massage', parent: 'services', banner: 'page-tui-na.jpg', bannerPos: '50% 45%',
    t: { en: 'Tui Na Massage in San Carlos | YiQi Medical Group', zh: '聖卡洛斯推拿｜益氣堂 YiQi Medical Group' },
    d: { en: '60-minute Tui Na with acupressure and hot stone: $120, or 5 sessions for $500. No needles. Insurance can be used. Book in San Carlos.', zh: '60 分鐘推拿，含穴位按壓與熱石：$120，或 5 次 $500。不用針，可使用保險。歡迎預約。' } },
  { id: 'acufacial', slug: 'acu-facial', parent: 'services', banner: 'page-acu-facial.jpg', bannerPos: '50% 35%',
    t: { en: 'Acu-Facial Acupuncture in San Carlos | YiQi', zh: '聖卡洛斯針灸美顏｜益氣堂' },
    d: { en: 'Facial and body acupuncture for your skin, from licensed TCM doctors. An alternative to Botox and filler. Book at YiQi in San Carlos.', zh: '持照中醫師的臉部與身體針灸調理肌膚，是肉毒桿菌與填充劑之外的選擇。歡迎預約。' } },
  { id: 'dietetics', slug: 'dietetics', parent: 'home', banner: 'dietetics.jpg', bannerPos: '50% 50%',
    t: { en: 'TCM Dietetics & Five Elements Tea | YiQi Medical', zh: '中醫食療與五行養生茶｜益氣堂' },
    d: { en: 'Eat well, live well, age well: TCM food guidance, Five Elements Tea and body-clock eating from YiQi Medical Group in San Carlos.', zh: '吃得好、活得好、老得好：益氣堂提供中醫飲食指導、五行養生茶與子午流注飲食。' } },
  { id: 'zwlz', slug: 'zi-wu-liu-zhu', parent: 'dietetics', banner: 'zi-wu-liu-zhu.jpg', bannerPos: '50% 50%', custom: true,
    t: { en: 'Zi Wu Liu Zhu 子午流注: TCM Body Clock | YiQi', zh: '子午流注：中醫養生時鐘｜益氣堂' },
    d: { en: 'Follow the TCM body clock: what to eat and do in each two-hour period, plus the five-element guide. From YiQi Medical Group in San Carlos.', zh: '依子午流注的十二時辰，了解各時段適合的飲食與作息，並附五行對照。益氣堂中醫診所，聖卡洛斯。' } },
  { id: 'taichi', slug: 'tai-chi', parent: 'home', banner: 'taichi-class.jpg', bannerPos: '50% 55%',
    t: { en: 'Medical Tai-Chi with Sifu Donna | YiQi Medical', zh: 'Sifu Donna 醫療太極｜益氣堂' },
    d: { en: 'Medical Tai-Chi taught by Sifu Donna, an international gold medalist, in the Bay Area. Offered through YiQi Medical Group in San Carlos.', zh: '國際金牌得主 Sifu Donna 在灣區教授醫療太極，與聖卡洛斯益氣堂合作。' } },
  { id: 'team', slug: 'our-team', parent: 'home', banner: 'senior-branch.jpg', bannerPos: '50% 40%',
    t: { en: 'Our Doctors | YiQi Medical Group San Carlos', zh: '醫師團隊｜聖卡洛斯益氣堂' },
    d: { en: 'Meet five licensed TCM doctors in San Carlos: pain, fertility, neurology, sports injury and more. Book with the right doctor for you.', zh: '認識益氣堂五位持照中醫師：疼痛、生育、神經、運動傷害等專長。選擇適合您的醫師預約。' } },
  { id: 'faq', slug: 'faq', parent: 'home', banner: 'fabric.jpg', bannerPos: '50% 30%',
    t: { en: 'FAQ: Cost, Insurance, First Visit | YiQi Medical', zh: '常見問題：費用、保險、初診｜益氣堂' },
    d: { en: 'Answers on acupuncture cost, PPO insurance, the $60 community clinic, your first visit and fertility support at YiQi in San Carlos.', zh: '針灸費用、PPO 保險、$60 社區門診、初診流程與生育調理的常見問題解答。' } },
  { id: 'contact', slug: 'contact', parent: 'home', banner: 'hero-leaves.jpg', bannerPos: '50% 40%',
    t: { en: 'Contact & Book | YiQi Medical Group San Carlos', zh: '聯絡與預約｜聖卡洛斯益氣堂' },
    d: { en: 'Book online or call 650-788-9818. YiQi Medical Group, 555 Old County Road, Suite 100, San Carlos, CA 94070.', zh: '線上預約或來電 650-788-9818。益氣堂，555 Old County Road, Suite 100, San Carlos, CA 94070。' } },
  { id: 'privacy', slug: 'privacy', parent: 'home', custom: true,
    t: { en: 'Privacy Policy | YiQi Medical Group', zh: '隱私權政策｜益氣堂' },
    d: { en: 'How YiQi Medical Group in San Carlos handles your personal information, including HIPAA, CCPA/CPRA and cookie practices.', zh: '益氣堂如何處理您的個人資料，包括 HIPAA、CCPA/CPRA 與 Cookie 的做法。' } },
  { id: 'terms', slug: 'terms', parent: 'home', custom: true,
    t: { en: 'Terms of Use | YiQi Medical Group', zh: '使用條款｜益氣堂' },
    d: { en: 'Terms of use for the YiQi Medical Group website in San Carlos, CA.', zh: '益氣堂網站使用條款。' } },
];
const BY_ID = Object.fromEntries(PAGES.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ UI strings */
const UI = {
  en: {
    skip: 'Skip to content', brandText: 'YiQi Medical Group · San Carlos, CA', tagline: 'San Carlos, California',
    menu: 'Menu', bookOnline: 'Book Online', callNow: 'Call', patientLogin: 'Patient Login', staffLogin: 'Staff Login',
    nav: { home: 'Home', services: 'Services', community: '$60 Community Clinic', dietetics: 'Dietetics', taichi: 'Tai-Chi', team: 'Our Team', faq: 'FAQ', contact: 'Contact' },
    svcMenu: { services: 'All services', acupuncture: 'Acupuncture', fertility: 'Fertility', tuina: 'Tui Na Massage', acufacial: 'Acu-Facial' },
    dietMenu: { dietetics: 'Dietetics', tea: 'Five Elements Tea', zwlz: 'Zi Wu Liu Zhu 子午流注' },
    footer: { services: 'Services', learn: 'Learn', follow: 'Follow', legal: 'Legal', privacy: 'Privacy Policy', terms: 'Terms of Use', cookie: 'Cookie Settings', note: 'Acupuncture is not a substitute for emergency or physician care.' },
    cookie: { text: 'We use essential cookies, and analytics cookies only if you allow them. See our Privacy Policy.', accept: 'Accept', decline: 'Decline' },
    crumbHome: 'Home', formMsg: 'Status', slides: { prev: 'Previous slide', next: 'Next slide', go: 'Go to slide' },
    breadcrumbLabel: 'Breadcrumb', mapTitle: 'Map: YiQi Medical Group, 555 Old County Rd, San Carlos', hero: 'Featured',
  },
  zh: {
    skip: '跳到主要內容', brandText: '益氣堂 · 加州聖卡洛斯', tagline: '加州聖卡洛斯',
    menu: '選單', bookOnline: '線上預約', callNow: '來電', patientLogin: '病患登入', staffLogin: '員工登入',
    nav: { home: '首頁', services: '服務項目', community: '$60 社區門診', dietetics: '食療', taichi: '太極', team: '醫師團隊', faq: '常見問題', contact: '聯絡我們' },
    svcMenu: { services: '全部服務', acupuncture: '針灸', fertility: '生育調理', tuina: '推拿', acufacial: '針灸美顏' },
    dietMenu: { dietetics: '中醫食療', tea: '五行養生茶', zwlz: '子午流注' },
    footer: { services: '服務', learn: '了解更多', follow: '追蹤我們', legal: '法律資訊', privacy: '隱私權政策', terms: '使用條款', cookie: 'Cookie 設定', note: '針灸不能取代急救或醫師照護。' },
    cookie: { text: '我們使用必要的 Cookie；僅在您同意後才使用分析 Cookie。詳見隱私權政策。', accept: '接受', decline: '拒絕' },
    crumbHome: '首頁', formMsg: '狀態', slides: { prev: '上一張', next: '下一張', go: '前往第幾張' },
    breadcrumbLabel: '導覽路徑', mapTitle: '地圖：益氣堂，555 Old County Rd, San Carlos', hero: '精選',
  },
};

/* ------------------------------------------------------------------ helpers */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (html) => cheerio.load(`<div>${html}</div>`)('div').text().replace(/\s+/g, ' ').trim();
const urlPath = (id, lang) => {
  const slug = BY_ID[id].slug;
  if (lang === 'zh') return slug ? `/zh/${slug}` : '/zh/';
  return slug ? `/${slug}` : '/';
};
const absUrl = (id, lang) => SITE + urlPath(id, lang);
const IMG = (f) => `/assets/img/${f}`;

function imgSize(file) {
  const buf = fs.readFileSync(path.join(OUT, 'assets/img', file));
  if (buf[0] === 0x89 && buf[1] === 0x50) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return [1200, 800];
}
function imgTag(file, alt, { cls = '', lazy = true, sizes = '' } = {}) {
  const [w, h] = imgSize(file);
  return `<img src="${IMG(file)}" alt="${esc(alt)}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ''}${sizes ? ` sizes="${sizes}"` : ''}>`;
}

/* ------------------------------------------------------------------ mockup -> clean single-language page body */
const T = (en, zh, lang) => (lang === 'zh' ? zh : en);

function loadMockPage(id, lang) {
  const $ = cheerio.load(MOCK, { decodeEntities: false });
  const sec = $(`#p-${id}`);
  sec.find('.flag').remove();
  sec.find(lang === 'en' ? '.zh' : '.en').remove();
  sec.find('.en, .zh').each((_, el) => { $(el).replaceWith($(el).contents()); });
  sec.find('select option[data-t-en]').each((_, o) => { $(o).text($(o).attr(`data-t-${lang}`)); $(o).removeAttr('data-t-en').removeAttr('data-t-zh').attr('value', $(o).text()); });

  /* --- draft "TBC" markers from the mockup: swap for client-safe wording or drop, never publish a TBC tag --- */
  const CONFIRM = T('Confirmed at booking', '預約時確認', lang);
  const VERIFIED = T('Verified before your visit', '就診前核對', lang);
  sec.find('.tbc').each((_, el) => {
    const e = $(el); const txt = e.text().trim(); const par = e.parent();
    if (/Pricing TBC|價格待確認/.test(txt)) { e.replaceWith(`<span class="muted">${T('Pricing confirmed at booking', '價格於預約時確認', lang)}</span>`); return; }
    if (par.is('td')) {
      const col = par.index();
      const hdr = par.closest('table').find('tr').first().children().eq(col).text();
      e.replaceWith(/Insurance|保險/.test(hdr) ? VERIFIED : CONFIRM); return;
    }
    if (/Program structure and pricing|方案架構與價格/.test(txt)) { par.text(T('Program structure and pricing are confirmed at your consultation.', '方案架構與價格將於諮詢時確認。', lang)); return; }
    if (/Price, session length|價格、單次時長/.test(txt)) { par.text(T('Price, session length and the recommended series are confirmed at your consultation.', '價格、單次時長與建議療程數，將於諮詢時確認。', lang)); return; }
    if (/Event listings|活動列表/.test(txt)) { par.prev('h3').remove(); par.remove(); return; }
    if (par.is('p,li') && par.text().trim() === txt) { par.remove(); return; }
    e.remove();
  });
  // Remaining bare "TBC" lines
  sec.find('p').each((_, p) => {
    const html = $(p).html() || '';
    if (/Regular clinic hours|一般門診時間|Regular hours|一般門診時間：/.test(html) && !$(p).find('.tbc').length) {
      if (id === 'home') $(p).html(T('Community clinic: Mon 3–6 pm, Thu 10 am–6 pm (seniors 65+)<br>Private visits: book online for current availability, or call.', '社區門診：週一 3–6 pm；週四 10 am–6 pm（65 歲以上）<br>私人門診：請線上預約查看目前時段，或來電詢問。', lang));
      if (id === 'contact') $(p).html(T('Private visit times: see online booking for current availability, or call 650-788-9818.', '私人門診時段：請於線上預約查看目前可預約時間，或來電 650-788-9818。', lang));
    }
  });
  sec.find('.trust b').each((_, b) => { $(b).html($(b).html().replace(/★ 5\.0/, '<span class="stars">★</span> 5.0')); });
  sec.find('.trust div').each((_, d) => {
    const h = $(d).html();
    $(d).html(h.replace(/Google reviews \(15 as of May 2026\)/, 'Google reviews').replace(/Google 評論（2026 年 5 月為 15 則）/, 'Google 評論'));
  });

  /* internal links */
  const idForHash = { home: 'home', services: 'services', acupuncture: 'acupuncture', community: 'community', fertility: 'fertility', tuina: 'tuina', acufacial: 'acufacial', dietetics: 'dietetics', taichi: 'taichi', team: 'team', faq: 'faq', contact: 'contact', privacy: 'privacy' };
  sec.find('a[href^="#"]').each((_, a) => { const h = $(a).attr('href').slice(1); if (idForHash[h]) $(a).attr('href', urlPath(idForHash[h], lang)); });
  sec.find('a[target="_blank"]').each((_, a) => { $(a).attr('rel', 'noopener'); });
  sec.find('a[href="https://yiqi.janeapp.com/"]').each((_, a) => { $(a).attr('href', CFG.bookingUrl); });
  return { $, sec };
}

function swapPhotos($, sec, id, lang) {
  const P = { wang: ['dr-wang.jpg', 'Dr. Amy Wang'], yen: ['dr-yen.jpg', 'Professor Kevin Yen'], chen: ['dr-chen.jpg', 'Dr. Kate Chen'], thin: ['dr-thin.jpg', 'Dr. Phyu Phyu Thin'], ronkos: ['dr-ronkos.jpg', 'Dr. Miles Ronkos'] };
  const order = ['wang', 'yen', 'chen', 'thin', 'ronkos'];
  sec.find('.mini .ph').each((i, el) => { const [f, a] = P[order[i]]; $(el).replaceWith(imgTag(f, a)); });
  const docs = sec.find('.doc'); docs.each((i, d) => { const [f, a] = P[order[i]]; $(d).attr('id', order[i]); $(d).find('.ph').replaceWith(imgTag(f, `${a}, YiQi Medical Group`)); });
  const generic = {
    acupuncture: [['page-acupuncture.jpg', T('Acupuncture needles placed along the back during a treatment', '治療中沿背部留置的針灸針', lang)]],
    tuina: [['svc-tui-na.jpg', T('Tui Na massage session', '推拿療程', lang)]],
    acufacial: [['svc-acu-facial.jpg', T('Acu-Facial session with facial acupuncture', '針灸美顏療程', lang)]],
    taichi: [['taichi-class.jpg', T('Medical Tai-Chi class practicing outdoors', '戶外練習的醫療太極課', lang)]],
    team: [['taichi-silhouette.jpg', T('A Tai-Chi practitioner in a quiet park', '公園中練習太極的人影', lang)]],
  };
  const list = generic[id] || [];
  sec.find('.ph').each((i, el) => {
    if ($(el).hasClass('mapph')) { $(el).replaceWith(`<iframe class="map" title="${esc(UI[lang].mapTitle)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${CFG.mapEmbed}"></iframe>`); return; }
    const g = list.shift(); if (g) $(el).replaceWith(`<figure class="photo">${imgTag(g[0], g[1])}</figure>`); else $(el).remove();
  });
}

function wireForms($, sec, lang, prefix) {
  sec.find('form.f').each((fi, f) => {
    const F = $(f); F.removeAttr('onsubmit').attr('data-form', '').attr('novalidate', null);
    const fields = [['input', 'name', 'name', 'text', 'name'], ['input', 'contact', 'contact', 'text', 'off'], ['select', 'interest', 'interest', null, 'off'], ['textarea', 'message', 'message', null, 'off']];
    F.children('div').each((i, d) => {
      const f2 = fields[i]; if (!f2) return;
      const idv = `${prefix}-${f2[2]}`;
      $(d).find('label').attr('for', idv);
      const ctl = $(d).find(f2[0]).first();
      ctl.attr('id', idv).attr('name', f2[1]);
      if (f2[0] === 'input') ctl.attr('autocomplete', f2[1] === 'name' ? 'name' : 'email tel').attr('required', '');
      if (f2[0] === 'select') ctl.attr('required', '');
    });
    F.find('button[type="submit"]').before('<div class="hp" aria-hidden="true"><label>Leave blank<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>');
    F.append('<div class="form-msg" role="status" aria-live="polite"></div>');
  });
}

/* ------------------------------------------------------------------ shared chrome */
function header(lang, curId) {
  const u = UI[lang], other = lang === 'en' ? 'zh' : 'en';
  const cur = (id) => (curId === id ? ' aria-current="page"' : '');
  const svc = ['services', 'acupuncture', 'fertility', 'tuina', 'acufacial'];
  const diet = ['dietetics', 'zwlz'];
  const svcMenu = svc.map((k) => `<a href="${urlPath(k, lang)}"${cur(k)}>${u.svcMenu[k]}</a>`).join('');
  const dietMenu = `<a href="${urlPath('dietetics', lang)}"${cur('dietetics')}>${u.dietMenu.dietetics}</a><a href="${urlPath('dietetics', lang)}#five-elements-tea">${u.dietMenu.tea}</a><a href="${urlPath('zwlz', lang)}"${cur('zwlz')}>${u.dietMenu.zwlz}</a>`;
  return `<a class="skip" href="#main">${u.skip}</a>
<header class="site-header">
  <div class="hdr-top">
    <a class="brand" href="${urlPath('home', lang)}" aria-label="YiQi Medical Group 益氣堂"><span class="brand-zh" aria-hidden="true"><span>益</span><span>氣</span><span>堂</span></span><img src="${IMG('logo-full.png')}" alt="YiQi Medical Group" width="${imgSize('logo-full.png')[0]}" height="${imgSize('logo-full.png')[1]}"><span class="brand-text">${u.brandText}</span></a>
    <div class="hdr-actions">
      <a class="tel" href="tel:${CFG.phoneE164}">${CFG.phone}</a>
      <div class="lang" role="group" aria-label="Language"><a href="${urlPath(curId || 'home', 'en')}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>English</a><a href="${urlPath(curId || 'home', 'zh')}" hreflang="zh-Hant" lang="zh-Hant"${lang === 'zh' ? ' aria-current="true"' : ''}>中文</a></div>
      <a class="pill" href="${CFG.patientLoginUrl}" rel="noopener">${u.patientLogin}</a>
      <a class="pill staff" href="${CFG.staffLoginUrl}" rel="noopener">${u.staffLogin}</a>
      <button class="burger" id="burger" aria-label="${u.menu}" aria-expanded="false" aria-controls="mainnav">☰</button>
    </div>
  </div>
  <p class="tagline">${u.tagline}</p>
  <nav class="main" id="mainnav" aria-label="Main">
    <a href="${urlPath('home', lang)}"${cur('home')}>${u.nav.home}</a>
    <div class="dd${svc.includes(curId) ? ' cur' : ''}"><button type="button" aria-expanded="false" aria-haspopup="true">${u.nav.services} ▾</button><div class="menu">${svcMenu}</div></div>
    <a href="${urlPath('community', lang)}"${cur('community')}>${u.nav.community}</a>
    <div class="dd${diet.includes(curId) ? ' cur' : ''}"><button type="button" aria-expanded="false" aria-haspopup="true">${u.nav.dietetics} ▾</button><div class="menu">${dietMenu}</div></div>
    <a href="${urlPath('taichi', lang)}"${cur('taichi')}>${u.nav.taichi}</a>
    <a href="${urlPath('team', lang)}"${cur('team')}>${u.nav.team}</a>
    <a href="${urlPath('faq', lang)}"${cur('faq')}>${u.nav.faq}</a>
    <a href="${urlPath('contact', lang)}"${cur('contact')}>${u.nav.contact}</a>
    <a class="nav-book" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${u.bookOnline}</a>
  </nav>
</header>`;
}

function footer(lang) {
  const u = UI[lang], f = u.footer;
  const li = (id, label) => `<li><a href="${urlPath(id, lang)}">${label}</a></li>`;
  const social = (CFG.social || []).length ? `<div><h4>${f.follow}</h4><ul>${CFG.social.map((s) => `<li><a href="${s.url}" rel="noopener me" target="_blank">${esc(s.label)}</a></li>`).join('')}</ul></div>` : '';
  return `<footer class="site"><div class="wrap">
  <div class="fgrid">
    <div><h4>益氣堂 YiQi Medical Group</h4><p>555 Old County Road, Suite 100<br>San Carlos, CA 94070</p><p><a href="tel:${CFG.phoneE164}">${CFG.phone}</a><br><a href="mailto:${CFG.email}">${CFG.email}</a></p><p><a class="btn btn-primary btn-sm" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${u.bookOnline}</a></p></div>
    <div><h4>${f.services}</h4><ul>${li('community', u.nav.community)}${li('acupuncture', u.svcMenu.acupuncture)}${li('fertility', u.svcMenu.fertility)}${li('tuina', u.svcMenu.tuina)}${li('acufacial', u.svcMenu.acufacial)}</ul></div>
    <div><h4>${f.learn}</h4><ul>${li('team', u.nav.team)}${li('dietetics', u.nav.dietetics)}${li('taichi', u.nav.taichi)}${li('faq', u.nav.faq)}${li('contact', u.nav.contact)}</ul></div>
    <div>${social}<h4${social ? ' style="margin-top:18px"' : ''}>${f.legal}</h4><ul>${li('privacy', f.privacy)}${li('terms', f.terms)}<li><button type="button" class="linkbtn" data-open-cookie>${f.cookie}</button></li></ul></div>
  </div>
  <div class="copy">© ${new Date().getFullYear()} 益氣堂 YiQi Medical Group. ${f.note}</div>
</div></footer>
<div class="sticky"><a class="btn btn-ghost btn-sm" href="tel:${CFG.phoneE164}">${u.callNow}</a><a class="btn btn-primary btn-sm" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${u.bookOnline}</a></div>
<div class="cookie" id="cookie" role="dialog" aria-label="Cookies" aria-live="polite"><p>${u.cookie.text} <a href="${urlPath('privacy', lang)}">${f.privacy}</a></p><div class="row"><button class="btn btn-primary btn-sm" data-consent="granted" type="button">${u.cookie.accept}</button><button class="btn btn-ghost btn-sm" data-consent="denied" type="button">${u.cookie.decline}</button></div></div>`;
}

/* ------------------------------------------------------------------ structured data */
const ORG_ID = `${SITE}/#clinic`;
function orgLd() {
  const o = {
    '@context': 'https://schema.org', '@type': ['MedicalBusiness', 'LocalBusiness'], '@id': ORG_ID,
    name: 'YiQi Medical Group', alternateName: ['益氣堂', 'YiQi Medical Group 益氣堂'], url: SITE + '/',
    description: 'Traditional Chinese Medicine clinic in San Carlos, California: acupuncture, fertility support, Tui Na massage and Acu-Facial from five licensed TCM doctors. PPO accepted; $60 community acupuncture clinic.',
    logo: `${SITE}${IMG('logo-full.png')}`, image: `${SITE}${IMG('hero-leaves.jpg')}`,
    telephone: CFG.phoneIntl, email: CFG.email, priceRange: '$60–$150',
    address: { '@type': 'PostalAddress', streetAddress: '555 Old County Road, Suite 100', addressLocality: 'San Carlos', addressRegion: 'CA', postalCode: '94070', addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: CFG.geo.lat, longitude: CFG.geo.lng },
    hasMap: CFG.mapUrl, areaServed: [{ '@type': 'City', name: 'San Carlos' }, { '@type': 'AdministrativeArea', name: 'San Mateo County, CA' }],
    availableLanguage: ['English', 'Chinese'], knowsAbout: ['Acupuncture', 'Traditional Chinese Medicine', 'Fertility acupuncture', 'Tui Na massage', 'Acu-Facial', 'TCM dietetics'],
    contactPoint: { '@type': 'ContactPoint', telephone: CFG.phoneIntl, contactType: 'appointments', availableLanguage: ['English', 'Chinese'] },
  };
  if ((CFG.social || []).length) o.sameAs = CFG.social.map((s) => s.url);
  return o;
}
const SERVICE_LD = {
  community: { name: '$60 Community Acupuncture', desc: 'Acupuncture with a licensed doctor in a shared treatment room. Mondays 3–6 pm (everyone) and Thursdays 10 am–6 pm (seniors 65+). Pay per visit, no package.', offers: [{ price: '60', name: 'Community clinic visit' }] },
  acupuncture: { name: 'Private Acupuncture', desc: 'One-on-one acupuncture with a licensed doctor of Traditional Chinese Medicine. PPO accepted.', offers: [{ price: '150', name: 'Acupuncture session' }] },
  tuina: { name: 'Tui Na Massage', desc: '60 minutes of meridian and acupressure massage with hot stone. No needles.', offers: [{ price: '120', name: 'Single 60-minute session' }, { price: '500', name: '5-session package' }] },
  fertility: { name: 'Fertility Acupuncture and TCM Support', desc: 'Cycle-regulation acupuncture and Chinese herbs, alone or alongside IUI/IVF.', offers: [] },
  acufacial: { name: 'Acu-Facial', desc: 'Facial and body acupuncture for skin, delivered by licensed TCM doctors.', offers: [] },
};
const DOCS_LD = [['Dr. Amy Wang', 'Founder · Pain & Stress Management', 'dr-wang.jpg'], ['Professor Kevin Yen', 'TCM Neurology & Immunity', 'dr-yen.jpg'], ['Dr. Kate Chen', 'TCM Fertility & Acu-Facial', 'dr-chen.jpg'], ['Dr. Phyu Phyu Thin', 'TCM Fertility & Acu-Facial', 'dr-thin.jpg'], ['Dr. Miles Ronkos', "TCM Men's Health & Sports Injury", 'dr-ronkos.jpg']];

function pageLd(page, lang, faqs) {
  const graph = [];
  if (page.id === 'home') {
    graph.push(orgLd());
    graph.push({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'YiQi Medical Group 益氣堂', url: SITE + '/', inLanguage: ['en-US', 'zh-Hant'], publisher: { '@id': ORG_ID } });
  }
  if (SERVICE_LD[page.id]) {
    const s = SERVICE_LD[page.id];
    const svc = { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.desc, url: absUrl(page.id, lang), provider: { '@id': ORG_ID, '@type': 'MedicalBusiness', name: 'YiQi Medical Group' }, areaServed: { '@type': 'City', name: 'San Carlos' } };
    if (s.offers.length) svc.offers = s.offers.map((o) => ({ '@type': 'Offer', name: o.name, price: o.price, priceCurrency: 'USD' }));
    graph.push(svc);
  }
  if (page.id === 'team') {
    graph.push({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'YiQi Medical Group doctors', itemListElement: DOCS_LD.map((d, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Person', name: d[0], jobTitle: d[1], image: `${SITE}${IMG(d[2])}`, worksFor: { '@id': ORG_ID } } })) });
  }
  if (page.id === 'faq' && faqs.length) {
    graph.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) });
  }
  if (page.id !== 'home') {
    const trail = []; let p = page; while (p) { trail.unshift(p); p = p.parent ? BY_ID[p.parent] : null; }
    graph.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map((p2, i) => ({ '@type': 'ListItem', position: i + 1, name: crumbLabel(p2.id, lang), item: absUrl(p2.id, lang) })) });
  }
  return graph.map((g) => `<script type="application/ld+json">${JSON.stringify(g)}</script>`).join('\n');
}

/* ------------------------------------------------------------------ document shell */
function document_(page, lang, bodyHtml, extraHead = '') {
  const u = UI[lang];
  const title = page.t[lang], desc = page.d[lang];
  const canonical = absUrl(page.id, lang);
  const ogImg = `${SITE}${IMG('hero-leaves.jpg')}`;
  const alts = LANGS.map((l) => `<link rel="alternate" hreflang="${l === 'en' ? 'en-US' : 'zh-Hant'}" href="${absUrl(page.id, l)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${absUrl(page.id, 'en')}">`;
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-Hant' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${alts}
<meta property="og:type" content="website">
<meta property="og:site_name" content="YiQi Medical Group 益氣堂">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta property="og:locale" content="${lang === 'zh' ? 'zh_TW' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FDF6EB">
<link rel="icon" href="${IMG('logo-full.png')}" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Nunito+Sans:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap">
<link rel="stylesheet" href="/assets/css/site.css?v=${BUILD_DATE}">
${extraHead}
${page.__ld || ''}
<script>window.YIQI=${JSON.stringify({ phone: CFG.phone, email: CFG.email, ga4Id: CFG.ga4Id || '', formEndpoint: CFG.formEndpoint || '' })};</script>
</head>
<body>
${header(lang, page.id)}
<main id="main">
${bodyHtml}
</main>
${footer(lang)}
<script src="/assets/js/site.js?v=${BUILD_DATE}" defer></script>
</body>
</html>
`;
}

function crumbLabel(id, lang) {
  const u = UI[lang];
  const m = { home: u.crumbHome, services: u.nav.services, acupuncture: u.svcMenu.acupuncture, fertility: u.svcMenu.fertility, tuina: u.svcMenu.tuina, acufacial: u.svcMenu.acufacial, community: u.nav.community, dietetics: u.nav.dietetics, zwlz: u.dietMenu.zwlz, taichi: u.nav.taichi, team: u.nav.team, faq: u.nav.faq, contact: u.nav.contact, privacy: u.footer.privacy, terms: u.footer.terms };
  return m[id];
}
function crumbsHtml(page, lang) {
  if (page.id === 'home') return '';
  const trail = []; let p = page; while (p) { trail.unshift(p); p = p.parent ? BY_ID[p.parent] : null; }
  const items = trail.map((p2, i) => {
    const label = crumbLabel(p2.id, lang);
    return i === trail.length - 1 ? `<span aria-current="page">${esc(label)}</span>` : `<a href="${urlPath(p2.id, lang)}">${esc(label)}</a>`;
  });
  return `<div class="wrap"><nav class="crumbs" aria-label="${UI[lang].breadcrumbLabel}">${items.join(' › ')}</nav></div>`;
}

const bannerHtml = (page) => (page.banner ? `<div class="banner" aria-hidden="true"><img src="${IMG(page.banner)}" alt="" style="object-position:${page.bannerPos || '50% 50%'}" width="${imgSize(page.banner)[0]}" height="${imgSize(page.banner)[1]}" fetchpriority="low"></div>` : '');

/* ------------------------------------------------------------------ home composition */
function homeBody(lang) {
  const { $, sec } = loadMockPage('home', lang);
  swapPhotos($, sec, 'home', lang);
  wireForms($, sec, lang, 'home');
  const u = UI[lang];
  const book = `<a class="btn btn-primary" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${u.bookOnline}</a>`;
  const h1 = sec.find('.hero h1').html();
  const lead = sec.find('.hero p.lead').html();
  const trust = sec.find('.hero .trust').toString();
  const sections = sec.children('.section');
  const sFind = $(sections[0]), sTeam = $(sections[1]), sSteps = $(sections[2]), sQuotes = $(sections[3]), sFaq = $(sections[5]), sVisit = $(sections[6]);

  // starting-point cards: add the clinic's own photos, as on the live /services-5 tiles
  const cardImg = { '/community-clinic': ['page-community.jpg', T('Patients at the community acupuncture clinic', '社區針灸門診的病患', lang)], '/acupuncture': ['svc-acupuncture.jpg', T('Acupuncture needles on the back', '背部針灸', lang)], '/fertility-acupuncture': ['svc-fertility.jpg', T('Hands forming a heart over a belly', '雙手在腹部比出愛心', lang)], '/tui-na-massage': ['svc-tui-na.jpg', T('Tui Na massage', '推拿', lang)], '/acu-facial': ['svc-acu-facial.jpg', T('Acu-Facial treatment', '針灸美顏療程', lang)] };
  sFind.find('.card').each((_, c) => {
    const href = ($(c).find('a.more').attr('href') || '').replace(/^\/zh/, '');
    const im = cardImg[href]; if (!im) return;
    const inner = $(c).html();
    $(c).html(`<div class="card-img">${imgTag(...im)}</div><div class="card-body">${inner}</div>`);
  });
  sFind.find('h2').before('<span class="hl-bar"></span>');
  sTeam.find('.team-strip').removeAttr('style');

  const hero = `<section class="hero" aria-roledescription="carousel" aria-label="${u.hero}">
  <div class="slide on" role="group" aria-roledescription="slide" aria-label="1 / 3">
    ${imgTag('hero-leaves.jpg', '', { lazy: false })}
    <div class="slide-in"><p class="slide-kicker">YiQi 益氣堂</p><h1>${h1}</h1><p class="slide-sub" style="font-family:var(--f-body);font-style:normal;font-size:clamp(16px,1.6vw,19px);max-width:560px">${lead}</p><div class="btn-row">${book}<a class="btn btn-ghost" href="tel:${CFG.phoneE164}">${T('Call ' + CFG.phone, '來電 ' + CFG.phone, lang)}</a></div></div>
  </div>
  <div class="slide" role="group" aria-roledescription="slide" aria-label="2 / 3" aria-hidden="true">
    ${imgTag('page-community.jpg', T('Patients at the YiQi community acupuncture clinic', '益氣堂社區針灸門診的病患', lang))}
    <div class="slide-in"><h2 class="slide-title">${T('$60 Community Clinic', '$60 社區門診', lang)}</h2><p class="slide-sub">${T('Acupuncture, no package. Mondays for everyone, Thursdays for seniors 65+.', '針灸單次付費，不需療程包。週一開放所有民眾，週四為 65 歲以上長者。', lang)}</p><div class="btn-row"><a class="btn btn-primary" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${T('Book a $60 visit', '預約 $60 門診', lang)}</a><a class="btn btn-ghost" href="${urlPath('community', lang)}">${T('See schedule', '查看時段', lang)}</a></div></div>
  </div>
  <div class="slide" role="group" aria-roledescription="slide" aria-label="3 / 3" aria-hidden="true">
    ${imgTag('hero-acu-facial.jpg', T('Woman resting her hands under her chin', '雙手托腮的女士', lang))}
    <div class="slide-in"><h2 class="slide-title">ACU - FACIAL</h2><p class="slide-sub">${T('Facial and body acupuncture for your skin', '用臉部與身體針灸調理肌膚', lang)}<br>${T('No Botox, no filler', '不打肉毒桿菌、不打填充劑', lang)}</p><div class="btn-row"><a class="btn btn-primary" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${u.bookOnline}</a><a class="btn btn-ghost" href="${urlPath('acufacial', lang)}">${T('Learn more', '了解更多', lang)}</a></div></div>
  </div>
  <button class="arrow prev" type="button" aria-label="${u.slides.prev}">‹</button><button class="arrow next" type="button" aria-label="${u.slides.next}">›</button>
  <div class="dots">${[1, 2, 3].map((n, i) => `<button type="button" aria-label="${u.slides.go} ${n}" aria-current="${i === 0}"></button>`).join('')}</div>
</section>`;

  const feature = `<section class="feature" aria-labelledby="feat-h">
  <div class="feature-photo">${imgTag('senior-branch.jpg', T('Sunlit branch with fresh green leaves', '陽光下帶著新綠嫩葉的樹枝', lang))}</div>
  <div class="feature-card"><h2 id="feat-h">${T('$60 Community Clinic', '$60 社區門診', lang)}</h2>
    <ul>
      <li><b>${T('Mondays', '週一', lang)}</b> ${T('3:00–6:00 pm · open to everyone', '下午 3:00–6:00 · 開放所有民眾', lang)}</li>
      <li><b>${T('Thursdays', '週四', lang)}</b> ${T('10:00 am–6:00 pm · seniors 65+', '上午 10:00–下午 6:00 · 65 歲以上長者', lang)}</li>
      <li>${T('Last appointment 5:30 pm · acupuncture only', '最後預約 5:30 pm · 僅限針灸', lang)}</li>
      <li>${T('Shared treatment room · $60 per visit, no package', '共用治療室 · 每次 $60，不需療程包', lang)}</li>
      <li><b>${T('Appointment required', '需預約', lang)}</b>: <a href="tel:${CFG.phoneE164}">${CFG.phone}</a></li>
    </ul>
    <div class="cta-row"><a class="btn btn-primary" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${T('Book a $60 visit', '預約 $60 門診', lang)}</a><a class="btn btn-sage" href="${urlPath('community', lang)}">${T('Details', '詳情', lang)}</a></div>
  </div>
</section>`;

  const embrace = `<section class="embrace" aria-label="${T('Our promise', '我們的理念', lang)}"><div class="band-photo">${imgTag('band-hands.jpg', T('Two hands forming a heart', '雙手比出愛心', lang))}</div><div class="band-text"><p>${T('Embrace Traditional Chinese Medicine for Balance, Wellness, and Longevity!', '擁抱中醫，找回平衡、健康與長壽！', lang)}</p><p class="big">${T('Unleash Your Best', '活出最好的您', lang)}</p></div></section>`;

  // visit block keeps the live homepage composition: vertical 益氣堂 + logo, address, sage form card
  const visitSplit = sVisit.find('.split').attr('class', 'visit');
  visitSplit.find('h2').first().before(`<div class="visit-brand"><span class="brand-zh" aria-hidden="true"><span>益</span><span>氣</span><span>堂</span></span>${imgTag('logo-full.png', 'YiQi Medical Group')}</div>`);

  return [
    hero,
    `<div class="wrap">${trust}</div>`,
    feature,
    sFind.toString(), sTeam.toString(), sSteps.toString(), sQuotes.toString(), sFaq.toString(), embrace, sVisit.toString(),
  ].join('\n');
}

/* ------------------------------------------------------------------ interior pages */
function interiorBody(page, lang) {
  const { $, sec } = loadMockPage(page.id, lang);
  swapPhotos($, sec, page.id, lang);
  wireForms($, sec, lang, page.id);
  // anchors on dietetics
  if (page.id === 'dietetics') {
    sec.find('h2').each((_, h) => {
      const t = $(h).text();
      if (/Five Elements Tea|五行養生茶/.test(t)) $(h).attr('id', 'five-elements-tea');
      if (/Zi Wu Liu Zhu|子午流注/.test(t)) {
        $(h).attr('id', 'zi-wu-liu-zhu');
        $(h).next('p').after(`<p><a class="btn btn-ghost btn-sm" href="${urlPath('zwlz', lang)}">${T('See the 12-period body-clock chart →', '查看十二時辰養生對照表 →', lang)}</a></p>`);
      }
    });
  }
  if (page.id === 'team') {
    sec.find('.doc').each((_, d) => { /* ids set in swapPhotos */ });
  }
  let faqs = [];
  if (page.id === 'faq') {
    sec.find('details').each((_, d) => { faqs.push({ q: strip($(d).find('summary').html()), a: strip($(d).find('.ans').html()) }); });
  }
  return { html: bannerHtml(page) + crumbsHtml(page, lang) + sec.html(), faqs };
}

/* ------------------------------------------------------------------ custom pages */
const ZWLZ = [
  ['23:00–01:00', 'Zi 子時', 'Gallbladder 膽經', 'None (fasting/sleeping)', 'Deep sleep; avoid screens, eating, and strenuous activity; keep the room dark and quiet'],
  ['01:00–03:00', 'Chou 丑時', 'Liver 肝經', '—', 'Continue deep sleep; avoid alcohol, late-night eating, and emotional stress; the liver does its detoxifying work during sleep'],
  ['03:00–05:00', 'Yin 寅時', 'Lung 肺經', '—', 'Sleep; if awake, practice slow deep breathing; avoid cold drinks and exposure to cold air'],
  ['05:00–07:00', 'Mao 卯時', 'Large Intestine 大腸經', 'Warm water on an empty stomach; light fiber-rich foods (e.g., oatmeal, prunes)', 'Drink warm water, bowel movement, light stretching or walking; avoid a heavy breakfast at this time'],
  ['07:00–09:00', 'Chen 辰時', 'Stomach 胃經', 'Warm, easily digestible breakfast: congee, eggs, steamed vegetables, whole grains; avoid cold or raw foods', 'Eat breakfast slowly; do not skip it; a light walk after eating aids digestion'],
  ['09:00–11:00', 'Si 巳時', 'Spleen 脾經', 'If snacking: warm cooked foods, ginger tea, small amounts of fruit; avoid cold drinks and raw foods', 'Best time for mental work, studying or decision-making; avoid overeating or heavy physical strain'],
  ['11:00–13:00', 'Wu 午時', 'Heart 心經', 'Balanced lunch: lean protein, vegetables, whole grains; moderate portions; avoid excessive caffeine or alcohol', 'Eat lunch, then rest or take a short nap (15–30 minutes); avoid intense exercise or emotional stress'],
  ['13:00–15:00', 'Wei 未時', 'Small Intestine 小腸經', 'Warm water or herbal tea; easily digestible snacks if needed; avoid heavy or greasy foods', 'Light activity or walking; allow digestion; avoid vigorous exercise right after lunch'],
  ['15:00–17:00', 'Shen 申時', 'Bladder 膀胱經', 'Warm water or herbal tea; hydrating foods (e.g., cucumber, watermelon in moderation); avoid excessive salt', 'Drink water, stretch, take a walk; a good time for physical work or exercise; do not hold urine'],
  ['17:00–19:00', 'You 酉時', 'Kidney 腎經', 'Light, warm dinner: soups, steamed fish, leafy greens, black beans, walnuts; avoid heavy, salty or spicy foods', 'Eat dinner early and in moderation; gentle walking; avoid strenuous exercise; start winding down'],
  ['19:00–21:00', 'Xu 戌時', 'Pericardium 心包經', 'Herbal tea (e.g., chamomile, lavender); light snacks if needed; avoid caffeine and heavy meals', 'Relax: gentle yoga, meditation, reading, time with loved ones; avoid work and screens'],
  ['21:00–23:00', 'Hai 亥時', 'Triple Burner 三焦經', 'None, or a small sip of warm water; avoid eating and alcohol', 'Prepare for sleep: dim lights, avoid screens, take a warm bath, relax or meditate; aim to be asleep by 23:00'],
];
const ELEMENTS = [
  ['Wood 木', 'Green', 'Gallbladder, Liver', '23:00–03:00 (sleep)'],
  ['Fire 火', 'Red', 'Heart, Small Intestine, Pericardium, Triple Burner', '11:00–15:00, 19:00–23:00 (rest and relax)'],
  ['Earth 土', 'Yellow', 'Stomach, Spleen', '07:00–11:00 (eat and digest)'],
  ['Metal 金', 'White', 'Lung, Large Intestine', '03:00–07:00 (breathe and release)'],
  ['Water 水', 'Blue', 'Bladder, Kidney', '15:00–19:00 (hydrate and restore)'],
];
function zwlzBody(page, lang) {
  const rows = ZWLZ.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}<br><span class="small">${r[2]}</span></td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join('');
  const el = ELEMENTS.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  const note = lang === 'zh' ? '<p class="small">以下對照表保留英文原文，並附中文經絡名稱。</p>' : '';
  return `${bannerHtml(page)}${crumbsHtml(page, lang)}
<div class="section"><div class="wrap">
  <div class="eyebrow">${T('TCM Dietetics', '中醫食療', lang)}</div>
  <h1>${T('Zi Wu Liu Zhu 子午流注: the TCM body clock', '子午流注：中醫養生時鐘', lang)}</h1>
  <p class="lead">${T('Qi and blood move through the meridians on a daily rhythm. Matching meals, rest and activity to that rhythm is meant to support your health.', '氣血在經絡中依一天的節律運行。讓飲食、作息與活動配合這個節律，有助於維持健康。', lang)}</p>
  <ul class="tick">
    <li>${T('Zi (子) is the midnight hour (23:00–01:00), the peak of Yin.', '子（23:00–01:00）是午夜時分，陰氣最盛。', lang)}</li>
    <li>${T('Wu (午) is the noon hour (11:00–13:00), the peak of Yang.', '午（11:00–13:00）是正午時分，陽氣最盛。', lang)}</li>
    <li>${T('Liu zhu (流注) means the circulation and flow of qi and blood through the meridians.', '流注是指氣血在經絡中的流動與灌注。', lang)}</li>
  </ul>
  <p>${T('The idea rests on 天人合一, "unity of heaven and humanity": the body follows the rhythms of nature. This is an educational overview. Ask your doctor how to adapt it to your own health.', '此說以「天人合一」為基礎：人體隨自然節律運行。以下為衛教介紹，如何依您的狀況調整，請詢問醫師。', lang)}</p>
  ${note}
  <h2>${T('Twelve two-hour periods', '十二時辰', lang)}</h2>
  <div class="scroll"><table class="t clock"><tr><th>${T('Time', '時間', lang)}</th><th>${T('Period and meridian', '時辰與經絡', lang)}</th><th>${T('Suggested foods', '建議飲食', lang)}</th><th>${T('Suggested activities', '建議活動', lang)}</th></tr>${rows}</table></div>
  <h2 style="margin-top:36px">${T('Five Elements summary', '五行對照', lang)}</h2>
  <div class="scroll"><table class="t"><tr><th>${T('Element', '五行', lang)}</th><th>${T('Color', '顏色', lang)}</th><th>${T('Organs', '臟腑', lang)}</th><th>${T('Best time to nourish', '最適合滋養的時段', lang)}</th></tr>${el}</table></div>
  <p class="disc">${T('Educational overview only; it does not replace care from your doctor.', '僅為衛教介紹，不能取代醫師的照護。', lang)}</p>
  <div class="cta-row" style="margin-top:20px"><a class="btn btn-primary" href="${CFG.bookingUrl}" target="_blank" rel="noopener">${UI[lang].bookOnline}</a><a class="btn btn-ghost" href="${urlPath('dietetics', lang)}">${T('Back to Dietetics', '回到中醫食療', lang)}</a></div>
</div></div>`;
}

function legalBody(page, lang) {
  const file = path.join(ROOT, 'src/content', `${page.id}.html`);
  const body = fs.readFileSync(file, 'utf8');
  const note = lang === 'zh' ? `<p class="small">本頁為法律文件，以英文原文為準。如有疑問，請來電 ${CFG.phone}。</p>` : '';
  return `${crumbsHtml(page, lang)}<div class="section"><div class="wrap prose"><h1>${esc(strip(page.t[lang]).split(/[|｜]/)[0].trim())}</h1>${note}${body}</div></div>`;
}

/* ------------------------------------------------------------------ write */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/img'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/img'), path.join(OUT, 'assets/img'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/site.css'), path.join(OUT, 'assets/css/site.css'));
fs.copyFileSync(path.join(ROOT, 'src/site.js'), path.join(OUT, 'assets/js/site.js'));

function outFile(page, lang) {
  const rel = lang === 'zh' ? (page.slug ? `zh/${page.slug}` : 'zh') : page.slug;
  return path.join(OUT, rel, 'index.html');
}

const report = [];
for (const lang of LANGS) {
  for (const page of PAGES) {
    let body, faqs = [];
    if (page.id === 'home') body = homeBody(lang);
    else if (page.id === 'zwlz') body = zwlzBody(page, lang);
    else if (page.id === 'privacy' || page.id === 'terms') body = legalBody(page, lang);
    else { const r = interiorBody(page, lang); body = r.html; faqs = r.faqs; }
    page.__ld = pageLd(page, lang, faqs);
    const html = document_(page, lang, body);
    const f = outFile(page, lang);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
    report.push([lang, urlPath(page.id, lang), strip(page.t[lang]).length, strip(page.d[lang]).length]);
  }
}

/* sitemap with hreflang alternates */
const sm = PAGES.flatMap((p) => LANGS.map((l) => {
  const alts = LANGS.map((a) => `<xhtml:link rel="alternate" hreflang="${a === 'en' ? 'en-US' : 'zh-Hant'}" href="${absUrl(p.id, a)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(p.id, 'en')}"/>`;
  return `<url><loc>${absUrl(p.id, l)}</loc><lastmod>${BUILD_DATE}</lastmod>${alts}</url>`;
}));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.join('\n')}\n</urlset>\n`);

/* robots.txt: open to everyone, AI crawlers named explicitly */
const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot'];
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nUser-agent: PetalBot\nDisallow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* llms.txt: describes the clinic (the old Wix llms.txt described the accessibility statement) */
fs.writeFileSync(path.join(OUT, 'llms.txt'), `# YiQi Medical Group 益氣堂

> Traditional Chinese Medicine (TCM) clinic in San Carlos, California. Five licensed TCM doctors offer acupuncture, fertility support, Tui Na massage and Acu-Facial. PPO insurance accepted; benefits are verified before the first visit. A $60 community acupuncture clinic runs Mondays 3–6 pm (everyone) and Thursdays 10 am–6 pm (seniors 65+), pay per visit, no package. The website is available in English and Traditional Chinese.

Address: 555 Old County Road, Suite 100, San Carlos, CA 94070
Phone: ${CFG.phone}
Email: ${CFG.email}
Book online: ${CFG.bookingUrl}

## Key pages
- [$60 Community Clinic](${absUrl('community', 'en')}): schedule, what is included, how to book
- [Acupuncture](${absUrl('acupuncture', 'en')}): private acupuncture, $150 per session, PPO accepted
- [Fertility acupuncture](${absUrl('fertility', 'en')}): support alone or alongside IUI/IVF
- [Tui Na massage](${absUrl('tuina', 'en')}): 60 minutes, $120 or 5 sessions for $500, no needles
- [Acu-Facial](${absUrl('acufacial', 'en')}): facial and body acupuncture for skin
- [Our doctors](${absUrl('team', 'en')}): Dr. Amy Wang, Prof. Kevin Yen, Dr. Kate Chen, Dr. Phyu Phyu Thin, Dr. Miles Ronkos
- [FAQ](${absUrl('faq', 'en')}): cost, insurance, first visit, needles, fertility
- [TCM dietetics](${absUrl('dietetics', 'en')}) and [Zi Wu Liu Zhu body clock](${absUrl('zwlz', 'en')})
- [Medical Tai-Chi with Sifu Donna](${absUrl('taichi', 'en')})
- [Contact](${absUrl('contact', 'en')})

## Chinese version
- ${absUrl('home', 'zh')}
`);

/* redirects (Netlify / Cloudflare Pages format) — from the mockup's site-map table */
const R = [
  ['/accupuncture', '/acupuncture'], ['/services-5', '/services'], ['/general-clean', '/community-clinic'],
  ['/copy-of-acu-facial-microneedling', '/fertility-acupuncture'], ['/fertility', '/fertility-acupuncture'],
  ['/acu-facial-microneedling', '/acu-facial'], ['/tuina-massage', '/tui-na-massage'],
  ['/about-1', '/our-team'], ['/about-5-1', '/our-team'], ['/about-5', '/dietetics'], ['/general-7', '/dietetics#five-elements-tea'],
  ['/zi-wu-liu-zhu-子午流注', '/zi-wu-liu-zhu'], ['/zi-wu-liu-zhu-%E5%AD%90%E5%8D%88%E6%B5%81%E6%B3%A8', '/zi-wu-liu-zhu'],
  ['/about-3', '/tai-chi'], ['/copy-of-home', '/'], ['/copy-of-home-2', '/'], ['/copy-of-services', '/services'],
  ['/copy-of-tuina-massage', '/tui-na-massage'], ['/services-1', '/services'], ['/services-7', '/services'],
  ['/items', '/services'], ['/inquiry-services-page', '/contact'],
];
const lines = [];
for (const [a, b] of R) { lines.push(`${a} ${b} 301`); lines.push(`/zh${a} /zh${b === '/' ? '/' : b} 301`); }
fs.writeFileSync(path.join(OUT, '_redirects'), `# Old Wix URLs -> new URLs (301). See docs/REDIRECTS.md\n${lines.join('\n')}\n`);
fs.writeFileSync(path.join(OUT, '_headers'), `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);

/* 404 */
{
  const page = { id: 'home', t: { en: 'Page not found | YiQi Medical Group', zh: '找不到頁面｜益氣堂' }, d: { en: 'The page you are looking for has moved.', zh: '您要找的頁面已移動。' }, __ld: '' };
  const body = `<div class="section"><div class="wrap center"><h1>Page not found 找不到頁面</h1><p class="lead">The page may have moved. Try one of these:</p><div class="cta-row" style="justify-content:center"><a class="btn btn-primary" href="/">Home</a><a class="btn btn-ghost" href="/services">Services</a><a class="btn btn-ghost" href="/community-clinic">$60 Community Clinic</a><a class="btn btn-ghost" href="/contact">Contact</a></div></div></div>`;
  fs.writeFileSync(path.join(OUT, '404.html'), document_(page, 'en', body, '<meta name="robots" content="noindex">').replace(/<link rel="canonical"[^>]*>\n?/, '').replace(/<link rel="alternate"[^>]*>\n?/g, ''));
}

console.log('Built', report.length, 'pages ->', path.relative(ROOT, OUT));
const over = report.filter((r) => (r[0] === 'en' && (r[2] > 60 || r[3] > 160)));
if (over.length) console.log('Long meta (EN):', over.map((o) => `${o[1]} title=${o[2]} desc=${o[3]}`).join('; '));
