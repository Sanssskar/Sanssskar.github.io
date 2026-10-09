(() => {
    'use strict';

    let toastTimer;
    function showToast(message) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-check-circle';
        icon.setAttribute('aria-hidden', 'true');
        toast.replaceChildren(icon, ' ' + message);
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    async function copyText(btn) {
        const value = btn.dataset.copy || '';
        const label = btn.dataset.label || 'text';
        try {
            await navigator.clipboard.writeText(value);
        } catch (err) {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.append(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            ta.remove();
            if (!ok) { showToast('Copy this: ' + value); return; }
        }
        const icon = btn.querySelector('i');
        btn.classList.add('copied');
        if (icon) icon.className = 'fa-solid fa-check';
        showToast('Copied ' + label);
        setTimeout(() => {
            btn.classList.remove('copied');
            if (icon) icon.className = 'fa-regular fa-copy';
        }, 1800);
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (btn) copyText(btn);
    });
})();