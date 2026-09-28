/* =====================================================================
   JFL Studio 360 — V8 · Interacción
   Sin dependencias. Movimiento sutil, al servicio de la lectura.
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Intro (solo primera visita de la sesión)                         */
  /* ---------------------------------------------------------------- */
  if (root.classList.contains('intro-on')) {
    try { sessionStorage.setItem('jfl-intro', '1'); } catch (e) {}
    const endIntro = () => root.classList.remove('intro-on');
    document.querySelector('.intro')?.addEventListener('animationend', (e) => {
      if (e.animationName === 'introOut') endIntro();
    });
    setTimeout(endIntro, 2600); // red de seguridad
  }

  /* ---------------------------------------------------------------- */
  /* Tema: papel (claro) / tinta (oscuro)                             */
  /* ---------------------------------------------------------------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const syncThemeMeta = () => {
    themeMeta?.setAttribute('content', root.dataset.theme === 'dark' ? '#151338' : '#FBF3E3');
  };
  syncThemeMeta();
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('jfl-theme', next); } catch (e) {}
      syncThemeMeta();
    });
  });

  /* ---------------------------------------------------------------- */
  /* Menú mobile                                                      */
  /* ---------------------------------------------------------------- */
  const menuBtn = document.querySelector('[data-menu]');
  const nav = document.getElementById('site-nav');
  const setMenu = (open) => {
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (menuBtn) menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    nav?.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------------------------------------------------------------- */
  /* Header: filete inferior al hacer scroll                          */
  /* ---------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- */
  /* Aparición al scroll                                              */
  /* ---------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  // Escalonado: filas, etapas y cambios dentro de su lista
  revealEls.forEach((el) => {
    el.querySelectorAll(':scope .row, :scope .change, :scope .stage').forEach((child, i) => child.style.setProperty('--i', i));
  });
  // Escalonado entre hermanos de una misma grilla
  document.querySelectorAll('.certs, .swatches, .specimens, .cases, .hero-copy').forEach((grid) => {
    [...grid.children].filter((c) => c.hasAttribute('data-reveal')).forEach((c, i) => c.style.setProperty('--i', i % 4));
  });

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------- */
  /* Números                                                          */
  /* ---------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const pad = target < 10 ? 2 : 0;
    const fmt = (n) => String(n).padStart(pad, '0') + suffix;
    if (reduced) { el.textContent = fmt(target); return; }
    const start = performance.now();
    const dur = 1300;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  counters.forEach((el) => {
    const t = parseInt(el.dataset.count, 10) || 0;
    el.textContent = String(t).padStart(t < 10 ? 2 : 0, '0') + (el.dataset.suffix || '');
  });
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        runCounter(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------------------------------------------------------------- */
  /* Carrusel de trabajos (scroll-snap nativo)                        */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-track]');
    const items = [...track.children];
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    const current = carousel.querySelector('[data-current]');
    if (!items.length) return;

    const last = items.length - 1;
    let pos = 0;   // posición de destino (o actual) del recorrido
    let index = 0; // pieza que se muestra en el contador

    // Posición de cada pieza relativa a la primera (el padding lateral lo resuelve el snap)
    const offsetOf = (i) => items[i].offsetLeft - items[0].offsetLeft;
    const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const nearestTo = (x) => items.reduce((best, _, i) => (Math.abs(offsetOf(i) - x) < Math.abs(offsetOf(best) - x) ? i : best), 0);
    // Las últimas piezas no llegan a alinearse al inicio: el final del recorrido cuenta como la última
    const indexAt = (x) => (x >= maxScroll() - 2 ? last : nearestTo(x));

    const render = () => {
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      if (prev) prev.disabled = pos <= 2;
      if (next) next.disabled = pos >= maxScroll() - 2;
    };
    const scrollToLeft = (left) => {
      const from = track.scrollLeft;
      const target = pos = Math.max(0, Math.min(left, maxScroll()));
      index = indexAt(pos);
      track.scrollTo({ left: pos, behavior: reduced ? 'auto' : 'smooth' });
      render();
      // Red de seguridad: si el scroll suave no arrancó (pestaña sin pintar, navegador sin soporte), posiciona directo
      if (!reduced) setTimeout(() => {
        if (pos === target && Math.abs(track.scrollLeft - from) < 1 && Math.abs(target - from) > 2) track.scrollTo({ left: target, behavior: 'auto' });
      }, 450);
    };
    const goNext = () => {
      const t = items.findIndex((_, i) => offsetOf(i) > pos + 2);
      scrollToLeft(t === -1 ? maxScroll() : offsetOf(t));
    };
    const goPrev = () => {
      let t = -1;
      items.forEach((_, i) => { if (offsetOf(i) < pos - 2) t = i; });
      scrollToLeft(t === -1 ? 0 : offsetOf(t));
    };
    // Deslizamiento manual (touch, trackpad): sincroniza cuando el scroll se asienta
    const sync = () => { pos = track.scrollLeft; index = indexAt(pos); render(); };

    prev?.addEventListener('click', goPrev);
    next?.addEventListener('click', goNext);
    if ('onscrollsnapchange' in window) track.addEventListener('scrollsnapchange', sync);
    if ('onscrollend' in window) track.addEventListener('scrollend', sync);
    else {
      let t;
      track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(sync, 140); }, { passive: true });
    }
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    });
    window.addEventListener('resize', sync, { passive: true });
    render();
  });

  /* ---------------------------------------------------------------- */
  /* Filtros de trabajos                                              */
  /* ---------------------------------------------------------------- */
  const cases = [...document.querySelectorAll('[data-cases] .case')];
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  if (cases.length && filterBtns.length) {
    const shown = document.querySelector('[data-shown]');
    const empty = document.querySelector('[data-empty]');
    const matches = (c, key) => key === 'all' || (c.dataset.cat || '').split(/\s+/).includes(key);

    filterBtns.forEach((btn) => {
      const n = cases.filter((c) => matches(c, btn.dataset.filter)).length;
      const sup = btn.querySelector('sup');
      if (sup) sup.textContent = String(n).padStart(2, '0');
    });

    const apply = (key, updateUrl) => {
      if (!filterBtns.some((b) => b.dataset.filter === key)) key = 'all';
      let count = 0;
      cases.forEach((c) => {
        const on = matches(c, key);
        c.hidden = !on;
        if (on) { count++; c.classList.add('is-in'); }
      });
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
      if (shown) shown.textContent = String(count).padStart(2, '0');
      if (empty) empty.hidden = count > 0;
      if (updateUrl) {
        const url = new URL(window.location.href);
        if (key === 'all') url.searchParams.delete('f'); else url.searchParams.set('f', key);
        url.hash = '';
        history.replaceState(null, '', url);
      }
    };
    filterBtns.forEach((btn) => btn.addEventListener('click', () => apply(btn.dataset.filter, true)));
    const initial = new URLSearchParams(window.location.search).get('f');
    if (initial) apply(initial, false);
  }

  /* ---------------------------------------------------------------- */
  /* Formulario: arma el mail listo para enviar                       */
  /* ---------------------------------------------------------------- */
  const form = document.querySelector('[data-contact-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const type = String(data.get('type') || 'Sin definir');
    const message = String(data.get('message') || '').trim();
    const subject = `Consulta JFL Studio 360 — ${type}`;
    const body = `Hola JFL Studio 360,\n\n${message}\n\n—\nNombre: ${name}\nEmail: ${email}\nNecesito: ${type}`;
    const status = form.querySelector('[data-form-status]');
    if (status) status.textContent = 'Abriendo tu correo con el mensaje listo…';
    window.location.href = `mailto:jflstudio360@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------------------------------------------------------------- */
  /* Año del footer                                                   */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------------------------------------------------------------- */
  /* Protección básica de imágenes (disuade descargas casuales)       */
  /* ---------------------------------------------------------------- */
  const protectedSel = '.frame, .photo, .palette-logo';
  document.querySelectorAll('img').forEach((img) => img.setAttribute('draggable', 'false'));
  ['contextmenu', 'dragstart'].forEach((evt) => {
    document.addEventListener(evt, (e) => { if (e.target.closest?.(protectedSel)) e.preventDefault(); });
  });
})();
