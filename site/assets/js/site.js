/* YiQi Medical Group — site behaviour (no dependencies). Config comes from window.YIQI (set in each page). */
(function () {
  'use strict';
  var C = window.YIQI || {};
  var zh = document.documentElement.lang === 'zh-Hant';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- mobile menu + services dropdown ---- */
  var burger = $('#burger'), nav = $('#mainnav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  $$('.dd > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var dd = b.parentNode, open = dd.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $$('.dd.open').forEach(function (d) { d.classList.remove('open'); });
      if (nav) nav.classList.remove('open');
    }
  });

  /* ---- hero slider ---- */
  var hero = $('.hero');
  if (hero) {
    var slides = $$('.slide', hero), dots = $$('.dots button', hero), i = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var show = function (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('on', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        $$('a,button', s).forEach(function (el) { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    };
    var play = function () { if (!reduce) { stop(); timer = setInterval(function () { show(i + 1); }, 7000); } };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var prev = $('.arrow.prev', hero), next = $('.arrow.next', hero);
    if (prev) prev.addEventListener('click', function () { show(i - 1); play(); });
    if (next) next.addEventListener('click', function () { show(i + 1); play(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); play(); }); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', play);
    show(0); play();
  }

  /* ---- contact / call-back forms: opens the visitor's email app (no medical details are collected) ---- */
  $$('form[data-form]').forEach(function (f) {
    var msg = $('.form-msg', f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('.hp input', f) && $('.hp input', f).value) return; // honeypot
      var d = new FormData(f);
      var subject = (zh ? '新病患詢問' : 'New Patient Inquiry') + ' — ' + (d.get('interest') || '');
      var body = [
        (zh ? '姓名: ' : 'Name: ') + (d.get('name') || ''),
        (zh ? '電話或 Email: ' : 'Phone or email: ') + (d.get('contact') || ''),
        (zh ? '我想了解: ' : "I'm interested in: ") + (d.get('interest') || ''),
        '',
        (d.get('message') || '')
      ].join('\n');
      if (C.formEndpoint) {
        fetch(C.formEndpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: d })
          .then(function (r) { if (!r.ok) throw new Error('bad'); f.reset(); if (msg) { msg.textContent = zh ? '謝謝您，我們會在上班日回覆。' : 'Thank you. We will reply on business days.'; msg.classList.add('show'); } })
          .catch(function () { window.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); });
      } else {
        window.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        if (msg) { msg.textContent = zh ? '已開啟您的電子郵件程式。若未開啟，請來電 ' + C.phone + '。' : 'Your email app should open. If it does not, please call ' + C.phone + '.'; msg.classList.add('show'); }
      }
    });
  });

  /* ---- cookie consent (the Privacy Policy promises a banner + "Cookie Settings" link) ---- */
  var KEY = 'yiqi-cookie-consent';
  var banner = $('#cookie');
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  // Tags: Google Tag Manager (the same container the Wix site used). By default it loads only after the visitor
  // accepts cookies, as the Privacy Policy promises. Set "gtmLoad": "always" in src/config.json to load it on every visit.
  var loadAnalytics = function () {
    if (window.__tagsLoaded) return;
    if (C.gtmId) {
      window.__tagsLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var g = document.createElement('script');
      g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(C.gtmId);
      document.head.appendChild(g);
    } else if (C.ga4Id) {
      window.__tagsLoaded = true;
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.ga4Id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', C.ga4Id, { anonymize_ip: true });
    }
  };
  var decide = function (v) {
    write(v);
    if (banner) banner.classList.remove('show');
    if (v === 'granted') loadAnalytics();
  };
  if (banner) {
    var cur = read();
    if (cur === 'granted' || C.gtmLoad === 'always') loadAnalytics();
    if (!cur) banner.classList.add('show');
    var a = $('[data-consent="granted"]', banner), d = $('[data-consent="denied"]', banner);
    if (a) a.addEventListener('click', function () { decide('granted'); });
    if (d) d.addEventListener('click', function () { decide('denied'); });
  }
  $$('[data-open-cookie]').forEach(function (b) {
    b.addEventListener('click', function () { if (banner) { banner.classList.add('show'); var f = $('button', banner); if (f) f.focus(); } });
  });
})();
