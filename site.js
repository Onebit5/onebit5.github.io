/**
 * site.js : single source of truth for identity fields, the site navigation, and
 * the main page's view switcher.
 *
 * loaded by every page. the view switcher only applies to index.html, the only
 * page carrying those elements, so it is gated on their presence.
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
        { label: 'Contributions', href: '#contributions', id: 'contributionsNav' },
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

    // runs during site.js's deferred execution, which is after the document has
    // been parsed but before DOMContentLoaded -- so the inline script on
    // index.html can still find these links from its DOMContentLoaded handler
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
            if (item.id) a.id = item.id;

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

    // main page only: blog pages load this file and have none of these elements
    function initViews() {
        // View Management
        //
        // views are described in one table, so adding one is an entry here
        // rather than another near-duplicate switch function.
        const VIEWS = {
            portfolio: {
                el: document.getElementById('portfolioView'),
                hash: '#',
                toggle: 'Contributions',
            },
            contributions: {
                el: document.getElementById('contributionsView'),
                hash: '#contributions',
                toggle: 'Profile',
            },
        };
        const viewToggleBtn = document.getElementById('viewToggleBtn');
        let currentView = 'portfolio';

        function viewForHash(hash) {
            return Object.keys(VIEWS).find(name => VIEWS[name].hash === hash) || null;
        }

        // bring a view on screen; onShown runs once it is displayed, which is
        // what a caller needs before scrolling to something inside it
        function renderView(name, onShown) {
            if (name === currentView) {
                if (onShown) onShown(); else window.scrollTo(0, 0);
                return;
            }
            const from = VIEWS[currentView].el;
            const to = VIEWS[name].el;
            from.style.display = 'none';
            from.classList.remove('fade-in');
            to.style.display = 'block';
            to.classList.remove('fade-in');
            void to.offsetWidth;        // force reflow so fadeInUp replays
            to.classList.add('fade-in');
            currentView = name;
            viewToggleBtn.textContent = VIEWS[name].toggle;
            if (onShown) onShown(); else window.scrollTo(0, 0);
        }

        function goToView(name) {
            renderView(name);
            history.pushState({ view: name }, '', VIEWS[name].hash);
        }

        // the section anchors point inside #portfolioView, so following one from
        // another view has to bring the portfolio back first -- otherwise the
        // target sits in a display:none container and nothing appears to happen
        function goToSection(id) {
            renderView('portfolio', function () {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView();
            });
            history.pushState({ view: 'portfolio', section: id }, '', '#' + id);
        }

        function syncFromHash() {
            const name = viewForHash(window.location.hash);
            if (name) {
                renderView(name);
                return;
            }
            const id = window.location.hash.slice(1);
            if (id && document.getElementById(id)) {
                renderView('portfolio', function () {
                    document.getElementById(id).scrollIntoView();
                });
                return;
            }
            renderView('portfolio');
        }

        viewToggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            goToView(currentView === 'portfolio' ? 'contributions' : 'portfolio');
        });

        // the nav is injected earlier in this same deferred script, so the links
        // already exist by the time this runs
        function wireNav() {
            document.getElementById('contributionsNav').addEventListener('click', function (e) {
                e.preventDefault();
                goToView('contributions');
            });

            // nav hash links are either a view (wired above) or a section of the
            // portfolio view, which has to be brought back on screen first
            document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (link) {
                const id = link.getAttribute('href').slice(1);
                if (!id || viewForHash('#' + id)) return;
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    goToSection(id);
                });
            });
        }

        wireNav();

        window.addEventListener('popstate', syncFromHash);
        window.addEventListener('hashchange', syncFromHash);

        syncFromHash();

        // Email Copy
        const emailParts = ['azpijr', 'gmail', 'com'];
        const emailAddress = emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2];
        const copyEmailBtn = document.getElementById('copyEmail');
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

        // Filtering Logic
        const filterButtons = document.querySelectorAll('.filter-btn');
        // scoped to the contributions view: a future view could hold
        // .contribution-item nodes too, and a global selector would let
        // these buttons hide them, with no way to bring them back
        const contributionItems =
            VIEWS.contributions.el.querySelectorAll('.contribution-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                const filter = this.dataset.filter;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                contributionItems.forEach(item => {
                    if (filter === 'all' || item.dataset.project === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    function init() {
        run();
        if (document.getElementById('portfolioView')) initViews();
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
