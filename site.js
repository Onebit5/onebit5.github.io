/**
 * site.js : single source of truth for identity fields, the site navigation, and
 * the main page's copy-email button.
 *
 * loaded by every page. the copy-email button only exists on index.html, so its
 * wiring is gated on the element's presence.
 */
(function () {
    var SITE = {
        name: 'Jose A. Perez de Azpillaga',
        city: 'Málaga',
        country: 'Spain'
    };

    SITE.year = String(new Date().getFullYear());

    // the nav lives here rather than in every page: it used to be duplicated
    // across seven html files, so adding an entry meant editing all of them and
    // they drifted (blog pages kept a broken "Contributions" link for months).
    // 'root' marks the single entry that points at the site root, which is the
    // prefix itself rather than a hash.
    var NAV = [
        { label: 'Home',          root: true },
        { label: 'Skills',        href: '#skills' },
        { label: 'Experience',    href: '#experience' },
        { label: 'Projects',      href: '#projects' },
        { label: 'Education',     href: '#education' },
        { label: 'Blog',          href: 'blog/' },
        { label: 'Contact',       href: '#contact' }
    ];

    // how far this page sits below the site root, derived from this script's own
    // resolved src rather than hardcoded: that keeps it correct for /blog/<date>/
    // as well as /, and for file:// previews where the root is a real directory.
    function rootPrefix() {
        var script = document.querySelector('script[src$="site.js"]');
        if (!script) return '';

        var rootDir = script.src.replace(/[^/]*$/, '');
        var pageDir = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
        if (pageDir.indexOf(rootDir) !== 0) return '';

        return pageDir.slice(rootDir.length).split('/').filter(Boolean)
            .map(function () { return '../'; }).join('');
    }

    function buildNav() {
        var list = document.querySelector('.nav-links');
        if (!list) return null;

        var prefix = rootPrefix();

        NAV.forEach(function (item) {
            var li = document.createElement('li');
            var a = document.createElement('a');

            a.className = 'nav-item';
            a.href = item.root ? (prefix || './') : prefix + item.href;
            a.textContent = item.label;

            li.appendChild(a);
            list.appendChild(li);
        });

        return list;
    }

    // under 768px the CSS collapses .nav-links into a dropdown and reveals it
    // with .active, but the button that sets that class was in no page and
    // nothing ever toggled it, so the nav was unreachable on a phone
    function buildNavToggle(list) {
        var nav = document.querySelector('header nav');
        if (!nav) return;

        if (!list.id) list.id = 'siteNav';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mobile-menu-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation');
        toggle.setAttribute('aria-controls', list.id);
        toggle.setAttribute('aria-expanded', 'false');

        var bar = document.createElement('span');
        bar.className = 'hamburger';
        toggle.appendChild(bar);

        function setOpen(open) {
            list.classList.toggle('active', open);
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        toggle.addEventListener('click', function () {
            setOpen(!list.classList.contains('active'));
        });

        // following a link or pressing escape should dismiss the dropdown
        list.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && list.classList.contains('active')) setOpen(false);
        });

        nav.insertBefore(toggle, list);
    }

    var navList = buildNav();
    if (navList) buildNavToggle(navList);

    window.SITE = SITE;

    function fill(str) {
        return str.replace(/\{\{(\w+)\}\}/g, function (match, key) {
            return Object.prototype.hasOwnProperty.call(SITE, key) ? SITE[key] : match;
        });
    }

    function run() {
        document.title = fill(document.title);

        document.querySelectorAll('[data-site]').forEach(function (el) {
            var key = el.getAttribute('data-site');
            if (Object.prototype.hasOwnProperty.call(SITE, key)) {
                el.textContent = SITE[key];
            }
        });

        document.querySelectorAll('*').forEach(function (el) {
            Array.prototype.forEach.call(el.attributes, function (attr) {
                if (attr.value.indexOf('{{') !== -1) {
                    el.setAttribute(attr.name, fill(attr.value));
                }
            });
        });
    }

    // main page only: blog pages load this file and have no copy button
    function initEmailCopy(copyEmailBtn) {
        const emailParts = ['azpijr', 'gmail', 'com'];
        const emailAddress = emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2];
        const emailCopied = document.getElementById('emailCopied');

        copyEmailBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(emailAddress).then(function () {
                emailCopied.style.opacity = '1';
                emailCopied.style.transform = 'translateY(0)';
                setTimeout(function () {
                    emailCopied.style.opacity = '0';
                    emailCopied.style.transform = 'translateY(-5px)';
                }, 2000);
            });
        });
    }

    function init() {
        run();

        const copyEmailBtn = document.getElementById('copyEmail');
        if (copyEmailBtn) initEmailCopy(copyEmailBtn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // the blog posts load katex deferred, after this file, so this waits for
    // DOMContentLoaded -- by then every deferred script has run. inert on the
    // pages that never load katex.
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof renderMathInElement !== 'function') return;

        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false }
            ],
            throwOnError: false
        });
    });

})();
