
window.addEventListener('load', () => {
    const loader = document.getElementById('loaderWrapper');
    if (!loader) return;
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }, 800);
});



document.addEventListener('DOMContentLoaded', () => {

    const animatedEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-up');


    animatedEls.forEach(el => {
        // Skip footer descendants entirely
        if (el.closest('footer') || el.closest('header')) {
            el.style.cssText = 'opacity:1 !important; transform:none !important; transition:none !important;';
            return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Already visible — add class without any transition delay
            el.classList.add('no-transition', 'visible');
            // Remove no-transition after one frame so future re-visits animate
            requestAnimationFrame(() => el.classList.remove('no-transition'));
        }
    });


    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            if (entry.target.closest('footer') || entry.target.closest('header')) return;
            if (entry.target.classList.contains('visible')) return;

            entry.target.classList.add('visible');
            // ✅ FIX C: Unobserve immediately — prevents re-trigger on scroll back up
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px'   // ← was '-100px', caused flicker at fold
    });

    animatedEls.forEach(el => {
        if (el.closest('footer') || el.closest('header')) return;
        if (el.classList.contains('visible')) return; // already handled above
        observer.observe(el);
    });


    document.querySelectorAll('footer, footer *').forEach(el => {
        el.setAttribute('style', [
            el.getAttribute('style') || '',
            'opacity:1',
            'transform:none',
            'transition:none',
            'animation:none'
        ].filter(Boolean).join(';'));
    });
});



function createSparks(x, y) {
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('div');
        s.className = 'spark';
        // ✅ FIX: Use fixed positioning — avoids layout shift / scroll jitter
        s.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
        `;
        s.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
        s.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
        const size = 2 + Math.random() * 4;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1000);
    }
}

document.addEventListener('click', (e) => createSparks(e.clientX, e.clientY));


document.querySelectorAll(
    '.project-card, .skill-bubble, .social-card, .service-card, .blog-card, .preview-card, .blog-preview-card'
).forEach(c => {
    c.addEventListener('mouseenter', (e) => {
        createSparks(e.clientX, e.clientY);
    });
});


const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

// Apply saved theme before paint to avoid flash
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        if (themeIcon) {
            isDark
                ? themeIcon.classList.replace('fa-moon', 'fa-sun')
                : themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}



const flipName = document.getElementById('flipName');
if (flipName) {
    flipName.addEventListener('click', (e) => {
        e.stopPropagation();
        flipName.classList.toggle('flip');
    });
}



const typingElement = document.getElementById('typingName');
if (typingElement) {
    const words = ['Sanskar', 'संस्कार'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;

    function typeEffect() {
        const w = words[wordIndex];
        typingElement.textContent = isDeleting
            ? w.substring(0, charIndex - 1)
            : w.substring(0, charIndex + 1);

        isDeleting ? charIndex-- : charIndex++;

        if (!isDeleting && charIndex === w.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typeEffect, 500);
        } else {
            setTimeout(typeEffect, isDeleting ? 100 : 200);
        }
    }
    setTimeout(typeEffect, 500);
}


const morphElement = document.getElementById('morphName');
if (morphElement) {
    const morphWords = ['Sanskar', 'संस्कार'];
    let morphIndex = 0;

    function morphEffect() {
        morphElement.style.opacity = '0';
        morphElement.style.transform = 'scale(0.8)';
        setTimeout(() => {
            morphIndex = (morphIndex + 1) % morphWords.length;
            morphElement.textContent = morphWords[morphIndex];
            morphElement.style.opacity = '1';
            morphElement.style.transform = 'scale(1)';
        }, 300);
        setTimeout(morphEffect, 3000);
    }
    setTimeout(morphEffect, 1000);
}


const swipeableShape = document.getElementById('swipeableShape');
const image1 = document.getElementById('image1');
const image2 = document.getElementById('image2');
const imageCounter = document.getElementById('imageCounter');

if (swipeableShape && image1 && image2) {
    let isImage1Active = true;

    document.querySelectorAll('.swipe-image').forEach(img => {
        if (img.complete) img.classList.add('loaded');
        else img.addEventListener('load', () => img.classList.add('loaded'));
    });

    swipeableShape.addEventListener('click', (e) => {
        if (isImage1Active) {
            image1.classList.remove('active-image');
            image2.classList.add('active-image');
            if (imageCounter) imageCounter.textContent = '2/2';
        } else {
            image2.classList.remove('active-image');
            image1.classList.add('active-image');
            if (imageCounter) imageCounter.textContent = '1/2';
        }
        isImage1Active = !isImage1Active;
        // Use click coords directly — no getBoundingClientRect reflow
        createSparks(e.clientX, e.clientY);
    });
}


// Dropdown toggle
// ── Dropdown Portal Fix ──
document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    if (!toggle || !menu) return;

    // Move menu to body so backdrop-filter stacking context can't trap it
    document.body.appendChild(menu);
    menu.style.position = 'fixed';

    function positionMenu() {
        const rect = toggle.getBoundingClientRect();
        const menuWidth = menu.offsetWidth || 155;
        let left = rect.left + rect.width / 2 - menuWidth / 2;
        // keep inside viewport
        if (left < 8) left = 8;
        if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.left = left + 'px';
    }

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) positionMenu();
    });

    // Reposition on scroll/resize
    window.addEventListener('scroll', () => {
        if (menu.classList.contains('open')) positionMenu();
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (menu.classList.contains('open')) positionMenu();
    });
});

// Close on outside click
document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
        if (!menu.contains(e.target) && !e.target.closest('.nav-dropdown')) {
            menu.classList.remove('open');
            const toggle = document.querySelector('.dropdown-toggle[aria-expanded="true"]');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    });
});