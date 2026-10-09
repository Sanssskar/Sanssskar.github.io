/* Interactive terminal for the About page.
   Everything is printed with textContent / text nodes, so typed input is never treated as HTML. */
(() => {
  'use strict';

  const root = document.getElementById('terminal');
  const body = document.getElementById('termBody');
  const input = document.getElementById('termInput');
  if (!root || !body || !input) return;

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
  const whoami = () => [
    [[pad('name', 11), 't-key'], 'Sanskar Shrestha'],
    [[pad('role', 11), 't-key'], 'Full Stack Developer'],
    [[pad('works at', 11), 't-key'], 'CodeIT Nepal (2026 – present)'],
    [[pad('location', 11), 't-key'], 'Dharan, Nepal'],
    [[pad('focus', 11), 't-key'], 'Laravel, Filament PHP, Tailwind CSS and JavaScript'],
    [[pad('outside', 11), 't-key'], 'Walking in the hills around Dharan'],
  ];

  const COMMANDS = {
    whoami: { desc: 'who I am', run: whoami },
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
        [['Full list on the ', 't-dim'], ['projects page', 't-link', 'projects.html']],
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
  };

  /* ---------- Running a command (typed into a read-only prompt) ---------- */
  let busy = false;

  async function runTyped(text) {
    if (busy) return;
    busy = true;
    input.value = '';
    for (let i = 1; i <= text.length && !reduceMotion; i++) {
      input.value = text.slice(0, i);
      await sleep(30 + Math.random() * 35);
    }
    input.value = text;
    await sleep(180);
    input.value = '';
    print([...PROMPT, [text, 't-cmd']]);
    await out(COMMANDS[text].run());
    busy = false;
  }

  /* ---------- Autoplay: no typing allowed, it just keeps looping ---------- */
  const SCRIPT = ['whoami', 'skills', 'projects', 'experience', 'education', 'contact'];

  async function boot() {
    if (reduceMotion) { await runTyped('whoami'); return; }
    for (;;) {
      for (const cmd of SCRIPT) {
        while (document.hidden) await new Promise((r) => setTimeout(r, 400));
        await runTyped(cmd);
        await sleep(1400);
      }
      await sleep(3500);
      body.textContent = '';
      await sleep(500);
    }
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
