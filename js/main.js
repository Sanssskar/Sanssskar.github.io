// ============================================
// main.js — Fixed: no flicker, no phantom scroll
// ============================================

// ============================================
// 1. LOADER
// ============================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loaderWrapper');
    if (!loader) return;
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }, 800);
});


// ============================================
// 2. SCROLL ANIMATIONS — FLICKER FIX
//
// Root causes of old flicker:
//   a) Elements visible on load were being observed → flash on first tick
//   b) rootMargin: '-100px' caused elements near fold to flicker in/out
//   c) Footer children had !important in JS (doesn't work) → kept animating
//   d) Double-trigger: observer fired AND getBoundingClientRect() ran in same tick
//
// Fix strategy:
//   - Mark elements visible BEFORE attaching observer (no flash)
//   - Use a single rAF gate so observer doesn't fire until paint settles
//   - Skip footer/header elements entirely via data attribute
//   - Use `once: true` equivalent via unobserve after trigger
// ============================================
document.addEventListener('DOMContentLoaded', () => {

    const animatedEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-up');

    // ✅ FIX A: Elements already visible on load — mark them IMMEDIATELY,
    // before the observer is even created, so there's zero flicker.
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

    // ✅ FIX B: Observer only runs for elements NOT yet visible
    // threshold:0.1 (not 0.2) = trigger slightly earlier, less jarring
    // rootMargin: '0px' — no negative margin that caused in/out flicker
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

    // ✅ FIX D: Force footer visible with inline styles (JS !important trick doesn't work)
    // Use setAttribute style so specificity beats any CSS rule
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


// ============================================
// 3. SPARK EFFECT
// Moved sparks to use fixed positioning to avoid
// layout reflow that caused scroll jitter
// ============================================
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

// ✅ FIX: Hover sparks used getBoundingClientRect which forces reflow.
// Now we use mousemove center coords to avoid forced layout
document.querySelectorAll(
    '.project-card, .skill-bubble, .social-card, .service-card, .blog-card, .preview-card, .blog-preview-card'
).forEach(c => {
    c.addEventListener('mouseenter', (e) => {
        createSparks(e.clientX, e.clientY);
    });
});


// ============================================
// 4. DARK MODE TOGGLE
// ============================================
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


// ============================================
// 5. FLIP NAME ANIMATION
// ============================================
const flipName = document.getElementById('flipName');
if (flipName) {
    flipName.addEventListener('click', (e) => {
        e.stopPropagation();
        flipName.classList.toggle('flip');
    });
}


// ============================================
// 6. TYPING EFFECT
// ============================================
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


// ============================================
// 7. MORPH EFFECT (kept for future use)
// ============================================
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


// ============================================
// 8. SWIPEABLE IMAGE
// ============================================
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


// ============================================
// 9. MUSIC PLAYER
// ============================================
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const musicText = document.getElementById('music-text');
let isPlaying = false;

window.toggleMusic = function () {
    if (!bgMusic) return;
    if (isPlaying) {
        bgMusic.pause();
        if (musicIcon) musicIcon.classList.replace('fa-pause', 'fa-play');
        if (musicText) musicText.textContent = 'Play';
    } else {
        bgMusic.play().catch(() => {});
        if (musicIcon) musicIcon.classList.replace('fa-play', 'fa-pause');
        if (musicText) musicText.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
};