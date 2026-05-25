// ── Nav: Active link detection ────────────────────────────────────────────────
// Automatically marks the nav link matching the current page as .active,
// so every page uses the same nav HTML without any hardcoded active class.
(function () {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topnav a[href]').forEach(function (link) {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}());

// ── Nav: Hamburger menu toggle + outside-click to close ──────────────────────
(function () {
    const btn      = document.querySelector('.nav-hamburger');
    const dropdown = document.querySelector('.nav-dropdown');
    if (!btn || !dropdown) return;

    function openMenu() {
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('is-open');
        dropdown.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('is-open');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        btn.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            closeMenu();
        }
    });
}());
