/* Decorative only: three katanas from the right strike the About photo, which flickers into Zoro and pixel-sharpens back.
   Everything is built here with SVG/canvas, so none of it is in the page's HTML text (SEO-safe). */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  const host = document.querySelector('.about-intro'), fig = document.querySelector('.about-photo'), me = fig && fig.querySelector('img');
  if (!host || !fig || !me || !('animate' in Element.prototype)) return;

  const NS = 'http://www.w3.org/2000/svg', LEN = 198;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'sword-fx'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('data-nosnippet', '');
  const katana = (grip) => `<path d="M44 -3.2L178 -3.2Q192 -2.6 198 1.8L178 3.4L44 3.4Z" fill="#e8eef0" stroke="#78909c"/><path d="M50 1L176 1" stroke="#b0bec5" fill="none"/><ellipse cx="42" cy="0" rx="3.5" ry="10" fill="#c9a227" stroke="#7a5c00"/><rect x="0" y="-4" width="38" height="8" rx="2" fill="${grip}"/><path d="M6 -4L12 4M14 -4L20 4M22 -4L28 4M30 -4L36 4" stroke="#0006"/><circle r="4.4" fill="#c9a227"/>`;
  const GRIPS = ['#f4f4f0', '#263238', '#1b5e20'];

  /* ---- Conqueror's Haki: black-red lightning ---- */
  const HAKI_RED = '#ff1a1a', HAKI_DARK = '#0b0b0f';
  const bolt = (x0, y0, ang, len, jit, segs) => {
    let x = x0, y = y0, d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const st = len / segs;
    for (let i = 0; i < segs; i++) {
      const a = ang + (Math.random() - 0.5) * jit;
      x += Math.cos(a) * st; y += Math.sin(a) * st;
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };
  const hakiLayer = (glow) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('fill', 'none'); g.setAttribute('stroke-linecap', 'round'); g.setAttribute('stroke-linejoin', 'round');
    if (glow) g.style.filter = `drop-shadow(0 0 ${glow}px ${HAKI_RED})`;
    const mk = (c, w) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('stroke', c); p.setAttribute('stroke-width', w); g.append(p); return p; };
    const dark = mk(HAKI_DARK, 3.4), red = mk(HAKI_RED, 1.3);
    return { g, dark, red };
  };
  const blades = GRIPS.map((c) => {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = katana(c); g.style.opacity = '0'; g.style.transformOrigin = '0 0'; g.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,.25))';
    const hk = hakiLayer(2); g.append(hk.g); g._haki = hk;
    svg.append(g); return g;
  });
  let hakiTimer = 0;
  const hakiTick = () => {
    blades.forEach((g) => {
      const h = g._haki;
      if (Math.random() < 0.18) { h.g.style.opacity = '0'; return; }
      let d = '';
      for (let i = 0, n = 3 + Math.floor(Math.random() * 3); i < n; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        d += bolt(46 + Math.random() * 148, side * 3, side * Math.PI / 2 + (Math.random() - 0.5) * 0.9, 14 + Math.random() * 20, 1.6, 4);
      }
      if (Math.random() < 0.6) d += bolt(196, 1, (Math.random() - 0.5) * 1.2, 20 + Math.random() * 14, 1.4, 4);
      h.dark.setAttribute('d', d); h.red.setAttribute('d', d);
      h.g.style.opacity = String(0.65 + Math.random() * 0.35);
    });
  };
  const startHaki = () => { clearInterval(hakiTimer); hakiTick(); hakiTimer = setInterval(hakiTick, 65); };
  const stopHaki = () => { clearInterval(hakiTimer); blades.forEach((g) => { g._haki.dark.setAttribute('d', ''); g._haki.red.setAttribute('d', ''); }); };
  host.append(svg);

  /* ---- photo swap: Zoro on impact, pixel-sharpens back into me ---- */
  let zoroOK = false;
  const zoro = new Image(); zoro.onload = () => { zoroOK = true; };
  const loadZoro = () => { if (!zoro.src) zoro.src = 'images/zoro.jpg'; };
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d'), tc = document.createElement('canvas'), tcx = tc.getContext('2d');
  cv.className = 'pix-layer'; cv.setAttribute('aria-hidden', 'true'); fig.append(cv);
  let cw = 0, ch = 0;
  const paint = (src, px, glitch) => {
    const k = Math.min(devicePixelRatio || 1, 2);
    const W = Math.round(fig.clientWidth * k), H = Math.round(fig.clientHeight * k);
    if (cw !== W || ch !== H) { cw = W; ch = H; cv.width = W; cv.height = H; }
    const iw = src.naturalWidth, ih = src.naturalHeight, ar = W / H;           // cover-crop to the card's aspect ratio
    let sw = iw, sh = iw / ar;
    if (sh > ih) { sh = ih; sw = ih * ar; }
    const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
    if (px <= 1) { ctx.imageSmoothingEnabled = true; ctx.drawImage(src, sx, sy, sw, sh, 0, 0, W, H); }
    else {
      const n = Math.max(2, Math.ceil(fig.clientWidth / px)), m = Math.max(2, Math.ceil(fig.clientHeight / px));
      tc.width = n; tc.height = m;
      tcx.drawImage(src, sx, sy, sw, sh, 0, 0, n, m);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(tc, 0, 0, n, m, 0, 0, W, H);
    }
    for (let i = 0; i < glitch; i++) {
      const y = Math.random() * H, h = H * (0.03 + Math.random() * 0.09), dx = (Math.random() - 0.5) * W * 0.2;
      ctx.drawImage(cv, 0, y, W, h, dx, y, W, h);
    }
  };
  async function swap() {
    if (!zoroOK || !me.naturalWidth) return;
    cv.style.opacity = '1';
    for (const px of [24, 10, 1]) { paint(zoro, px, 4); await sleep(70); }
    for (let i = 0; i < 20; i++) { paint(zoro, 1, i % 5 === 4 ? 3 : 0); await sleep(100); }
    for (const px of [4, 10, 20, 30]) { paint(zoro, px, 3); await sleep(80); }
    const steps = [40, 30, 22, 16, 12, 9, 6, 4, 3, 2];
    for (let i = 0; i < steps.length; i++) { paint(me, steps[i], Math.max(0, 4 - (i >> 1))); await sleep(300); }
    paint(me, 1, 0); await sleep(60); cv.style.opacity = '0';
  }

  let running = false, timer = 0;
  const T = (x, y, a, s) => `translate(${x}px,${y}px) rotate(${a}deg) scale(${s})`;
  async function play() {
    if (running || document.hidden) return;
    running = true; schedule(15000);
    const hr = host.getBoundingClientRect(), pr = fig.getBoundingClientRect();
    const tx = pr.left - hr.left + pr.width / 2, ty = pr.top - hr.top + pr.height / 2;
    const s = Math.max(0.55, Math.min(1, pr.width / 420)), L = LEN * s;
    const hoverTipX = tx + pr.width / 2 + 50 * s;          // tip rests just outside the photo's right edge

    /* all three come in from the right, stacked a little apart, and aim at the centre of the photo */
    blades.forEach((g, i) => {
      const yo = (i - 1) * 38 * s;
      const phi = Math.atan2(-yo, -L) * 180 / Math.PI;       // blade angle that points the tip at the centre
      const pr0 = phi * Math.PI / 180;
      const startTip = hoverTipX + 330 * s;
      const hov = { x: hoverTipX + L, y: ty + yo };
      const hit = { x: tx - 10 * s - L * Math.cos(pr0), y: ty - L * Math.sin(pr0) };
      const wob = [-14, 10, -8][i];
      g.animate([
        { transform: T(startTip + L, ty + yo, 180 + wob, s), opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.04 },
        { transform: T(hov.x, hov.y, 180, s), opacity: 1, offset: 0.329, easing: 'ease-in-out' },
        { transform: T(hov.x, hov.y - 4 * s, 180, s), opacity: 1, offset: 0.54, easing: 'ease-in-out' },
        { transform: T(hov.x, hov.y, 180, s), opacity: 1, offset: 0.7468, easing: 'ease-in-out' },
        { transform: T(hov.x + 22 * s, hov.y, 180, s), opacity: 1, offset: 0.8354, easing: 'cubic-bezier(.6,0,1,.6)' },
        { transform: T(hit.x, hit.y, phi, s), opacity: 1, offset: 0.8987 },
        { transform: T(hit.x, hit.y, phi, s), opacity: 1, offset: 0.9367 },
        { transform: T(hit.x, hit.y, phi, s), opacity: 0, offset: 1 },
      ], { duration: 3950, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    });

    await sleep(3550 + 70);
    impact(tx, ty, s);
    startHaki();
    swap().then(() => { running = false; });
    await sleep(600);
    stopHaki();
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

    const hb = hakiLayer(4); svg.append(hb.g);
    const rays = 7; let frames = 0;
    const burst = () => {
      let d = '';
      for (let i = 0; i < rays; i++) d += bolt(tx, ty, (i / rays) * 6.283 + Math.random() * 0.6, R * (0.8 + Math.random() * 0.5), 1.1, 7);
      hb.dark.setAttribute('d', d); hb.red.setAttribute('d', d);
      if (++frames > 6) { clearInterval(iv); hb.g.remove(); }
    };
    const iv = setInterval(burst, 55); burst();
    hb.g.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 400 });

    fig.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-3px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }], { duration: 320 });
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const r = host.getBoundingClientRect();
      if (document.hidden || running || r.bottom < 0 || r.top > innerHeight) return schedule(1000);
      play();
    }, ms);
  }
  const boot = () => { loadZoro(); schedule(1600); };
  addEventListener('load', boot);
  if (document.readyState === 'complete') boot();
})();
