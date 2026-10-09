/* Services cards: a code snippet types itself while a card is hovered / focused
   (or, on touch screens, while it is scrolled into view). Purely decorative:
   the text only exists in this script, never in the page's HTML. */
(() => {
  'use strict';

  const cards = document.querySelectorAll('[data-code]');
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Snippets (edit here). Keep lines short; about 7 lines fit a card. ---------- */
  const SNIPPETS = {
    'admin-panels': {
      file: 'OrderResource.php',
      code: [
        'class OrderResource extends Resource',
        '{',
        '    // Filament table',
        '    TextColumn::make(\'customer\'),',
        '    TextColumn::make(\'total\')',
        '        ->money(\'NPR\')->sortable(),',
        '}',
      ],
    },
    'web-apps': {
      file: 'routes/web.php',
      code: [
        'Route::post(\'/bookings\', function () {',
        '    $slot = Slot::available()->first();',
        '    return Booking::create([',
        '        \'slot_id\' => $slot->id,',
        '    ]);',
        '});',
      ],
    },
    'fullstack': {
      file: 'home.blade.php',
      code: [
        '<section class="py-16 bg-white">',
        '  <h1 class="text-4xl font-bold">',
        '    Your business, online.',
        '  </h1>',
        '  <x-contact-button />',
        '</section>',
      ],
    },
    'api-dev': {
      file: 'routes/api.php',
      code: [
        'Route::apiResource(\'products\',',
        '    ProductController::class);',
        '',
        'return response()->json([',
        '    \'status\' => \'ok\',',
        ']);',
      ],
    },
    'auth-systems': {
      file: 'LoginController.php',
      code: [
        '$request->validate([',
        '    \'email\' => \'required|email\',',
        '    \'password\' => \'required\',',
        ']);',
        '',
        'Auth::attempt($credentials);',
      ],
    },
    'cms-blog': {
      file: 'PostController.php',
      code: [
        '$posts = Post::published()',
        '    ->latest()',
        '    ->with(\'author\', \'tags\')',
        '    ->paginate(10);',
        '',
        'return view(\'blog.index\', $posts);',
      ],
    },
    'maintenance': {
      file: 'deploy.sh',
      code: [
        '$ git pull origin main',
        '$ composer install --no-dev',
        '$ php artisan migrate --force',
        '$ php artisan optimize',
        '✓ Deployed, no downtime',
      ],
    },
    'seo-optimization': {
      file: 'layout.blade.php',
      code: [
        '<title>Web Developer in Dharan</title>',
        '<link rel="canonical" href="/">',
        '<script type="application/ld+json">',
        '  { "@type": "LocalBusiness" }',
        '</script>',
      ],
    },
  };

  const SYMBOLS = ['{ }', '</>', '=>', ';', '$', '::', '[ ]', '( )', '//', '->', '&&', '0x'];

  /* ---------- Tiny syntax highlighter ---------- */
  const RULES = [
    ['com', /^\/\/.*/],
    ['str', /^'[^']*'|^"[^"]*"/],
    ['var', /^\$[A-Za-z_]\w*/],
    ['tag', /^<\/?[A-Za-z][\w-]*|^\/?>/],
    ['kw', /^(?:class|extends|public|static|function|return|use|new)\b/],
    ['cls', /^[A-Z][A-Za-z]*(?=::)/],
    ['op', /^(?:::|->|=>)/],
    ['ok', /^✓.*/],
  ];

  function tokenize(line) {
    const tokens = [];
    const push = (text, cls) => {
      const last = tokens[tokens.length - 1];
      if (last && last[1] === cls) last[0] += text;
      else tokens.push([text, cls]);
    };
    let rest = line;
    if (rest.startsWith('$ ')) { push('$ ', 'prm'); rest = rest.slice(2); }
    let prev = '';
    while (rest) {
      let hit = null;
      if (!/\w/.test(prev)) {            // never start a word-token in the middle of a word
        for (const [cls, re] of RULES) {
          const m = rest.match(re);
          if (m) { hit = [m[0], cls]; break; }
        }
      }
      if (hit) { push(hit[0], hit[1]); rest = rest.slice(hit[0].length); prev = hit[0].slice(-1); }
      else { push(rest[0], ''); prev = rest[0]; rest = rest.slice(1); }
    }
    return tokens;
  }

  /* ---------- Build the overlay for each card ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const small = window.matchMedia('(max-width: 600px)').matches;

  function build(card) {
    const data = SNIPPETS[card.dataset.code];
    const media = card.querySelector('.poster-side, .code-media');
    if (!data || !media) return null;

    const fx = document.createElement('div');
    fx.className = 'code-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.setAttribute('data-nosnippet', '');

    const count = small ? 7 : SYMBOLS.length;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'code-sym';
      s.textContent = SYMBOLS[i];
      s.style.setProperty('--x', 4 + ((i * 29) % 88) + '%');
      s.style.setProperty('--s', (0.8 + ((i * 7) % 6) / 8).toFixed(2) + 'rem');
      s.style.setProperty('--t', (4 + ((i * 5) % 4) * 0.7).toFixed(1) + 's');
      s.style.setProperty('--d', ((i * 0.55) % 3.2).toFixed(2) + 's');
      s.style.setProperty('--dx', (i % 2 ? 1 : -1) * (10 + ((i * 13) % 30)) + 'px');
      fx.append(s);
    }

    const win = document.createElement('div');
    win.className = 'code-win';
    const bar = document.createElement('div');
    bar.className = 'code-win-bar';
    bar.innerHTML = '<i></i><i></i><i></i>';
    const file = document.createElement('span');
    file.className = 'code-file';
    file.textContent = data.file;
    bar.append(file);
    const pre = document.createElement('pre');
    pre.className = 'code-pre';
    win.append(bar, pre);
    fx.append(win);
    media.append(fx);

    const cursor = document.createElement('span');
    cursor.className = 'code-cursor';

    return { card, media, fx, pre, cursor, lines: data.code.map(tokenize), run: 0, on: false };
  }

  function span(cls) {
    const el = document.createElement('span');
    if (cls) el.className = 'c-' + cls;
    return el;
  }

  async function typeCode(st) {
    const id = ++st.run;
    st.pre.textContent = '';
    st.pre.append(st.cursor);
    for (let li = 0; li < st.lines.length; li++) {
      for (const [text, cls] of st.lines[li]) {
        const el = span(cls);
        st.pre.insertBefore(el, st.cursor);
        for (const ch of text) {
          if (st.run !== id) return;           // card was left: stop typing
          el.textContent += ch;
          st.pre.scrollTop = st.pre.scrollHeight;
          await sleep(/\s/.test(ch) ? 4 : 16 + Math.random() * 22);
        }
      }
      st.pre.insertBefore(document.createTextNode('\n'), st.cursor);
      await sleep(140);
    }
  }

  function renderStatic(st) {
    st.pre.textContent = '';
    st.lines.forEach((tokens) => {
      tokens.forEach(([text, cls]) => { const el = span(cls); el.textContent = text; st.pre.append(el); });
      st.pre.append('\n');
    });
  }

  function activate(st) {
    if (st.on) return;
    st.on = true;
    st.fx.style.setProperty('--rise', st.media.offsetHeight + 'px');
    st.card.classList.add('is-coding');
    if (reduceMotion) renderStatic(st); else typeCode(st);
  }

  function deactivate(st) {
    if (!st.on) return;
    st.on = false;
    st.run++;                                  // cancels any typing in progress
    st.card.classList.remove('is-coding');
  }

  const states = [...cards].map(build).filter(Boolean);
  if (!states.length) return;

  states.forEach((st) => {
    if (hoverDevice) {
      st.card.addEventListener('mouseenter', () => activate(st));
      st.card.addEventListener('mouseleave', () => deactivate(st));
    }
    // keyboard users get it too
    st.card.addEventListener('focusin', () => activate(st));
    st.card.addEventListener('focusout', (e) => { if (!st.card.contains(e.relatedTarget)) deactivate(st); });
  });

  // Touch screens have no hover, so play while the card is mostly on screen
  if (!hoverDevice && 'IntersectionObserver' in window) {
    const byCard = new Map(states.map((st) => [st.card, st]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const st = byCard.get(e.target);
        if (!st) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.6) activate(st);
        else if (!e.isIntersecting) deactivate(st);
      });
    }, { threshold: [0, 0.6] });
    states.forEach((st) => io.observe(st.card));
  }
})();
