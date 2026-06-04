(() => {
  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Preloader                                                        */
  /* ---------------------------------------------------------------- */
  const preloader = document.querySelector('.preloader');
  const hidePreloader = () => preloader?.classList.add('is-hidden');
  window.addEventListener('load', () => setTimeout(hidePreloader, 420));
  // Safety net: never trap the user behind the loader.
  setTimeout(hidePreloader, 4000);

  /* ---------------------------------------------------------------- */
  /* Cursor glow                                                      */
  /* ---------------------------------------------------------------- */
  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--x', `${event.clientX}px`);
    root.style.setProperty('--y', `${event.clientY}px`);
  }, { passive: true });

  /* ---------------------------------------------------------------- */
  /* Theme toggle                                                     */
  /* ---------------------------------------------------------------- */
  const storedTheme = localStorage.getItem('jfl-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    localStorage.setItem('jfl-theme', next);
  });

  /* ---------------------------------------------------------------- */
  /* Mobile menu                                                      */
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
  /* Header scroll state + scroll progress bar                        */
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
  /* Reveal on scroll (with stagger inside grids)                     */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[class*="-grid"] .reveal').forEach((el, i) => {
    const within = [...el.parentElement.querySelectorAll(':scope > .reveal')].indexOf(el);
    el.style.setProperty('--reveal-delay', `${Math.max(within, 0) * 80}ms`);
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------------- */
  /* Active nav link                                                  */
  /* ---------------------------------------------------------------- */
  const navItems = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navItems.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navItems.forEach((item) => item.classList.toggle('is-active', item.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-34% 0px -60% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));

  /* ---------------------------------------------------------------- */
  /* Animated counters                                                */
  /* ---------------------------------------------------------------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = `${target}${suffix}`; return; }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  /* ---------------------------------------------------------------- */
  /* Hero logo card follows cursor (3D tilt)                          */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-cursor-card]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 9}deg)`;
      card.style.setProperty('--cx', `${px * 100}%`);
      card.style.setProperty('--cy', `${py * 100}%`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.setProperty('--cx', '50%');
      card.style.setProperty('--cy', '50%');
    });
  });

  /* ---------------------------------------------------------------- */
  /* Magnetic buttons                                                 */
  /* ---------------------------------------------------------------- */
  if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Featured slider                                                  */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-slider-track]');
    const slides = [...track.children];
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');
    const dotsWrap = slider.querySelector('[data-slider-dots]');
    if (slides.length === 0) return;

    let index = 0;
    let autoplay;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir al trabajo ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
    });
    const dots = dotsWrap ? [...dotsWrap.children] : [];

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    };
    const goTo = (i) => { index = (i + slides.length) % slides.length; render(); restart(); };
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    nextBtn?.addEventListener('click', next);
    prevBtn?.addEventListener('click', prev);

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    // Autoplay (pause on hover / when tab hidden / reduced motion)
    const startAutoplay = () => {
      if (prefersReduced) return;
      autoplay = setInterval(next, 5500);
    };
    const stopAutoplay = () => clearInterval(autoplay);
    const restart = () => { stopAutoplay(); startAutoplay(); };
    slider.addEventListener('pointerenter', stopAutoplay);
    slider.addEventListener('pointerleave', startAutoplay);
    document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());

    // Drag / swipe
    let startX = 0, dragging = false, moved = 0;
    const viewport = slider.querySelector('.slider-viewport') || track;
    viewport.addEventListener('pointerdown', (e) => {
      dragging = true; startX = e.clientX; moved = 0;
      track.classList.add('no-anim'); stopAutoplay();
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      moved = e.clientX - startX;
      track.style.transform = `translateX(calc(-${index * 100}% + ${moved}px))`;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('no-anim');
      if (Math.abs(moved) > 60) (moved < 0 ? next() : prev());
      else { render(); startAutoplay(); }
    });

    render();
    startAutoplay();
  });

  /* ---------------------------------------------------------------- */
  /* Portfolio filters                                                */
  /* ---------------------------------------------------------------- */
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project-card');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        const categories = project.dataset.category || '';
        project.classList.toggle('is-hidden', filter !== 'all' && !categories.includes(filter));
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /* Footer year                                                      */
  /* ---------------------------------------------------------------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------- */
  /* Basic image protection (deters casual downloads only)            */
  /* ---------------------------------------------------------------- */
  const protectedSelectors = 'img, .media, .mosaic, .hero-brand-card, .formation-media, .project-card, .slide-media';
  document.querySelectorAll('img').forEach((img) => {
    img.setAttribute('draggable', 'false');
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  });
  ['contextmenu', 'dragstart'].forEach((evt) => {
    document.addEventListener(evt, (event) => {
      if (event.target.closest(protectedSelectors)) event.preventDefault();
    });
  });
})();
