/* Decorative dev-stage. Everything is built here with JS/canvas, so none of it is in the page's HTML text (SEO-safe). */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const cssVar = (n, f) => getComputedStyle(document.body).getPropertyValue(n).trim() || f;
  const watch = (el, cb) => { const o = new IntersectionObserver((e) => cb(e[0].isIntersecting), { rootMargin: '80px' }); o.observe(el); };

  /* ---------- 1. Code rain behind the hero ---------- */
  const cv = $('codeRain');
  let boost = 1;
  if (cv && !RM) {
    const ctx = cv.getContext('2d');
    const G = ['0', '1', '{', '}', '<', '>', '/', '$', ';', '=', '->', '::', '()', '[]', '?>', 'fn'];
    let cols = [], W = 0, H = 0, on = true, step = 24, last = 0, accent = '46,125,50';
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      step = W < 700 ? 30 : 24;
      cols = Array.from({ length: Math.floor(W / step) }, () => ({ y: Math.random() * -H, v: 0.6 + Math.random() * 1.1 }));
    };
    const tone = () => { accent = document.body.classList.contains('dark-mode') ? '76,175,80' : '46,125,50'; };
    const draw = (t) => {
      requestAnimationFrame(draw);
      if (!on || document.hidden || t - last < 50) return;
      last = t; ctx.clearRect(0, 0, W, H); ctx.font = '12px "JetBrains Mono",monospace';
      cols.forEach((c, i) => {
        for (let k = 0; k < 7; k++) {
          const y = c.y - k * 16; if (y < 0 || y > H) continue;
          ctx.fillStyle = `rgba(${accent},${(0.2 - k * 0.026) * Math.min(boost, 2.5)})`;
          ctx.fillText(G[(i * 7 + k + Math.floor(c.y / 40)) % G.length], i * step, y);
        }
        c.y += c.v * 5 * boost; if (c.y - 110 > H) { c.y = Math.random() * -160; c.v = 0.6 + Math.random() * 1.1; }
      });
    };
    size(); tone(); addEventListener('resize', size);
    new MutationObserver(tone).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    watch(cv, (v) => { on = v; }); requestAnimationFrame(draw);
  }

  /* ---------- 2. Floating chips around the photo ---------- */
  const vis = document.querySelector('.hero-visual');
  if (vis) [['<Laravel/>', '-4%', '8%', '-6deg'], ['artisan serve', '62%', '-3%', '4deg'], ['{ filament }', '-8%', '78%', '5deg'], ['git push ✓', '66%', '88%', '-4deg']].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'chip'; s.dataset.text = c[0]; s.setAttribute('aria-hidden', 'true');
    s.style.cssText = `left:${c[1]};top:${c[2]};--r:${c[3]};--d:${-i * 1.3}s;--t:${4.5 + i * 0.7}s`;
    vis.append(s);
  });

  /* ---------- 3. Glitch the name now and then ---------- */
  const nm = $('typingName');
  if (nm && !RM) (function g() { setTimeout(() => { nm.classList.add('glitching'); setTimeout(() => nm.classList.remove('glitching'), 1100); g(); }, 6000 + Math.random() * 5000); })();

  /* ---------- 4. Live code editor ---------- */
  const ed = $('editorBody');
  const FILES = [
    ['app/Filament/Resources/ProjectResource.php', [
      '<?php', '', 'namespace App\\Filament\\Resources;', '', 'class ProjectResource extends Resource', '{',
      '    public static function form(Form $form): Form', '    {', '        return $form->schema([',
      "            TextInput::make('title')->required(),", "            Select::make('stack')->multiple(),",
      "            FileUpload::make('cover')->image(),", '        ]);', '    }', '}']],
    ['routes/web.php', [
      '// ship it, then sleep', "Route::get('/projects', function () {", '    return Project::query()',
      "        ->where('status', 'live')", '        ->latest()', '        ->get();', '});', '',
      "Route::view('/hire-me', 'contact');"]],
    ['resources/views/hero.blade.php', [
      '<section class="grid place-items-center">', '    <h1 class="text-5xl font-bold">',
      '        {{ $dev->name }}', '    </h1>', '    @foreach ($dev->stack as $tech)',
      '        <x-chip :label="$tech" />', '    @endforeach', '</section>']],
  ];
  const TOK = /(\/\/.*)|('[^']*')|(\$\w+)|\b(namespace|class|extends|public|static|function|return|use|new|fn|foreach|as)\b|\b([A-Z]\w*)\b|(\w+)(?=\()/g;
  const CL = ['', 'c-c', 'c-s', 'c-v', 'c-k', 'c-t', 'c-f'];
  const seg = (line) => {
    const out = []; let i = 0, m; TOK.lastIndex = 0;
    while ((m = TOK.exec(line))) {
      if (m.index > i) out.push([line.slice(i, m.index), '']);
      out.push([m[0], CL[m.slice(1).findIndex(Boolean) + 1]]); i = TOK.lastIndex;
    }
    if (i < line.length) out.push([line.slice(i), '']);
    return out;
  };
  if (ed) {
    let seen = false; const bar = $('editorTitle');
    watch(ed, (v) => { seen = v; });
    const still = async () => { while (!seen || document.hidden) await sleep(400); };
    (async () => {
      for (let f = 0; ; f = (f + 1) % FILES.length) {
        ed.textContent = ''; if (bar) bar.textContent = FILES[f][0];
        const cur = Object.assign(document.createElement('span'), { className: 'cur' });
        for (const line of FILES[f][1]) {
          const row = document.createElement('div'); row.className = 'ln'; ed.append(row);
          for (const [txt, cls] of seg(line)) {
            const s = document.createElement('span'); s.className = cls; row.append(s);
            for (const ch of txt) {
              s.textContent += ch; row.append(cur);
              if (RM) continue;
              await still(); await sleep(ch === ' ' ? 12 : 22 + Math.random() * 38);
            }
          }
          row.append(cur); if (!RM) await sleep(140);
        }
        await sleep(RM ? 60000 : 3200);
      }
    })();
  }

  /* ---------- 5. Left terminal: server log ---------- */
  const lg = $('logBody');
  if (lg) {
    let seen = false; watch(lg, (v) => { seen = v; });
    const P = ['/', '/about', '/services', '/projects', '/contact', '/api/projects', '/sitemap.xml'];
    const add = (html) => { const d = document.createElement('div'); d.innerHTML = html; lg.append(d); while (lg.children.length > 14) lg.firstChild.remove(); };
    add('<span class="t-d">$</span> php artisan serve');
    add('<span class="t-b">INFO</span>  Server running on [127.0.0.1:8000]');
    (async () => {
      for (;;) {
        while (!seen || document.hidden) await sleep(500);
        const ms = 4 + Math.floor(Math.random() * 90), p = rnd(P);
        add(`<span class="t-d">${new Date().toTimeString().slice(0, 8)}</span> <span class="t-ok">200</span> GET ${p} <span class="t-d">${ms}ms</span>`);
        if (Math.random() < 0.12) add('<span class="t-w">WARN</span>  cache cleared, coffee low');
        await sleep(RM ? 60000 : 700 + Math.random() * 1300);
      }
    })();
  }

  /* ---------- 6. Right terminal: type commands (easter eggs) ---------- */
  const sh = $('shellBody'), inp = $('shellInput');
  if (sh && inp) {
    const say = (html) => { const d = document.createElement('div'); d.className = 'sh-out'; d.innerHTML = html; sh.append(d); sh.scrollTop = sh.scrollHeight; };
    const CMD = {
      help: () => 'try: <span class="t-b">whoami</span> <span class="t-b">stack</span> <span class="t-b">projects</span> <span class="t-b">hire</span> <span class="t-b">matrix</span> <span class="t-b">glitch</span> <span class="t-b">theme</span> <span class="t-b">clear</span>',
      whoami: () => 'sanskar, full stack dev, Dharan, Nepal. runs on chiya and Laravel.',
      stack: () => 'Laravel · Filament · PHP · MySQL · Tailwind · JS · Flutter',
      projects: () => 'CodeIT AppsWare, SKK UK, SudamHub, Hzn Capital, Prasar Studio, KSS... <a href="projects.html">open projects</a>',
      hire: () => '<span class="t-ok">✔</span> permission granted. <a href="https://wa.me/9779814351861" target="_blank" rel="noopener noreferrer">message Sanskar</a>',
      'sudo hire sanskar': () => '<span class="t-ok">[sudo]</span> password accepted. offer letter generating… <a href="contact.html">contact</a>',
      matrix: () => { boost = 4; setTimeout(() => { boost = 1; }, 7000); return 'wake up, developer…'; },
      glitch: () => { nm && nm.classList.add('glitching'); setTimeout(() => nm && nm.classList.remove('glitching'), 1100); return 'reality.exe has stopped responding'; },
      theme: () => { const b = $('themeToggle'); b && b.click(); return 'theme toggled'; },
      konami: () => 'old school. ↑ ↑ ↓ ↓ ← → ← → B A',
      'rm -rf /': () => '<span class="t-w">nice try.</span> backups exist.',
      clear: () => { sh.textContent = ''; return null; },
    };
    say('<span class="t-d">zsh 5.9</span> · type <span class="t-b">help</span>');
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const v = inp.value.trim().toLowerCase(); inp.value = ''; if (!v) return;
      const row = document.createElement('div'); row.textContent = '$ ' + v; row.className = 't-d'; sh.append(row);
      const fn = CMD[v]; const r = fn ? fn() : `zsh: command not found: ${v.replace(/[<>&]/g, '')}`;
      if (r) say(r); sh.scrollTop = sh.scrollHeight;
    });
  }

  /* ---------- 7. Cursor trail ---------- */
  if (FINE && !RM) {
    const GL = ['{', '}', '<>', '/', ';', '$', '=>', '::'], tone = ['var(--accent-1)', 'var(--teal)', 'var(--amber)', 'var(--coral)'];
    let px = 0, py = 0, busy = false, lx = 0, ly = 0;
    addEventListener('mousemove', (e) => {
      px = e.clientX; py = e.clientY;
      if (busy || Math.hypot(px - lx, py - ly) < 28) return; busy = true;
      requestAnimationFrame(() => {
        busy = false; lx = px; ly = py;
        const s = document.createElement('span'); s.className = 'trail'; s.textContent = rnd(GL); s.style.color = rnd(tone);
        document.body.append(s);
        s.animate([{ transform: `translate(${px + 8}px,${py + 8}px) scale(1)`, opacity: 0.9 }, { transform: `translate(${px + 8}px,${py + 36}px) scale(.4)`, opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = () => s.remove();
      });
    }, { passive: true });
  }

  /* ---------- 8. Konami code ---------- */
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let ki = 0;
  addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    ki = (e.key.length === 1 ? e.key.toLowerCase() : e.key) === KON[ki] ? ki + 1 : 0;
    if (ki < KON.length) return; ki = 0;
    boost = 4; setTimeout(() => { boost = 1; }, 8000);
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = '🎮 +30 lives. Sanskar approves.'; document.body.append(t); setTimeout(() => t.remove(), 3500);
    if (RM) return;
    for (let i = 0; i < 36; i++) {
      const c = document.createElement('span'); c.className = 'confetti'; c.textContent = rnd(['{ }', '</>', '$', '::', ';', '=>']);
      document.body.append(c);
      const x = Math.random() * innerWidth, dx = (Math.random() - 0.5) * 240;
      c.animate([{ transform: `translate(${x}px,-20px) rotate(0)`, opacity: 1 }, { transform: `translate(${x + dx}px,${innerHeight + 20}px) rotate(${dx * 3}deg)`, opacity: 0.2 }], { duration: 1800 + Math.random() * 1600, easing: 'cubic-bezier(.3,.6,.5,1)' }).onfinish = () => c.remove();
    }
  });
})();
