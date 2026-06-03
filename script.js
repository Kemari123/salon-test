/* ============================================================
   KISII DREADLOCKS PARLOR — script.js
   Full interactive functionality — v2
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ======================================================
     1. PAGE LOAD FADE-IN
     ====================================================== */
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => {
    document.documentElement.style.opacity = '1';
  });

  /* ======================================================
     2. NAVBAR
     ====================================================== */
  const navbar    = $('#navbar');
  const navToggle = $('#navToggle');
  const navLinks  = $('#navLinks');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
    updateBackTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
      closeLightbox();
    }
  });

  function updateActiveLink() {
    const sections = $$('section[id]');
    const offset   = 140;
    let current    = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - offset) current = s.id;
    });
    $$('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ======================================================
     3. SMOOTH SCROLL
     ====================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ======================================================
     4. BACK TO TOP
     ====================================================== */
  const backTop = $('#backTop');
  function updateBackTop() {
    backTop.classList.toggle('visible', window.scrollY > 500);
  }
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ======================================================
     5. SCROLL REVEAL
     ====================================================== */
  const revealTargets = [
    '.service-card', '.staff-card', '.review-card',
    '.contact-card', '.hours-row', '.gallery-item', '.stat',
    '.section-header', '.about-visual', '.about-text',
    '.hours-text', '.hours-table', '.contact-info', '.contact-map'
  ];

  revealTargets.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 5 * 0.07) + 's';
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ======================================================
     6. ANIMATED COUNTERS
     ====================================================== */
  function animateCounter(el, target, suffix) {
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(num => {
          const raw    = num.textContent.trim();
          const value  = parseInt(raw);
          const suffix = raw.replace(String(value), '');
          animateCounter(num, value, suffix);
        });
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.about-stats').forEach(el => statObserver.observe(el));

  /* ======================================================
     7. GALLERY — simple init (no tabs)
     ====================================================== */
  // Gallery images load naturally — no tab switching needed

  /* ======================================================
     8. LIGHTBOX
     ====================================================== */
  const lightbox        = $('#lightbox');
  const lightboxClose   = $('#lightboxClose');
  const lightboxContent = $('#lightboxContent');
  const lightboxPrev    = $('#lightboxPrev');
  const lightboxNext    = $('#lightboxNext');
  let currentIdx        = 0;

  function getVisibleItems() {
    return galleryItems.filter(item => item.style.display !== 'none');
  }

  function openLightbox(idx) {
    const items = getVisibleItems();
    if (!items.length) return;
    currentIdx = (idx + items.length) % items.length;
    const el   = items[currentIdx];
    const icon = el.querySelector('i') ? el.querySelector('i').className : 'fas fa-image';
    const label = el.querySelector('span') ? el.querySelector('span').textContent : '';
    const bgClass = el.querySelector('[class*="gp-"]') ? el.querySelector('[class*="gp-"]').className : '';

    lightboxContent.innerHTML = `
      <div class="lb-card ${bgClass}" style="width:70vw;max-width:600px;height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;border-radius:12px;border:1px solid rgba(201,168,76,0.3);">
        <i class="${icon}" style="font-size:5rem;color:rgba(201,168,76,0.6)"></i>
        <span style="font-size:1rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.6)">${label}</span>
        <p style="font-size:0.75rem;color:rgba(255,255,255,0.3);letter-spacing:0.1em">Add your real photo here</p>
        <span style="font-size:0.65rem;color:rgba(201,168,76,0.5)">${currentIdx + 1} / ${items.length}</span>
      </div>`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const idx     = visible.indexOf(item);
      openLightbox(idx);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  if (lightboxPrev) lightboxPrev.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox(currentIdx - 1);
  });
  if (lightboxNext) lightboxNext.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox(currentIdx + 1);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });

  /* ======================================================
     9. REVIEWS CAROUSEL (auto-scroll + dots)
     ====================================================== */
  const reviewCards = $$('.review-card');
  let reviewIdx  = 0;
  let autoTimer  = null;

  function goReview(idx) {
    reviewCards.forEach((c, i) => {
      c.classList.toggle('review-active', i === idx);
      c.classList.toggle('review-inactive', i !== idx);
    });
  }

  // Build dots if more than 3 reviews on mobile
  function buildReviewDots() {
    let dotsWrap = $('.reviews-dots');
    if (!dotsWrap) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'reviews-dots';
      const reviewsSection = $('#reviews .reviews-grid');
      if (reviewsSection) reviewsSection.after(dotsWrap);
    }
    dotsWrap.innerHTML = '';
    reviewCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'r-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => {
        clearInterval(autoTimer);
        reviewIdx = i;
        $$('.r-dot').forEach((d, j) => d.classList.toggle('active', j === i));
        goReview(i);
        startAutoplay();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function nextReview() {
    reviewIdx = (reviewIdx + 1) % reviewCards.length;
    $$('.r-dot').forEach((d, i) => d.classList.toggle('active', i === reviewIdx));
  }

  function startAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextReview, 4000);
  }

  // Reviews section removed

  /* ======================================================
     10. HIGHLIGHT TODAY'S HOURS ROW
     ====================================================== */
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const todayName = days[new Date().getDay()];
  $$('.hours-row').forEach(row => {
    const dayEl  = row.querySelector('.day');
    const timeEl = row.querySelector('.time');
    if (dayEl && dayEl.textContent.trim() === todayName) {
      row.classList.add('today');
    }
    // Replace "Open Close" text with nicer markup
    if (timeEl && timeEl.textContent.includes('Open Close')) {
      const open = timeEl.textContent.replace('– Open Close','').trim();
      timeEl.innerHTML = `<span class="time-open">${open} onwards</span><span class="time-close">Closing time varies</span>`;
      timeEl.style.display = 'flex';
      timeEl.style.flexDirection = 'column';
      timeEl.style.gap = '2px';
    }
  });

  /* ======================================================
     11. TOAST SYSTEM
     ====================================================== */
  function showToast(msg, icon = 'fa-check-circle') {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ======================================================
     12. WHATSAPP + PHONE FEEDBACK
     ====================================================== */
  $$('a[href^="https://wa.me"]').forEach(link => {
    link.addEventListener('click', () => showToast('Opening WhatsApp…', 'fa-whatsapp'));
  });
  $$('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => showToast('Initiating call…', 'fa-phone'));
  });

  /* ======================================================
     13. SERVICE CARD → BOOK ON WHATSAPP
     ====================================================== */
  $$('.service-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const name = card.querySelector('h3') ? card.querySelector('h3').textContent : 'a service';
      const msg  = encodeURIComponent(`Hello! I'd like to book: ${name}`);
      window.open(`https://wa.me/254715410986?text=${msg}`, '_blank');
      showToast(`Booking: ${name}`, 'fa-calendar-check');
    });
  });

  /* ======================================================
     14. CARD TILT
     ====================================================== */
  function initTilt(selector) {
    if (window.matchMedia('(hover: none)').matches) return;
    $$(selector).forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -5;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        card.style.transition = 'none';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        card.style.transform  = '';
      });
    });
  }
  initTilt('.service-card');
  initTilt('.staff-card');

  /* ======================================================
     15. HERO PARALLAX
     ====================================================== */
  const heroContent = $('.hero-content');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroContent && y < window.innerHeight * 1.2) {
      heroContent.style.transform = `translateY(${y * 0.25}px)`;
      heroContent.style.opacity   = String(Math.max(0, 1 - y / (window.innerHeight * 0.7)));
    }
  }, { passive: true });

  /* ======================================================
     16. TICKER LOOP
     ====================================================== */
  const tickerInner = $('.ticker-inner');
  if (tickerInner) tickerInner.innerHTML += tickerInner.innerHTML;

  /* ======================================================
     17. CURRENT YEAR
     ====================================================== */
  $$('.footer-bottom p').forEach(p => {
    p.innerHTML = p.innerHTML.replace('2024', new Date().getFullYear());
  });

  // Gallery swipe removed (no tabs)
    });
  }

  /* ======================================================
     19. FLOATING WA PULSE
     ====================================================== */
  const floatWa = $('.float-wa');
  if (floatWa) floatWa.classList.add('float-wa-pulse');

  console.log('%c✦ Kisii Dreadlocks Parlor ✦', 'color:#C9A84C;font-size:14px;font-weight:bold;');

})();

/* ======================================================
   SERVICES — VIEW ALL TOGGLE
   ====================================================== */
function toggleServices() {
  const wrap   = document.getElementById('servicesHiddenWrap');
  const btn    = document.getElementById('servicesToggle');
  const label  = document.getElementById('toggleLabel');
  const hint   = document.getElementById('servicesHint');
  const icon   = document.getElementById('toggleIcon');
  const isOpen = wrap.classList.contains('open');

  if (!isOpen) {
    wrap.classList.add('open');
    btn.classList.add('open');
    label.textContent = 'Show Less';
    if (hint) hint.textContent = 'Showing all 18 services';
    // stagger cards in
    const cards = wrap.querySelectorAll('.service-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 60);
    });
  } else {
    const cards = wrap.querySelectorAll('.service-card');
    cards.forEach(c => c.classList.remove('visible'));
    setTimeout(() => {
      wrap.classList.remove('open');
      btn.classList.remove('open');
      label.textContent = 'View All 18 Services';
      if (hint) hint.textContent = 'Showing 6 of 18 services';
      document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}
window.toggleServices = toggleServices;

/* ======================================================
   GALLERY — SMART LOAD MORE (probes images, no empties)
   ====================================================== */
(function () {
  const BATCH    = 6;
  const MAX      = 20;
  const grid     = document.getElementById('galleryGrid');
  const btn      = document.getElementById('galleryLoadBtn');
  const lblBtn   = document.getElementById('galleryBtnLabel');
  const lblShown = document.getElementById('galleryShown');
  const lblTotal = document.getElementById('galleryTotal');

  if (!grid) return;

  // Remove the 6 initial HTML items — we'll manage everything via JS
  // so we have a single source of truth
  const existing = Array.from(grid.querySelectorAll('.gallery-item'));
  existing.forEach(el => el.remove());

  // Build all 20 probe paths
  const allPaths = Array.from({ length: MAX }, (_, i) => `images/work${i + 1}.jpeg`);
  let   validPaths = [];   // only paths that loaded OK
  let   probed     = 0;
  let   shown      = 0;
  let   lbImages   = [];   // for lightbox

  // Probe every path
  allPaths.forEach((src, idx) => {
    const img     = new Image();
    img.onload    = () => { validPaths.push({ src, idx }); finish(); };
    img.onerror   = () => {                                  finish(); };
    img.src       = src;
  });

  function finish() {
    probed++;
    if (probed < MAX) return;

    // Sort by original index
    validPaths.sort((a, b) => a.idx - b.idx);

    lblTotal.textContent = validPaths.length;
    lblShown.textContent = 0;

    if (validPaths.length === 0) {
      const wrap = document.getElementById('galleryToggleWrap');
      if (wrap) wrap.style.display = 'none';
      return;
    }

    showBatch(); // show first 6
  }

  function makeItem(src, position) {
    const div  = document.createElement('div');
    div.className = 'gallery-item';
    div.style.opacity   = '0';
    div.style.transform = 'scale(0.93) translateY(14px)';

    const img  = document.createElement('img');
    img.src    = src;
    img.alt    = 'Kisii Dreadlocks Work';
    img.loading = 'lazy';

    const zoom = document.createElement('div');
    zoom.className = 'gallery-zoom';
    zoom.innerHTML = '<i class="fas fa-expand-alt"></i>';

    div.appendChild(img);
    div.appendChild(zoom);

    div.addEventListener('click', () => {
      openLightbox(position);
    });

    return div;
  }

  function showBatch() {
    const batch = validPaths.slice(shown, shown + BATCH);
    if (!batch.length) return;

    batch.forEach((item, i) => {
      const el = makeItem(item.src, shown + i);
      grid.appendChild(el);
      lbImages.push(el);

      // Animate in with stagger
      setTimeout(() => {
        el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        el.style.opacity    = '1';
        el.style.transform  = 'scale(1) translateY(0)';
      }, i * 80 + 50);
    });

    shown += batch.length;
    lblShown.textContent = shown;

    if (shown >= validPaths.length) {
      btn.disabled      = true;
      lblBtn.textContent = 'All Photos Shown';
    } else {
      const left = validPaths.length - shown;
      lblBtn.textContent = `View More Work (${left} left)`;
    }
  }

  window.loadMoreGallery = showBatch;

  /* ── Lightbox ── */
  let lbIdx = 0;
  function openLightbox(idx) {
    lbIdx = idx;
    const lb  = document.getElementById('lightbox');
    const con = document.getElementById('lightboxContent');
    if (!lb || !con) return;
    const imgEl = lbImages[lbIdx] ? lbImages[lbIdx].querySelector('img') : null;
    if (!imgEl) return;
    con.innerHTML = `<img src="${imgEl.src}" alt="Kisii Dreadlocks Work"
      style="max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px;display:block;">`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateLbArrows();
  }
  function updateLbArrows() {
    const prev = document.getElementById('lightboxPrev');
    const next = document.getElementById('lightboxNext');
    if (prev) prev.style.opacity = lbIdx > 0 ? '1' : '0.25';
    if (next) next.style.opacity = lbIdx < lbImages.length - 1 ? '1' : '0.25';
  }
  function closeLb() {
    const lb = document.getElementById('lightbox');
    if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const lb   = document.getElementById('lightbox');
    const cl   = document.getElementById('lightboxClose');
    const prev = document.getElementById('lightboxPrev');
    const next = document.getElementById('lightboxNext');
    if (cl)   cl.onclick   = closeLb;
    if (lb)   lb.onclick   = e => { if (e.target === lb) closeLb(); };
    if (prev) prev.onclick = e => { e.stopPropagation(); if (lbIdx > 0) openLightbox(lbIdx - 1); };
    if (next) next.onclick = e => { e.stopPropagation(); if (lbIdx < lbImages.length - 1) openLightbox(lbIdx + 1); };
    document.addEventListener('keydown', e => {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft'  && lbIdx > 0)                    openLightbox(lbIdx - 1);
      if (e.key === 'ArrowRight' && lbIdx < lbImages.length - 1)  openLightbox(lbIdx + 1);
      if (e.key === 'Escape') closeLb();
    });
  });
})();