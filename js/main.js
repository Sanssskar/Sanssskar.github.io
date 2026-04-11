// main.js - Shared functionality for all pages

// Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loaderWrapper');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    }
});

// ==================== IMPROVED INTERSECTION OBSERVER (FOOTER FLICKER FIXED) ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Strong exclusion for footer and its children
        if (entry.isIntersecting && 
            !entry.target.classList.contains('visible') && 
            !entry.target.closest('footer')) {
            
            entry.target.classList.add('visible');
        }
    });
}, { 
    threshold: 0.2, 
    rootMargin: '0px 0px -100px 0px' 
});

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-up');
    
    animatedElements.forEach(el => {
        // Completely skip footer and all its descendants
        if (el.closest('footer')) {
            // Force disable any animation on footer elements
            el.style.transition = 'none';
            el.style.animation = 'none';
            el.style.opacity = '1';
            el.style.transform = 'none';
            return;
        }
        
        observer.observe(el);
        
        // Show elements already in viewport on load
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
            el.classList.add('visible');
        }
    });

    // Extra protection for footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.opacity = '1';
        footer.style.transform = 'none';
        
        footer.querySelectorAll('*').forEach(child => {
            child.style.transition = 'none !important';
            child.style.animation = 'none !important';
            child.style.opacity = '1';
            child.style.transform = 'none';
        });
    }
});

// Spark Effect
function createSparks(x, y) {
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('div');
        s.className = 'spark';
        s.style.left = x + 'px';
        s.style.top = y + 'px';
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

// Hover sparks
document.querySelectorAll('.project-card, .skill-bubble, .social-card, .service-card, .blog-card, .preview-card, .blog-preview-card').forEach(c => {
    c.addEventListener('mouseenter', () => {
        const r = c.getBoundingClientRect();
        createSparks(r.left + r.width / 2, r.top + r.height / 2);
    });
});

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Flip Name Animation
const flipName = document.getElementById('flipName');
if (flipName) {
    flipName.addEventListener('click', (e) => {
        e.stopPropagation();
        flipName.classList.toggle('flip');
    });
}

// Typing Effect
const typingElement = document.getElementById('typingName');
if (typingElement) {
    const words = ['Sanskar', 'संस्कार'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    
    function typeEffect() {
        const w = words[wordIndex];
        typingElement.textContent = isDeleting ? w.substring(0, charIndex - 1) : w.substring(0, charIndex + 1);
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

// Morph Effect (Note: You have #morphName but it's not in HTML - keeping it for future)
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

// Swipeable Image
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
    
    swipeableShape.addEventListener('click', () => {
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
        const r = swipeableShape.getBoundingClientRect();
        createSparks(r.left + r.width / 2, r.top + r.height / 2);
    });
}

// Music Player
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const musicText = document.getElementById('music-text');
let isPlaying = false;

window.toggleMusic = function() {
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