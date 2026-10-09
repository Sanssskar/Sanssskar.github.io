(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Loader ---------- */
    const LOADER_MIN_MS = 400;   // minimum time the loader stays after window load
    const LOADER_MAX_MS = 4000;  // never keep the page covered longer than this
    const loader = document.getElementById('loaderWrapper');

    if (loader) {
        let hidden = false;
        const hideLoader = () => {
            if (hidden) return;
            hidden = true;
            loader.style.pointerEvents = 'none';
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        };
        if (document.readyState === 'complete') {
            setTimeout(hideLoader, LOADER_MIN_MS);
        } else {
            window.addEventListener('load', () => setTimeout(hideLoader, LOADER_MIN_MS));
        }
        setTimeout(hideLoader, LOADER_MAX_MS);
    }

    /* ---------- Scroll reveal ---------- */
    function initReveal() {
        const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-up');
        const pending = [];

        els.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('no-transition', 'visible');
                requestAnimationFrame(() => el.classList.remove('no-transition'));
            } else {
                pending.push(el);
            }
        });

        if (!('IntersectionObserver' in window)) {
            pending.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1 });

        pending.forEach(el => observer.observe(el));
    }

    /* ---------- Sparks ---------- */
    const SPARK_TARGETS = '.project-card, .social-card, .preview-card';

    function createSparks(x, y) {
        if (reduceMotion) return;
        for (let i = 0; i < 8; i++) {
            const s = document.createElement('div');
            s.className = 'spark';
            s.style.cssText = `left:${x}px;top:${y}px;`;
            s.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
            s.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
            const size = 2 + Math.random() * 4;
            s.style.width = size + 'px';
            s.style.height = size + 'px';
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 1000);
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, ' + SPARK_TARGETS)) createSparks(e.clientX, e.clientY);
    });

    // one delegated listener instead of one per card; mirrors mouseenter (ignores moves between children)
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest(SPARK_TARGETS);
        if (card && !card.contains(e.relatedTarget)) createSparks(e.clientX, e.clientY);
    });

    /* ---------- Theme ---------- */
    // The saved theme is applied by a tiny inline script in <head> (prevents a flash of the light theme).
    function initTheme() {
        const toggle = document.getElementById('themeToggle');
        const icon = document.getElementById('themeIcon');

        const sync = () => {
            const isDark = root.classList.contains('dark-mode');
            if (icon) {
                icon.classList.toggle('fa-sun', isDark);
                icon.classList.toggle('fa-moon', !isDark);
            }
            if (toggle) toggle.setAttribute('aria-pressed', String(isDark));
        };
        sync();

        if (!toggle) return;
        toggle.addEventListener('click', () => {
            root.classList.toggle('dark-mode');
            sync();
            try {
                localStorage.setItem('theme', root.classList.contains('dark-mode') ? 'dark' : 'light');
            } catch (e) { /* storage blocked: theme just won't persist */ }
        });
    }

    function init() {
        initReveal();
        initTheme();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
