(() => {
  'use strict';

  // SEM: dataLayer untuk Google Tag Manager / Google Ads / GA4
  window.dataLayer = window.dataLayer || [];
  const track = (event, params = {}) => window.dataLayer.push({ event, ...params });

  // Menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  // SEM: simpan parameter UTM selama sesi agar atribusi kampanye tidak hilang
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
  const query = new URLSearchParams(location.search);
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k) || ''; } catch { return ''; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* diabaikan */ } }
  };
  utmKeys.forEach((k) => { if (query.get(k)) store.set(k, query.get(k)); });

  // SEM: lacak klik pada semua elemen dengan atribut data-track
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-track]');
    if (el) track('cta_click', { cta_label: el.dataset.track, cta_url: el.getAttribute('href') });
  });

  // Form newsletter
  const form = document.getElementById('newsletter-form');
  const status = document.getElementById('form-status');
  utmKeys.forEach((k) => { const f = form.elements[k]; if (f) f.value = store.get(k); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.elements.email.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!valid) {
      status.textContent = 'Alamat email belum valid. Contoh: nama@email.com';
      form.elements.email.focus();
      return;
    }
    // Hubungkan ke layanan newsletter Anda di sini, misalnya fetch('/api/subscribe', {...})
    track('newsletter_submit', {
      utm_source: store.get('utm_source'),
      utm_medium: store.get('utm_medium'),
      utm_campaign: store.get('utm_campaign')
    });
    status.textContent = 'Terima kasih! Silakan cek email untuk konfirmasi.';
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
