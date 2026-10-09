(() => {
    'use strict';

    const GITHUB_USER = 'Sanssskar';
    const API = 'https://api.github.com';

    /* ---------- Share buttons ---------- */
    function shareProject(button) {
        const card = button.closest('.project-card');
        if (!card) return;
        const name = card.dataset.project || '';
        const url = encodeURIComponent(card.dataset.url || '');
        const text = encodeURIComponent(
            `Check out this amazing project: ${name} by Sanskar Shrestha, a Full Stack Laravel Developer from Nepal.`
        );
        const targets = {
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`
        };
        const target = targets[button.dataset.social];
        if (target) window.open(target, '_blank', 'noopener,noreferrer,width=600,height=500');
    }

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

    document.addEventListener('click', (e) => {
        const share = e.target.closest('.share-btn');
        if (share) return shareProject(share);
        const toastBtn = e.target.closest('[data-toast]');
        if (toastBtn) showToast(toastBtn.dataset.toast);
    });

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
        setText('ghYear', new Date().getFullYear());
        loadGitHub();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
