(() => {
    'use strict';
    const nav = document.getElementById('jumpNav');
    if (!nav) return;
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const list = nav.querySelector('ul');
    const rows = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (!rows.length || !('IntersectionObserver' in window)) return;

    function setActive(id) {
        links.forEach(a => {
            const on = a.getAttribute('href') === '#' + id;
            a.classList.toggle('active', on);
            if (on) {
                a.setAttribute('aria-current', 'true');
                // keep the active chip visible in the scrollable menu on small screens
                const target = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
                if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: target, behavior: 'smooth' });
            } else {
                a.removeAttribute('aria-current');
            }
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    rows.forEach(r => observer.observe(r));
})();