/* Decorative only: name glitch on the home page. */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nm = document.getElementById('typingName');
  if (!nm) return;
  (function g() {
    setTimeout(() => {
      if (!document.hidden) { nm.classList.add('glitching'); setTimeout(() => nm.classList.remove('glitching'), 600); }
      g();
    }, 2000);
  })();
})();
