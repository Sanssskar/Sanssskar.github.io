/* Autoplay terminal (decorative). Starts once, when scrolled into view. */
(() => {
  'use strict';

  const root = document.getElementById('terminal');
  const body = document.getElementById('termBody');
  if (!root || !body) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let skipping = reduceMotion;

  /* ---------- Your data (edit here) ---------- */
  const STACK = [
    ['backend', ['Laravel', 'Filament PHP', 'PHP', 'MySQL', 'REST APIs']],
    ['frontend', ['Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3']],
    ['mobile', ['Flutter']],
    ['tools', ['Git']],
  ];
  const PROJECTS = [
    'Code It Appsware', 'Sapkota Kalyan Kendra UK', 'SudamHub',
    'Hzn Capital', 'Prasar Studio', 'Kumari Sarsafai Sewa',
  ];
  const CONTACT = [
    ['github', 'github.com/Sanssskar'],
    ['linkedin', 'linkedin.com/in/sanskar-shrestha-a750933b1'],
    ['whatsapp', 'wa.me/9779814351861'],
    ['email', 'shresthasakar85@gmail.com'],
    ['web', 'shresthasanskar.com.np'],
  ];

  /* ---------- Helpers ---------- */
  const sleep = (ms) => (skipping ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));
  const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  // A "part" is a plain string, or [text, className]. No links: this is decoration only.
  function part(p) {
    if (typeof p === 'string') return document.createTextNode(p);
    const node = document.createElement('span');
    node.className = p[1] || '';
    node.textContent = p[0];
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

  async function out(rows, delay = 45) {
    for (const r of rows) { print(r); await sleep(delay); }
  }

  const PROMPT = [['sanskar', 't-user'], ['@', 't-dim'], ['dev', 't-user'], [':', 't-dim'], ['~', 't-path'], ['$ ', 't-dim']];

  async function typeCmd(text) {
    const row = print(PROMPT);
    const typed = document.createElement('span');
    typed.className = 't-cmd';
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    row.append(typed, cursor);
    let i = 0;
    while (i < text.length) {
      if (skipping) { typed.textContent = text; break; }
      typed.textContent = text.slice(0, ++i);
      await sleep(28 + Math.random() * 40);
    }
    cursor.remove();
    await sleep(200);
  }

  async function progress(label, ms) {
    const row = print([[label + ' ', 't-dim']]);
    const bar = document.createElement('span');
    bar.className = 't-acc';
    row.append(bar);
    const steps = 20;
    const render = (i) => {
      bar.textContent = '[' + '█'.repeat(i) + '░'.repeat(steps - i) + '] ' + Math.round((i / steps) * 100) + '%';
    };
    for (let i = 0; i <= steps; i++) {
      render(i);
      if (skipping) { render(steps); break; }
      await sleep(ms / steps);
    }
    print([['✓ ', 't-ok'], 'profile loaded']);
  }

  /* ---------- What each command prints ---------- */
  const OUTPUT = {
    whoami: () => [
      [[pad('name', 10), 't-key'], 'Sanskar Shrestha ', ['(संस्कार)', 't-dim']],
      [[pad('role', 10), 't-key'], 'Full Stack Developer'],
      [[pad('location', 10), 't-key'], 'Dharan, Nepal'],
      [[pad('focus', 10), 't-key'], 'Laravel, Filament PHP, Tailwind CSS & JavaScript'],
    ],
    skills: () => [
      ['{'],
      ...STACK.map(([key, list], i) => [
        '  ', [`"${key}"`, 't-key'], ': [',
        ...list.flatMap((s, j) => [[`"${s}"`, 't-str'], j < list.length - 1 ? ', ' : '']),
        ']' + (i < STACK.length - 1 ? ',' : ''),
      ]),
      ['}'],
    ],
    projects: () => PROJECTS.map((name) => [['  ▸ ', 't-acc'], [name, 't-link']]),
    contact: () => CONTACT.map(([key, label]) => [[pad(key, 10), 't-key'], [label, 't-link']]),
    'php artisan serve': () => [
      [['INFO ', 't-ok'], ' Server running on ', ['[http://127.0.0.1:8000]', 't-link'], '.'],
      [['Press Ctrl+C to stop the server', 't-dim']],
      [["Let's build something together.", 't-acc']],
    ],
  };

  async function boot() {
    body.textContent = ''; // clear the static prompt that ships in the HTML
    await sleep(300);
    await typeCmd('./load-profile.sh');
    await progress('loading profile', 1100);
    await sleep(150);
    for (const cmd of ['whoami', 'skills', 'projects', 'contact', 'php artisan serve']) {
      await typeCmd(cmd);
      await out(OUTPUT[cmd]());
      print('');
      await sleep(200);
    }
    // idle prompt with a blinking cursor
    const row = print(PROMPT);
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    row.append(cursor);
  }

  /* ---------- Start once, when it scrolls into view ---------- */
  let started = false;
  const start = () => { if (!started) { started = true; boot(); } };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); start(); }
    }, { threshold: 0.35 });
    io.observe(root);
  } else {
    start();
  }
})();
