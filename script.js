/* =====================================================================
   JFL Studio 360 — V7 · Motor de interacción (Motion)
   Multi-página · reveals scrubeados · parallax · transiciones de página.
   Si Motion o JS fallan, el contenido permanece visible (degradado seguro).
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const M = window.Motion || null;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const EASE = [0.22, 0.61, 0.36, 1];

  // Red de seguridad: si algo falla, mostramos todo lo oculto por reveal.
  const showAll = () => {
    document.querySelectorAll('[data-reveal], .reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
    document.querySelectorAll('.line-mask > span').forEach((s) => { s.style.transform = 'none'; });
  };
  if (!M || prefersReduced) showAll();

  /* ---------------------------------------------------------------- */
  /* Preloader                                                        */
  /* ---------------------------------------------------------------- */
  const pre = document.querySelector('[data-preloader]');
  if (pre) {
    let exited = false;
    const finish = () => { pre.classList.add('is-hidden'); root.classList.remove('pl-active'); };
    const exitLoader = () => {
      if (exited) return; exited = true;
      try { sessionStorage.setItem('jfl-loaded', '1'); } catch (e) {}
      const stage = pre.querySelector('.pl-stage');
      const top = pre.querySelector('.pl-panel--top');
      const bot = pre.querySelector('.pl-panel--bottom');
      if (M && !prefersReduced) {
        if (stage) M.animate(stage, { opacity: [1, 0], scale: [1, 1.06] }, { duration: 0.4, ease: EASE });
        if (top) M.animate(top, { y: ['0%', '-101%'] }, { duration: 0.72, delay: 0.16, ease: [0.76, 0, 0.24, 1] });
        let ctrl;
        if (bot) ctrl = M.animate(bot, { y: ['0%', '101%'] }, { duration: 0.72, delay: 0.16, ease: [0.76, 0, 0.24, 1] });
        const p = ctrl && ctrl.finished;
        if (p && p.then) p.then(finish).catch(finish);
        setTimeout(finish, 1150); // red de seguridad
      } else { finish(); }
    };

    if (root.classList.contains('pl-active')) {
      const countEl = pre.querySelector('[data-pl-count]');
      const arc = pre.querySelector('.pl-ring-arc');
      const C = 2 * Math.PI * 52;
      if (arc) { arc.style.strokeDasharray = String(C); arc.style.strokeDashoffset = String(C); }
      if (prefersReduced) {
        if (countEl) countEl.textContent = '100';
        if (arc) arc.style.strokeDashoffset = '0';
        setTimeout(exitLoader, 240);
      } else {
        const duration = 1300, start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          if (countEl) countEl.textContent = String(Math.round(eased * 100));
          if (arc) arc.style.strokeDashoffset = String(C * (1 - eased));
          if (t < 1) requestAnimationFrame(tick); else exitLoader();
        };
        requestAnimationFrame(tick);
      }
      setTimeout(() => { if (!exited) exitLoader(); }, 4200); // nunca atrapar al usuario
    } else {
      pre.classList.add('is-hidden');
    }
  }

  /* ---------------------------------------------------------------- */
  /* Cursor glow + spotlight                                          */
  /* ---------------------------------------------------------------- */
  if (finePointer) {
    window.addEventListener('pointermove', (e) => {
      root.style.setProperty('--x', `${e.clientX}px`);
      root.style.setProperty('--y', `${e.clientY}px`);
    }, { passive: true });
    document.querySelectorAll('.spotlight').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }, { passive: true });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Tema claro / oscuro                                              */
  /* ---------------------------------------------------------------- */
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('jfl-theme', next); } catch (e) {}
  });

  /* ---------------------------------------------------------------- */
  /* Menú móvil                                                       */
  /* ---------------------------------------------------------------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    navLinks?.classList.toggle('is-open', !open);
  });
  navLinks?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle?.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    });
  });

  /* ---------------------------------------------------------------- */
  /* Header scroll + barra de progreso                                */
  /* ---------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- */
  /* Nav activo por página (multi-página) + por sección (anclas)      */
  /* ---------------------------------------------------------------- */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith(here) || (here === 'index.html' && (href === './' || href === 'index.html'))) {
      a.classList.add('is-current');
    }
  });
  const anchorItems = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (anchorItems.length) {
    const secs = anchorItems.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) anchorItems.forEach((it) => it.classList.toggle('is-active', it.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-34% 0px -60% 0px' });
    secs.forEach((s) => so.observe(s));
  }

  /* ---------------------------------------------------------------- */
  /* Reveals con Motion (inView + keyframes explícitos)               */
  /* ---------------------------------------------------------------- */
  const revealKeyframes = (type) => {
    switch (type) {
      case 'fade':  return { opacity: [0, 1] };
      case 'scale': return { opacity: [0, 1], scale: [0.94, 1] };
      case 'left':  return { opacity: [0, 1], x: [-44, 0] };
      case 'right': return { opacity: [0, 1], x: [44, 0] };
      case 'blur':  return { opacity: [0, 1], y: [20, 0], filter: ['blur(14px)', 'blur(0px)'] };
      default:      return { opacity: [0, 1], y: [38, 0] }; // up
    }
  };

  if (M && !prefersReduced) {
    // Stagger dentro de grids: calcula índice entre hermanos reveal.
    const allReveals = [...document.querySelectorAll('[data-reveal], .reveal')];
    allReveals.forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      const parent = el.parentElement;
      const siblings = parent ? [...parent.querySelectorAll(':scope > [data-reveal], :scope > .reveal')] : [el];
      const idx = Math.max(siblings.indexOf(el), 0);
      const baseDelay = parseFloat(el.dataset.revealDelay || '0');
      const delay = baseDelay + idx * 0.07;
      const type = el.dataset.reveal || 'up';
      let done = false;
      M.inView(el, () => {
        if (done) return; done = true;
        M.animate(el, revealKeyframes(type), { duration: 0.85, delay, ease: EASE });
      }, { amount: 0.18 });
    });

    // Big-type: líneas con máscara (stagger por línea)
    document.querySelectorAll('[data-lines]').forEach((wrap) => {
      const spans = wrap.querySelectorAll('.line-mask > span');
      let done = false;
      M.inView(wrap, () => {
        if (done) return; done = true;
        M.animate(spans, { y: ['110%', '0%'] }, { duration: 0.9, delay: M.stagger ? M.stagger(0.08) : 0, ease: EASE });
      }, { amount: 0.3 });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Parallax al scroll (elementos sin transform de hover)            */
  /* ---------------------------------------------------------------- */
  if (M && M.scroll && !prefersReduced) {
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const range = parseFloat(el.dataset.parallax) || 60;
      M.scroll((p) => { el.style.transform = `translate3d(0, ${(p - 0.5) * range}px, 0)`; },
        { target: el, offset: ['start end', 'end start'] });
    });

    // Hero container-scroll (estilo Aceternity): el título sube y la
    // tarjeta-logo rota en 3D (16°→0°) y escala a medida que se baja.
    const csSection = document.querySelector('[data-cs]');
    const csHeader = csSection && csSection.querySelector('[data-cs-header]');
    const csCard = csSection && csSection.querySelector('[data-cs-card]');
    if (csSection && csCard) {
      const mobile = () => window.innerWidth <= 768;
      M.scroll((p) => {
        const rot = 16 * (1 - p);
        const sc = mobile() ? (0.86 + 0.14 * p) : (1.05 - 0.05 * p);
        csCard.style.transform = `rotateX(${rot}deg) scale(${sc})`;
        if (csHeader) { csHeader.style.transform = `translateY(${-110 * p}px)`; csHeader.style.opacity = String(1 - p * 0.55); }
      }, { target: csSection, offset: ['start start', 'end end'] });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Contadores animados                                              */
  /* ---------------------------------------------------------------- */
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) { el.textContent = `${target}${suffix}`; return; }
    const duration = 1500, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  document.querySelectorAll('[data-count]').forEach((el) => {
    if (M && M.inView) {
      let done = false;
      M.inView(el, () => { if (done) return; done = true; runCounter(el); }, { amount: 0.6 });
    } else {
      const o = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { runCounter(el); o.unobserve(el); } }), { threshold: 0.6 });
      o.observe(el);
    }
  });

  /* ---------------------------------------------------------------- */
  /* Tilt 3D de tarjetas                                              */
  /* ---------------------------------------------------------------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll('[data-tilt],[data-cursor-card]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 9}deg)`;
        card.style.setProperty('--cx', `${px * 100}%`);
        card.style.setProperty('--cy', `${py * 100}%`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.setProperty('--cx', '50%'); card.style.setProperty('--cy', '50%');
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Botones magnéticos                                               */
  /* ---------------------------------------------------------------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => {
        if (M) M.animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 320, damping: 22 });
        else el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Slider de destacados                                             */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]');
    const slides = [...track.children];
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');
    const dotsWrap = slider.querySelector('[data-slider-dots]');
    if (!slides.length) return;
    let index = 0, autoplay;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button'; dot.setAttribute('role', 'tab'); dot.setAttribute('aria-label', `Ir al trabajo ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
    });
    const dots = dotsWrap ? [...dotsWrap.children] : [];

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => { d.classList.toggle('is-active', i === index); d.setAttribute('aria-selected', String(i === index)); });
    };
    const goTo = (i) => { index = (i + slides.length) % slides.length; render(); restart(); };
    const next = () => goTo(index + 1), prev = () => goTo(index - 1);
    nextBtn?.addEventListener('click', next);
    prevBtn?.addEventListener('click', prev);

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    const startAutoplay = () => { if (prefersReduced) return; autoplay = setInterval(next, 5500); };
    const stopAutoplay = () => clearInterval(autoplay);
    const restart = () => { stopAutoplay(); startAutoplay(); };
    slider.addEventListener('pointerenter', stopAutoplay);
    slider.addEventListener('pointerleave', startAutoplay);
    document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());

    let startX = 0, dragging = false, moved = 0;
    const viewport = slider.querySelector('.slider-viewport') || track;
    viewport.addEventListener('pointerdown', (e) => { dragging = true; startX = e.clientX; moved = 0; track.classList.add('no-anim'); stopAutoplay(); });
    window.addEventListener('pointermove', (e) => { if (!dragging) return; moved = e.clientX - startX; track.style.transform = `translateX(calc(-${index * 100}% + ${moved}px))`; });
    window.addEventListener('pointerup', () => {
      if (!dragging) return; dragging = false; track.classList.remove('no-anim');
      if (Math.abs(moved) > 60) (moved < 0 ? next() : prev()); else { render(); startAutoplay(); }
    });

    render(); startAutoplay();
  });

  /* ---------------------------------------------------------------- */
  /* Galería horizontal (flechas)                                     */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-hgallery]').forEach((wrap) => {
    const lane = wrap.querySelector('.hgallery');
    if (!lane) return;
    const step = () => Math.min(lane.clientWidth * 0.8, 540);
    wrap.querySelector('[data-hnext]')?.addEventListener('click', () => lane.scrollBy({ left: step(), behavior: 'smooth' }));
    wrap.querySelector('[data-hprev]')?.addEventListener('click', () => lane.scrollBy({ left: -step(), behavior: 'smooth' }));
  });

  /* ---------------------------------------------------------------- */
  /* Sticky storytelling: paso activo                                 */
  /* ---------------------------------------------------------------- */
  const storySteps = [...document.querySelectorAll('.story-step')];
  const storyBtns = [...document.querySelectorAll('.aside-progress button')];
  if (storySteps.length && storyBtns.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = storySteps.indexOf(entry.target);
        storyBtns.forEach((b, bi) => b.classList.toggle('is-active', bi === i));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    storySteps.forEach((s) => so.observe(s));
    storyBtns.forEach((b, i) => b.addEventListener('click', () => storySteps[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })));
  }

  /* ---------------------------------------------------------------- */
  /* Filtros de portfolio                                             */
  /* ---------------------------------------------------------------- */
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project-card');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((it) => it.classList.remove('is-active'));
      button.classList.add('is-active');
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        const cats = project.dataset.category || '';
        const hide = filter !== 'all' && !cats.includes(filter);
        project.classList.toggle('is-hidden', hide);
        if (!hide && M && !prefersReduced) M.animate(project, { opacity: [0.4, 1], scale: [0.97, 1] }, { duration: 0.4, ease: EASE });
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /* Transiciones de página (velo) para navegadores sin View Trans.   */
  /* ---------------------------------------------------------------- */
  const supportsVT = 'startViewTransition' in document;
  const veil = document.querySelector('.page-veil');
  if (!supportsVT && veil && !prefersReduced) {
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const internal = /\.html(\?.*)?$/.test(href) && !a.target && !href.startsWith('http');
      if (!internal) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        veil.classList.add('is-up');
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });
    // Entrada: bajar el velo al cargar
    window.addEventListener('pageshow', () => {
      veil.classList.remove('is-up'); veil.classList.add('is-down');
      requestAnimationFrame(() => { veil.style.transition = 'transform .5s ' + 'cubic-bezier(.22,.61,.36,1)'; });
      setTimeout(() => { veil.classList.remove('is-down'); veil.style.transition = ''; }, 520);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Formulario de contacto → compone un mailto                       */
  /* ---------------------------------------------------------------- */
  const contactForm = document.querySelector('[data-contact-form]');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const type = (data.get('type') || '').toString();
    const message = (data.get('message') || '').toString().trim();
    const subject = `Consulta JFL Studio 360${type ? ' — ' + type : ''}`;
    const body = `Hola JFL Studio 360,\n\n${message}\n\n—\nNombre: ${name}\nEmail: ${email}\nProyecto: ${type}`;
    const href = `mailto:jflstudio360@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = contactForm.querySelector('[data-form-status]');
    if (status) status.textContent = 'Abriendo tu cliente de correo…';
    window.location.href = href;
  });

  /* ---------------------------------------------------------------- */
  /* Año del footer                                                   */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------------------------------------------------------------- */
  /* Protección básica de imágenes                                    */
  /* ---------------------------------------------------------------- */
  const protectedSelectors = 'img, .media, .mosaic, .hero-brand-card, .formation-media, .project-card, .slide-media, .hcard-media, .feature-media';
  document.querySelectorAll('img').forEach((img) => {
    img.setAttribute('draggable', 'false');
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
  ['contextmenu', 'dragstart'].forEach((evt) => {
    document.addEventListener(evt, (event) => { if (event.target.closest(protectedSelectors)) event.preventDefault(); });
  });
})();
