/* Decorative only: name glitch + three katanas striking the photo, which flickers into code.
   Everything is built here with SVG/JS, so none of it is in the page's HTML text (SEO-safe). */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  /* ---- Name glitch: every 2 seconds ---- */
  const nm = document.getElementById('typingName');
  if (nm) (function g() {
    setTimeout(() => {
      if (!document.hidden) { nm.classList.add('glitching'); setTimeout(() => nm.classList.remove('glitching'), 600); }
      g();
    }, 2000);
  })();

  /* ---- Katanas ---- */
  const hero = document.querySelector('.hero'), shape = document.getElementById('swipeableShape'), vis = document.querySelector('.hero-visual');
  if (!hero || !shape || !vis || !('animate' in Element.prototype)) return;

  const NS = 'http://www.w3.org/2000/svg', LEN = 198;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'sword-fx'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('data-nosnippet', '');
  const katana = (grip) => `<path d="M44 -3.2L178 -3.2Q192 -2.6 198 1.8L178 3.4L44 3.4Z" fill="#e8eef0" stroke="#78909c"/><path d="M50 1L176 1" stroke="#b0bec5" fill="none"/><ellipse cx="42" cy="0" rx="3.5" ry="10" fill="#c9a227" stroke="#7a5c00"/><rect x="0" y="-4" width="38" height="8" rx="2" fill="${grip}"/><path d="M6 -4L12 4M14 -4L20 4M22 -4L28 4M30 -4L36 4" stroke="#0006"/><circle r="4.4" fill="#c9a227"/>`;
  const GRIPS = ['#f4f4f0', '#263238', '#1b5e20'];
  const blades = GRIPS.map((c) => {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = katana(c); g.style.opacity = '0'; g.style.transformOrigin = '0 0'; g.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.25))';
    svg.append(g); return g;
  });
  hero.append(svg);

  /* photo swap: zoro on impact, pixel-sharpens back into me */
  const me = document.getElementById('image1'), wrap = shape.querySelector('.image-wrapper');
  let zoroOK = false;
  const zoro = new Image(); zoro.onload = () => { zoroOK = true; };
  const loadZoro = () => { if (!zoro.src) zoro.src = 'images/zoro.jpg'; };
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d'), tc = document.createElement('canvas'), tcx = tc.getContext('2d');
  cv.className = 'pix-layer'; cv.setAttribute('aria-hidden', 'true'); if (wrap) wrap.append(cv);
  let cs = 0;
  const paint = (src, px, glitch) => {
    const S = Math.round(wrap.clientWidth * Math.min(devicePixelRatio || 1, 2));
    if (cs !== S) { cs = S; cv.width = S; cv.height = S; }
    const iw = src.naturalWidth, ih = src.naturalHeight, side = Math.min(iw, ih), sx = (iw - side) / 2, sy = (ih - side) / 2;
    if (px <= 1) { ctx.imageSmoothingEnabled = true; ctx.drawImage(src, sx, sy, side, side, 0, 0, S, S); }
    else {
      const n = Math.max(2, Math.ceil(wrap.clientWidth / px)); tc.width = n; tc.height = n;
      tcx.drawImage(src, sx, sy, side, side, 0, 0, n, n);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(tc, 0, 0, n, n, 0, 0, S, S);
    }
    for (let k = 0; k < glitch; k++) {
      const y = Math.random() * S, h = S * (0.03 + Math.random() * 0.09), dx = (Math.random() - 0.5) * S * 0.2;
      ctx.drawImage(cv, 0, y, S, h, dx, y, S, h);
    }
  };
  async function swap() {
    if (!wrap || !zoroOK || !me.naturalWidth) return;
    cv.style.opacity = '1';
    for (const px of [24, 10, 1]) { paint(zoro, px, 4); await sleep(70); }
    for (let i = 0; i < 20; i++) { paint(zoro, 1, i % 5 === 4 ? 3 : 0); await sleep(100); }  // ~2s hold
    for (const px of [4, 10, 20, 30]) { paint(zoro, px, 3); await sleep(80); }
    const steps = [40, 30, 22, 16, 12, 9, 6, 4, 3, 2];  // 10 x 300ms = ~3s
    for (let i = 0; i < steps.length; i++) { paint(me, steps[i], Math.max(0, 4 - (i >> 1))); await sleep(300); }
    paint(me, 1, 0); await sleep(60); cv.style.opacity = '0';
  }

  let running = false, timer = 0, last = 0;
  const T = (x, y, a, s) => `translate(${x}px,${y}px) rotate(${a}deg) scale(${s})`;

  async function play() {
    if (running || document.hidden) return;
    running = true; schedule(15000);
    const hr = hero.getBoundingClientRect(), pr = shape.getBoundingClientRect();
    const tx = pr.left - hr.left + pr.width / 2, ty = pr.top - hr.top + pr.height / 2;
    const s = Math.max(0.55, Math.min(1, hr.width / 760)), L = LEN * s;

    blades.forEach((g, i) => {
      const o = i - 1, yo = o * 34 * s, a = Math.atan2(-yo, L) * 180 / Math.PI;
      const sx = -L - 60, sy = ty + o * 150 * s, sa = [-38, 22, -14][i];
      const ax = tx - L - 190 * s, strikeX = tx - L * Math.cos(a * Math.PI / 180) + 10 * s;
      /* ~3.95s: fly in slowly (1.3s) -> hover in place (2s) -> pull back -> strike -> fade */
      g.animate([
        { transform: T(sx, sy, sa, s), opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.04 },
        { transform: T(ax, ty + yo, 0, s), opacity: 1, offset: 0.329, easing: 'ease-in-out' },
        { transform: T(ax, ty + yo - 4 * s, 0, s), opacity: 1, offset: 0.54, easing: 'ease-in-out' },
        { transform: T(ax, ty + yo, 0, s), opacity: 1, offset: 0.7468, easing: 'ease-in-out' },
        { transform: T(ax - 22 * s, ty + yo, 0, s), opacity: 1, offset: 0.8354, easing: 'cubic-bezier(.6,0,1,.6)' },
        { transform: T(strikeX, ty + yo, a, s), opacity: 1, offset: 0.8987 },
        { transform: T(strikeX, ty + yo, a, s), opacity: 1, offset: 0.9367 },
        { transform: T(strikeX, ty + yo, a, s), opacity: 0, offset: 1 },
      ], { duration: 3950, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    });

    await sleep(3550 + 70);
    impact(tx, ty, s);
    swap().then(() => { running = false; });
    await sleep(600);
    blades.forEach((g) => { g.getAnimations().forEach((an) => an.cancel()); g.style.opacity = '0'; });
  }

  function impact(tx, ty, s) {
    const R = 120 * s, accent = ['#2e7d32', '#00a896', '#ff6b6b'];
    [-28, 0, 28].forEach((deg, i) => {
      const d = deg * Math.PI / 180, dx = Math.cos(d) * R, dy = Math.sin(d) * R;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${tx - dx} ${ty - dy}L${tx + dx} ${ty + dy}`); p.setAttribute('pathLength', '1');
      p.setAttribute('stroke', accent[i]); p.setAttribute('stroke-width', '3'); p.setAttribute('stroke-linecap', 'round');
      p.style.strokeDasharray = '1'; svg.append(p);
      p.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1, offset: 0.35 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 520, delay: i * 60, easing: 'ease-out' }).onfinish = () => p.remove();
    });
    const ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('cx', tx); ring.setAttribute('cy', ty); ring.setAttribute('r', 60 * s);
    ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#4caf50'); ring.setAttribute('stroke-width', '3');
    ring.style.transformBox = 'fill-box'; ring.style.transformOrigin = 'center'; svg.append(ring);
    ring.animate([{ transform: 'scale(.2)', opacity: 0.9 }, { transform: 'scale(2.2)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => ring.remove();

    for (let i = 0; i < 16; i++) {
      const t = document.createElementNS(NS, 'text'), a = Math.random() * 6.283, d = (70 + Math.random() * 110) * s;
      t.textContent = rnd(['{', '}', '</>', '$', '::', ';', '=>', '01']);
      t.setAttribute('x', tx); t.setAttribute('y', ty); t.setAttribute('fill', rnd(accent)); svg.append(t);
      t.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`, opacity: 0 }], { duration: 650 + Math.random() * 350, easing: 'ease-out' }).onfinish = () => t.remove();
    }

    if (wrap) wrap.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-3px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }], { duration: 320 });
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const r = hero.getBoundingClientRect();
      if (document.hidden || running || r.bottom < 0 || r.top > innerHeight) return schedule(1000);
      play();
    }, ms);
  }
  const boot = () => { loadZoro(); schedule(1600); };
  addEventListener('load', boot);
  if (document.readyState === 'complete') boot();
})();
