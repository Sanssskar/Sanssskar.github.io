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

  /* ---------- Visual scenes: one animated mini-scene per service (decorative). ----------
     Styled and animated in css/code-cards.css; they only run while the card is .is-coding. */
  const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');

  const SCENES = {
    // Dashboards: stat cards pop in, bars grow, table rows slide in
    'admin-panels': `<div class="sc sc-dash">
      <div class="d-side">${rep(4, () => '<i></i>')}</div>
      <div class="d-main">
        <div class="d-stats">${rep(3, (i) => `<b style="--i:${i};--w:${[62, 48, 74][i]}%"></b>`)}</div>
        <div class="d-grid">
          <div class="d-chart">${rep(7, (i) => `<i style="--i:${i};--h:${[38, 58, 46, 74, 62, 88, 96][i]}%"></i>`)}</div>
          <div class="d-rows">${rep(4, (i) => `<i style="--i:${i}"></i>`)}</div>
        </div>
      </div>
    </div>`,

    // Web apps: a booking calendar where a slot gets picked and confirmed
    'web-apps': `<div class="sc sc-book">
      <div class="b-cal">
        <div class="b-head"><i></i><b></b></div>
        <div class="b-grid">${rep(21, (i) => i === 11
          ? `<i class="b-pick" style="--i:${i}"><em class="fa-solid fa-arrow-pointer"></em></i>`
          : `<i${[2, 3, 8, 13, 17].includes(i) ? ' class="b-taken"' : ''} style="--i:${i}"></i>`)}</div>
      </div>
      <div class="b-toast"><i class="fa-solid fa-circle-check"></i><span>Booking confirmed</span></div>
    </div>`,

    // Full stack: a website assembles itself inside a browser window
    'fullstack': `<div class="sc sc-web">
      <div class="w-bar"><i></i><i></i><i></i><span class="w-url"></span></div>
      <div class="w-page">
        <div class="w-nav" style="--i:0"><b></b><i></i><i></i><i></i></div>
        <div class="w-hero">
          <div class="w-copy"><i style="--i:1"></i><i style="--i:2"></i><em style="--i:3"></em><b style="--i:4"></b></div>
          <div class="w-img" style="--i:3"></div>
        </div>
        <div class="w-cards">${rep(3, (i) => `<i style="--i:${5 + i}"></i>`)}</div>
      </div>
    </div>`,

    // APIs: request flies to the server, JSON comes back
    'api-dev': `<div class="sc sc-api">
      <div class="a-node a-client"><i class="fa-solid fa-mobile-screen"></i><span>App</span></div>
      <div class="a-mid">
        <div class="a-lane"><span class="a-l1">GET /products</span><em></em><b class="a-pk a-go"></b></div>
        <div class="a-lane"><span class="a-l2">200 OK</span><em></em><b class="a-pk a-back"></b></div>
      </div>
      <div class="a-node a-server"><i class="fa-solid fa-server"></i><span>API</span></div>
      <div class="a-json"><span><u>{</u> "status": <q>"ok"</q>,</span><span>&nbsp; "items": <q>24</q> <u>}</u></span></div>
    </div>`,

    // Auth: credentials get typed, lock opens
    'auth-systems': `<div class="sc sc-auth">
      <div class="u-card">
        <div class="u-av"><i class="fa-solid fa-user"></i></div>
        <div class="u-field"><i></i></div>
        <div class="u-field u-pw">${rep(6, (i) => `<b style="--i:${i}"></b>`)}</div>
        <div class="u-btn">Sign in</div>
      </div>
      <div class="u-ok"><i class="fa-solid fa-lock-open"></i><span>Welcome back</span></div>
    </div>`,

    // CMS & blog: a post is written, then published
    'cms-blog': `<div class="sc sc-cms">
      <div class="c-edit">
        <div class="c-tool"><i class="fa-solid fa-bold"></i><i class="fa-solid fa-italic"></i><i class="fa-solid fa-link"></i><i class="fa-regular fa-image"></i></div>
        <div class="c-title"><i></i></div>
        <div class="c-lines">${rep(4, (i) => `<i style="--i:${i};--w:${[96, 88, 94, 60][i]}%"></i>`)}</div>
      </div>
      <div class="c-side">
        <div class="c-chips"><span class="c-draft">Draft</span><span class="c-pub">Published</span></div>
        <div class="c-btn">Publish</div>
        <div class="c-views"><i class="fa-solid fa-eye"></i> 1.2k</div>
      </div>
    </div>`,

    // Maintenance: speed score climbs while tasks tick off
    'maintenance': `<div class="sc sc-mt">
      <div class="m-gauge">
        <svg viewBox="0 0 100 58" aria-hidden="true"><path class="m-bg" d="M10 54 A40 40 0 0 1 90 54" pathLength="100"/><path class="m-arc" d="M10 54 A40 40 0 0 1 90 54" pathLength="100"/></svg>
        <span class="m-score"></span><em>Speed</em>
      </div>
      <div class="m-tasks">${['Updates', 'Backups', 'Security', 'Speed'].map((t, i) =>
        `<div class="m-task" style="--i:${i}"><i class="fa-solid fa-circle-notch m-spin"></i><i class="fa-solid fa-circle-check m-ck"></i><span>${t}</span></div>`).join('')}</div>
    </div>`,

    // SEO: our result climbs from #4 to #1
    'seo-optimization': `<div class="sc sc-seo">
      <div class="s-search"><i class="fa-solid fa-magnifying-glass"></i><b></b></div>
      <div class="s-list">
        <div class="s-row s-me" style="--k:0"><div class="s-in"><span class="s-rank">#1</span><i></i><em class="fa-solid fa-arrow-trend-up"></em></div></div>
        ${rep(3, (i) => `<div class="s-row s-o" style="--k:${i + 1}"><div class="s-in"><span class="s-rank">#${i + 2}</span><i></i></div></div>`)}
      </div>
    </div>`,
  };

  /* ---------- Build the overlay for each card ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function build(card) {
    const data = SNIPPETS[card.dataset.code];
    const media = card.querySelector('.poster-side, .code-media');
    if (!data || !media) return null;

    const fx = document.createElement('div');
    fx.className = 'code-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.setAttribute('data-nosnippet', '');

    const sceneHtml = SCENES[card.dataset.code];
    if (sceneHtml) {
      const scene = document.createElement('div');
      scene.className = 'code-scene';
      scene.innerHTML = sceneHtml;      // static, trusted markup defined above
      fx.append(scene);
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