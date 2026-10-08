/* Subtle floating code lines behind sections, themed to the stack. Purely decorative. */
(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SETS = {
    about: [
      '$ composer install',
      '$ php artisan serve',
      'INFO  Server running on [http://127.0.0.1:8000].',
      "Route::get('/', HomeController::class);",
      '$ cp .env.example .env',
      '$ php artisan key:generate',
      'Installing dependencies from lock file',
      '$ php artisan storage:link',
      'Press Ctrl+C to stop the server',
    ],
    projects: [
      '$ git add . && git commit -m "feat: launch"',
      '$ git push origin main',
      '$ php artisan migrate --force',
      'Running migrations... DONE',
      '$ npm run build',
      '$ php artisan config:cache',
      'Writing objects: 100% (42/42), done.',
      '$ php artisan optimize',
      'Deployed to production',
    ],
    services: [
      '$ php artisan make:model Product -mfc',
      '$ php artisan make:filament-resource Post',
      '$ php artisan make:controller ApiController --api',
      '$ php artisan make:migration create_orders_table',
      "Route::apiResource('products', ProductController::class);",
      'INFO  Model [app/Models/Product.php] created successfully.',
      "Schema::create('orders', function (Blueprint $table) {",
      "TextInput::make('title')->required(),",
      "Tables\\Columns\\TextColumn::make('name'),",
    ],
    skills: [
      '$ npm run dev',
      'VITE ready in 312 ms',
      '$ npx tailwindcss --watch',
      '$ npm run build',
      'class="flex items-center gap-4"',
      'Rebuilding... done in 84ms',
      '$ flutter run',
      '$ php artisan tinker',
      "const res = await fetch('/api/projects');",
    ],
  };

  const hosts = document.querySelectorAll('[data-code-bg]');
  if (!hosts.length) return;

  const small = window.matchMedia('(max-width: 600px)').matches;

  // Only animate while the section is on screen
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-idle', !e.isIntersecting));
      }, { rootMargin: '100px' })
    : null;

  // Lines drift from the bottom to the top of the section, whatever its height
  const ro = 'ResizeObserver' in window
    ? new ResizeObserver((entries) => {
        entries.forEach((e) => e.target.style.setProperty('--h', e.contentRect.height + 'px'));
      })
    : null;

  hosts.forEach((host) => {
    const lines = SETS[host.dataset.codeBg];
    if (!lines) return;

    const layer = document.createElement('div');
    layer.className = io ? 'code-bg is-idle' : 'code-bg';
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('data-nosnippet', '');

    const count = small ? 5 : lines.length;
    for (let i = 0; i < count; i++) {
      const line = document.createElement('span');
      const dur = 26 + ((i * 7) % 14);              // 26–39s, unhurried
      line.className = 'code-line';
      line.dataset.text = lines[i];
      line.style.setProperty('--x', 2 + ((i * 31) % 58) + '%');
      line.style.setProperty('--t', dur + 's');
      line.style.setProperty('--d', -(dur * i) / count + 's'); // spread across the loop from the start
      layer.append(line);
    }

    host.prepend(layer);
    layer.style.setProperty('--h', host.offsetHeight + 'px');
    if (ro) ro.observe(layer);
    if (io) io.observe(layer);
  });
})();
