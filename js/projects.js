(() => {
    'use strict';

    const GITHUB_USER = 'Sanssskar';
    const API = 'https://api.github.com';

    /* ---------- Toast ---------- */
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
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    /* ---------- Share (native share sheet, falls back to copy link) ---------- */
    async function shareProject(button) {
        const card = button.closest('[data-project]');
        if (!card) return;
        const name = card.dataset.project || '';
        const url = card.dataset.url || '';
        const text = `${name} by Sanskar Shrestha, a Full Stack Laravel Developer from Nepal.`;
        if (navigator.share) {
            try { await navigator.share({ title: name, text, url }); return; }
            catch (err) { if (err && err.name === 'AbortError') return; }
        }
        try {
            await navigator.clipboard.writeText(url);
            showToast('Project link copied');
        } catch (err) {
            showToast('Copy this link: ' + url);
        }
    }

    document.addEventListener('click', (e) => {
        const share = e.target.closest('.share-btn');
        if (share) return shareProject(share);
        const toastBtn = e.target.closest('[data-toast]');
        if (toastBtn) showToast(toastBtn.dataset.toast);
    });

    /* ---------- Developer window: reveal + terminal typing ---------- */
    function initDevWindows() {
        const wins = document.querySelectorAll('.dev-window');
        if (!wins.length) return;
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) return; // static content already in the HTML

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        async function play(win) {
            const term = win.querySelector('.dw-term');
            let lines = [];
            try { lines = JSON.parse(term.dataset.lines || '[]'); } catch (e) { return; }
            win.classList.add('is-live');
            await sleep(500);
            const cursor = el('span', 't-cursor');
            for (const [kind, text] of lines) {
                const row = el('div', `t-line t-${kind}`);
                term.append(row);
                const full = (kind === 'cmd' ? '$ ' : '\u2713 ') + text;
                const delay = kind === 'cmd' ? 32 : 14;
                row.append(cursor);
                for (let i = 1; i <= full.length; i++) {
                    row.textContent = full.slice(0, i);
                    row.append(cursor);
                    await sleep(delay);
                }
                await sleep(kind === 'cmd' ? 350 : 120);
            }
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                play(entry.target);
            });
        }, { threshold: 0.45 });

        wins.forEach(win => {
            win.querySelector('.dw-term').replaceChildren(); // clear static fallback, retype on view
            win.classList.add('armed');
            io.observe(win);
        });
    }

    /* ---------- Category filter ---------- */
    function initFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('#projectsGrid .project-card');
        const status = document.getElementById('filterStatus');
        if (!buttons.length) return;
        buttons.forEach(btn => {
            const key = btn.dataset.filter;
            const n = key === 'all' ? cards.length : [...cards].filter(c => c.dataset.category === key).length;
            const count = el('span', 'filter-count', ` ${n}`);
            count.style.opacity = '.7';
            btn.append(count);
            btn.addEventListener('click', () => {
                let shown = 0;
                buttons.forEach(b => {
                    const on = b === btn;
                    b.classList.toggle('active', on);
                    b.setAttribute('aria-pressed', String(on));
                });
                cards.forEach(c => {
                    const match = key === 'all' || c.dataset.category === key;
                    c.hidden = !match;
                    if (match) shown++;
                });
                if (status) status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}`;
            });
        });
    }

    /* ---------- GitHub stats ---------- */
    function getTimeAgo(date) {
        const seconds = Math.floor((Date.now() - date) / 1000);
        const intervals = [['year', 31536000], ['month', 2592000], ['week', 604800],
                           ['day', 86400], ['hour', 3600], ['minute', 60]];
        for (const [unit, size] of intervals) {
            const n = Math.floor(seconds / size);
            if (n >= 1) return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
        }
        return 'just now';
    }

    async function getJson(path) {
        const res = await fetch(API + path, { headers: { Accept: 'application/vnd.github.v3+json' } });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return res.json();
    }

    // Returns { icon, before, repo, after } so text is inserted with textContent (never as HTML)
    function describe(event) {
        const repo = (event.repo && event.repo.name || '').split('/')[1] || '';
        const p = event.payload || {};
        switch (event.type) {
            case 'PushEvent':
                return { icon: 'fa-code-commit', before: `Pushed ${(p.commits && p.commits.length) || 1} commit(s) to `, repo };
            case 'CreateEvent':
                return { icon: 'fa-plus-circle', before: `Created ${p.ref_type} in `, repo };
            case 'WatchEvent':
                return { icon: 'fa-star', before: 'Starred ', repo };
            case 'IssuesEvent':
                return { icon: 'fa-exclamation-circle', before: `${p.action} issue in `, repo };
            case 'PullRequestEvent':
                return { icon: 'fa-code-pull-request', before: `${p.action} pull request in `, repo };
            default:
                return { icon: 'fa-code-branch', before: 'Activity in ', repo };
        }
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function activityItem(icon, textNodes, dateText) {
        const item = el('div', 'activity-item');
        const iconWrap = el('div', 'activity-icon');
        const i = el('i', `fa-solid ${icon}`);
        i.setAttribute('aria-hidden', 'true');
        iconWrap.append(i);
        const content = el('div', 'activity-content');
        const text = el('div', 'activity-text');
        text.append(...textNodes);
        content.append(text, el('div', 'activity-date', dateText));
        item.append(iconWrap, content);
        return item;
    }

    const setText = (id, value) => {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    };

    async function loadGitHub() {
        const feed = document.getElementById('activityFeed');
        const [userRes, eventsRes] = await Promise.allSettled([
            getJson(`/users/${GITHUB_USER}`),
            getJson(`/users/${GITHUB_USER}/events/public?per_page=100`)
        ]);

        if (userRes.status === 'fulfilled') {
            setText('reposCount', userRes.value.public_repos ?? '--');
            setText('followersCount', userRes.value.followers ?? '--');
        } else {
            setText('reposCount', '--');
            setText('followersCount', '--');
        }

        if (eventsRes.status !== 'fulfilled' || !Array.isArray(eventsRes.value)) {
            console.error('GitHub events error:', eventsRes.reason);
            setText('thisYearCommits', '--');
            if (feed) feed.replaceChildren(activityItem('fa-exclamation-triangle',
                [document.createTextNode('Unable to load GitHub activity')], 'Visit GitHub profile directly'));
            return;
        }

        const events = eventsRes.value;
        const year = new Date().getFullYear();
        let commits = 0;
        events.forEach(e => {
            if (e.type === 'PushEvent' && new Date(e.created_at).getFullYear() === year) {
                commits += (e.payload && e.payload.commits && e.payload.commits.length) || 1;
            }
        });
        setText('thisYearCommits', commits > 0 ? `${commits}+` : 'N/A');

        if (!feed) return;
        if (events.length === 0) {
            feed.replaceChildren(activityItem('fa-info-circle',
                [document.createTextNode('No recent public activity found')], 'Check back later'));
            return;
        }
        feed.replaceChildren(...events.slice(0, 5).map(ev => {
            const d = describe(ev);
            const strong = el('strong', '', d.repo);
            return activityItem(d.icon, [document.createTextNode(d.before), strong], getTimeAgo(new Date(ev.created_at)));
        }));
    }

    function init() {
        initFilters();
        initDevWindows();
        setText('ghYear', new Date().getFullYear());
        loadGitHub();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();