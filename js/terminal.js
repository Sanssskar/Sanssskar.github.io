/* Interactive terminal for the About page.
   Everything is printed with textContent / text nodes, so typed input is never treated as HTML. */
(() => {
  'use strict';

  const root = document.getElementById('terminal');
  const body = document.getElementById('termBody');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');
  const chipsBox = document.getElementById('termChips');
  if (!root || !body || !form || !input) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Your data (edit here) ---------- */
  const STACK = [
    ['backend', ['Laravel', 'Filament PHP', 'PHP', 'MySQL', 'REST APIs']],
    ['frontend', ['Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3']],
    ['mobile', ['Flutter']],
    ['tools', ['Git']],
    ['learning', ['Vue.js', 'Laravel Forge']],
  ];
  const PROJECTS = [
    'Code It Appsware', 'Hzn Capital', 'Sapkota Kalyan Kendra UK', 'Home Link Services',
    'Koseli Express', 'Product API', 'Student Portal API', 'SudamHub',
    'Prasar Studio', 'Kumari Sarsafai Sewa', 'Elite Fitness Studio',
  ];
  const CONTACT = [
    ['github', 'github.com/Sanssskar', 'https://github.com/Sanssskar'],
    ['linkedin', 'linkedin.com/in/sanskar-shrestha-a750933b1', 'https://www.linkedin.com/in/sanskar-shrestha-a750933b1/'],
    ['whatsapp', 'wa.me/9779814351861', 'https://wa.me/9779814351861'],
    ['email', 'shresthasakar85@gmail.com', 'mailto:shresthasakar85@gmail.com'],
    ['web', 'shresthasanskar.com.np', 'https://shresthasanskar.com.np'],
  ];
  const JOKES = [
    'There are 10 kinds of people: those who understand binary and those who don\'t.',
    'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
    'I would tell you a UDP joke, but you might not get it.',
    '"It works on my machine." Every developer, right before the deploy.',
    '!false: it\'s funny because it\'s true.',
  ];
  const CHIPS = ['whoami', 'skills', 'projects', 'experience', 'education', 'contact', 'neofetch', 'joke'];

  /* ---------- Helpers ---------- */
  const sleep = (ms) => (reduceMotion ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));
  const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  // A "part" is a string, [text, className], or [text, className, href].
  function part(p) {
    if (typeof p === 'string') return document.createTextNode(p);
    const [text, cls = '', href] = p;
    const node = document.createElement(href ? 'a' : 'span');
    node.className = cls;
    node.textContent = text;
    if (href) {
      node.href = href;
      if (/^https?:/.test(href)) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    }
    return node;
  }

  function print(parts = '') {
    const row = document.createElement('div');
    row.className = 'tl';
    (Array.isArray(parts) ? parts : [parts]).forEach((p) => row.append(part(p)));
    body.append(row);
    scrollDown();
    return row;
  }

  async function out(rows, delay = 35) {
    for (const r of rows) { print(r); await sleep(delay); }
  }

  const PROMPT = [['sanskar', 't-user'], ['@', 't-dim'], ['dev', 't-user'], [':', 't-dim'], ['~', 't-path'], ['$ ', 't-dim']];

  /* ---------- Commands ---------- */
  const years = Math.max(2, new Date().getFullYear() - 2022);

  const whoami = () => [
    [[pad('name', 11), 't-key'], 'Sanskar Shrestha'],
    [[pad('role', 11), 't-key'], 'Full Stack Developer'],
    [[pad('works at', 11), 't-key'], 'CodeIT Nepal (2026 – present)'],
    [[pad('location', 11), 't-key'], 'Dharan, Nepal'],
    [[pad('focus', 11), 't-key'], 'Laravel, Filament PHP, Tailwind CSS and JavaScript'],
    [[pad('outside', 11), 't-key'], 'Walking in the hills around Dharan'],
  ];

  const COMMANDS = {
    help: {
      desc: 'list the commands',
      run: () => [
        [['Available commands', 't-dim']],
        ...[
          ['whoami', 'who I am (alias: about)'],
          ['skills', 'my tech stack'],
          ['projects', 'things I have built'],
          ['experience', 'where I have worked'],
          ['education', 'where I studied'],
          ['contact', 'ways to reach me'],
          ['neofetch', 'system info'],
          ['joke', 'a developer joke'],
          ['matrix', 'take the red pill'],
          ['clear', 'clear the screen'],
        ].map(([c, d]) => ['  ', [pad(c, 12), 't-acc'], [d, 't-dim']]),
        [['Tip: Tab completes a command, ↑ and ↓ browse history.', 't-dim']],
      ],
    },
    whoami: { desc: 'who I am', run: whoami },
    about: { desc: 'alias of whoami', run: whoami },
    skills: {
      desc: 'tech stack',
      run: () => [
        ['{'],
        ...STACK.map(([key, list], i) => [
          '  ', [`"${key}"`, 't-key'], ': [',
          ...list.flatMap((s, j) => [[`"${s}"`, 't-str'], j < list.length - 1 ? ', ' : '']),
          ']' + (i < STACK.length - 1 ? ',' : ''),
        ]),
        ['}'],
      ],
    },
    projects: {
      desc: 'projects',
      run: () => [
        ...PROJECTS.map((name) => [['  ▸ ', 't-acc'], name]),
        [['Details and screenshots: ', 't-dim'], ['projects.html', 't-link', 'projects.html']],
      ],
    },
    experience: {
      desc: 'work history',
      run: () => [
        [[pad('2026 – now', 12), 't-key'], 'Full Stack Developer, CodeIT Nepal'],
        [[pad('', 12)], [' Laravel + Filament client projects, code reviews', 't-dim']],
        [[pad('2022 – now', 12), 't-key'], 'Freelance developer, Nepal and international clients'],
        [[pad('', 12)], [' Home Link Services, Koseli Express, Student Portal API', 't-dim']],
      ],
    },
    education: {
      desc: 'education',
      run: () => [
        [[pad('degree', 11), 't-key'], 'Bachelor in Information Management (BIM)'],
        [[pad('college', 11), 't-key'], 'Sunsari Technical College, Dharan, Nepal'],
        [[pad('graduated', 11), 't-key'], '2025'],
      ],
    },
    contact: {
      desc: 'contact links',
      run: () => CONTACT.map(([key, label, href]) => [[pad(key, 11), 't-key'], [label, 't-link', href]]),
    },
    neofetch: {
      desc: 'system info',
      run: () => {
        const art = [' ____  ', '/ ___| ', '\\___ \\ ', ' ___) |', '|____/ ', '       '];
        const info = [
          [['sanskar', 't-user'], ['@', 't-dim'], ['dev', 't-user']],
          [['-----------', 't-dim']],
          [['role      ', 't-key'], 'Full Stack Developer'],
          [['location  ', 't-key'], 'Dharan, Nepal'],
          [['stack     ', 't-key'], 'Laravel, Filament, Tailwind'],
          [['experience', 't-key'], ` ${years}+ years`],
        ];
        return art.map((a, i) => [[a + '   ', 't-acc'], ...(info[i] || [])]);
      },
    },
    joke: {
      desc: 'joke',
      run: () => [[JOKES[Math.floor(Math.random() * JOKES.length)], 't-str']],
    },
  };

  async function runMatrix() {
    const glyphs = '01{}<>/$;=:+*#&%';
    const cols = Math.max(20, Math.min(60, Math.floor((body.clientWidth - 32) / 8.5)));
    const rows = reduceMotion ? 4 : 18;
    for (let i = 0; i < rows; i++) {
      let line = '';
      for (let c = 0; c < cols; c++) line += Math.random() < 0.18 ? glyphs[Math.floor(Math.random() * glyphs.length)] : ' ';
      print([[line, 't-matrix']]);
      await sleep(90);
    }
    print([['Wake up, Neo... just kidding, type "help" to continue.', 't-ok']]);
  }

  /* ---------- Running a command ---------- */
  const history = [];
  let historyIndex = 0;
  let busy = false;

  function setBusy(v) { busy = v; input.readOnly = v; }

  async function execute(raw) {
    const line = raw.trim();
    print([...PROMPT, [raw, 't-cmd']]);
    if (!line) return;

    if (history[history.length - 1] !== line) history.push(line);
    historyIndex = history.length;

    const [name, ...args] = line.split(/\s+/);
    const cmd = name.toLowerCase();

    if (cmd === 'clear') { body.textContent = ''; return; }
    if (cmd === 'matrix') { await runMatrix(); return; }
    if (cmd === 'sudo') {
      print([[args.length ? 'sanskar is not in the sudoers file. This incident will be reported.' : 'usage: sudo <command>', 't-err']]);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
      await out(COMMANDS[cmd].run());
      return;
    }
    print([[`command not found: ${name}`, 't-err'], ['  (try "help")', 't-dim']]);
  }

  async function submit(raw) {
    if (busy) return;
    setBusy(true);
    try { await execute(raw); } finally { setBusy(false); }
  }

  // Types a command into the input like a person would, then runs it (used by chips and autoplay)
  async function runTyped(text) {
    if (busy) return;
    setBusy(true);
    input.value = '';
    for (let i = 1; i <= text.length && !reduceMotion; i++) {
      input.value = text.slice(0, i);
      await sleep(30 + Math.random() * 35);
    }
    input.value = text;
    await sleep(180);
    input.value = '';
    try { await execute(text); } finally { setBusy(false); }
  }

  /* ---------- Input handling ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value;
    input.value = '';
    submit(raw);
  });

  input.addEventListener('keydown', (e) => {
    if (busy) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) input.value = history[--historyIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      historyIndex = Math.min(historyIndex + 1, history.length);
      input.value = history[historyIndex] || '';
    } else if (e.key === 'Tab') {
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      e.preventDefault();
      const names = [...Object.keys(COMMANDS), 'clear', 'matrix', 'sudo'];
      const hits = names.filter((n) => n.startsWith(v));
      if (hits.length === 1) input.value = hits[0];
      else if (hits.length > 1) print([[hits.join('   '), 't-dim']]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      body.textContent = '';
    }
  });

  // Clicking anywhere on the terminal focuses the input (unless selecting text or following a link)
  root.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const sel = window.getSelection();
    if (sel && String(sel).length) return;
    input.focus({ preventScroll: true });
  });

  /* ---------- Suggestion chips ---------- */
  if (chipsBox) {
    CHIPS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term-chip';
      b.textContent = c;
      b.addEventListener('click', () => runTyped(c));
      chipsBox.append(b);
    });
  }

  /* ---------- First view: a short welcome, then it runs "whoami" once ---------- */
  async function boot() {
    print([['Welcome. Type a command below, or tap one of the buttons under the terminal.', 't-dim']]);
    await sleep(250);
    await runTyped('whoami');
  }

  let started = false;
  const start = () => { if (!started) { started = true; boot(); } };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
    }, { threshold: 0.4 });
    io.observe(root);
  } else {
    start();
  }
})();
