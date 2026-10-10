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

    /* ---------- Smart header: hides on scroll down, returns on scroll up ---------- */
    function initSmartHeader() {
        const header = document.querySelector('header');
        const navItems = document.querySelectorAll('.main-navbar .nav-links li');
        const logoLink = document.querySelector('.nav-bar > a');
        const teamBtn = document.querySelector('.team-btn');
        const themeBtn = document.getElementById('themeToggle');
        if (!header || !navItems.length) return;

        const bar = document.createElement('div');
        bar.className = 'smart-bar';
        bar.setAttribute('aria-hidden', 'true');

        if (logoLink) bar.appendChild(logoLink.cloneNode(true));

        const nav = document.createElement('nav');
        nav.className = 'smart-nav';
        nav.setAttribute('aria-label', 'Quick navigation');
        const ul = document.createElement('ul');
        ul.className = 'nav-links';
        navItems.forEach(li => ul.appendChild(li.cloneNode(true)));
        nav.appendChild(ul);
        bar.appendChild(nav);

        const controls = document.createElement('div');
        controls.className = 'smart-controls';
        if (teamBtn) controls.appendChild(teamBtn.cloneNode(true));

        let themeClone = null;
        if (themeBtn) {
            themeClone = document.createElement('button');
            themeClone.type = 'button';
            themeClone.className = 'glass-btn';
            themeClone.setAttribute('aria-label', 'Toggle dark/light theme');
            themeClone.innerHTML = '<i class="fa-regular fa-moon" aria-hidden="true"></i>';
            const syncIcon = () => {
                const isDark = root.classList.contains('dark-mode');
                const i = themeClone.querySelector('i');
                i.classList.toggle('fa-sun', isDark);
                i.classList.toggle('fa-moon', !isDark);
                themeClone.setAttribute('aria-pressed', String(isDark));
            };
            syncIcon();
            // reuse the original toggle so theme + localStorage logic stays in one place
            themeClone.addEventListener('click', () => { themeBtn.click(); syncIcon(); });
            themeBtn.addEventListener('click', syncIcon);
            controls.appendChild(themeClone);
        }
        bar.appendChild(controls);
        document.body.appendChild(bar);

        const DELTA = 8;
        let lastY = window.scrollY;
        let shown = false;
        let ticking = false;

        const setShown = (v) => {
            if (v === shown) return;
            shown = v;
            bar.classList.toggle('is-visible', v);
            bar.setAttribute('aria-hidden', String(!v));
        };

        const update = () => {
            ticking = false;
            const y = Math.max(window.scrollY, 0);
            if (y <= header.offsetHeight) {   // original header is still in view
                setShown(false);
                lastY = y;
                return;
            }
            if (Math.abs(y - lastY) < DELTA) return;
            setShown(y < lastY);              // scrolling up -> show, down -> hide
            lastY = y;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
    }

    function init() {
        initReveal();
        initTheme();
        initSmartHeader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();