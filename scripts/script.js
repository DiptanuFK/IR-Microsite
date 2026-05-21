// ── Animation constants ──────────────────────────────────────────────────────
const HERO_ANIM_DELAY       = 0.2;   // s — delay before hero entrance starts
const COUNTER_DURATION_MS   = 1800;  // ms — impact stat counter duration
const HERO_COUNTER_DURATION = 1600;  // ms — hero pill counter duration
const HERO_COUNTER_DELAY    = 1000;  // ms — delay before hero counters start
const HERO_COUNTER_STAGGER  = 100;   // ms — gap between each hero counter
const PARALLAX_HERO         = 0.4;   // scroll fraction for hero bg
const PARALLAX_ADV          = 0.15;  // center-offset fraction for adv bg
const PARALLAX_IMPACT       = 0.15;  // center-offset fraction for impact photo
const MOBILE_BREAKPOINT     = 768;   // px — below this, impact parallax disabled

gsap.registerPlugin(ScrollTrigger);

// ── Shared counter factory ───────────────────────────────────────────────────
function animateCounter(el, duration) {
    const target = el.textContent.trim();
    const match  = target.match(/^([^0-9]*)([0-9.]+)([^0-9]*)$/);
    if (!match) return null;
    const prefix  = match[1];
    const end     = parseFloat(match[2]);
    const suffix  = match[3];
    const isFloat = match[2].includes('.');
    let raf;
    return {
        run() {
            cancelAnimationFrame(raf);
            const startTime = performance.now();
            function tick(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                el.textContent = prefix + (isFloat ? (eased * end).toFixed(1) : Math.floor(eased * end)) + suffix;
                if (progress < 1) raf = requestAnimationFrame(tick);
                else el.textContent = target;
            }
            raf = requestAnimationFrame(tick);
        },
        reset() { cancelAnimationFrame(raf); el.textContent = target; },
    };
}

// ── Parallax helper ──────────────────────────────────────────────────────────
function addParallax(el, updateFn) {
    if (!el) return;
    window.addEventListener('scroll', updateFn, { passive: true });
}

// Hamburger menu toggle + outside-click to close
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

// Hero entrance — h1 lines then stat pills stagger in on load
(function () {
    const heroText = document.querySelector('.hero-text');
    const pills    = document.querySelectorAll('.stat-pill');
    if (!heroText) return;

    const tl = gsap.timeline({ delay: HERO_ANIM_DELAY });

    tl.from(heroText, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
    })
    .from(pills, {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
    }, '-=0.4');
}());

// CEO section — GSAP line-by-line fade-in on scroll
(function () {
    const ceoContent = document.querySelector('.ceo-content');
    if (!ceoContent) return;

    const blockquote = ceoContent.querySelector('blockquote');
    const name       = ceoContent.querySelector('.ceo-name');
    const title      = ceoContent.querySelector('.ceo-title');

    const words = blockquote.innerText.trim().split(' ');
    blockquote.innerHTML = words.map(w => `<span class="ceo-word">${w}</span>`).join(' ');

    const allEls = [
        ...blockquote.querySelectorAll('.ceo-word'),
        name,
        title,
    ];

    gsap.set(allEls, { opacity: 0, y: 16 });

    ScrollTrigger.create({
        trigger: ceoContent,
        start: 'top 75%',
        onEnter: () => {
            gsap.to(allEls, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.04,
            });
        },
        onLeaveBack: () => {
            gsap.set(allEls, { opacity: 0, y: 16 });
        },
    });
}());

// ── What Sets Us Apart — pinned stacking deck ────────────────────────────────
(function () {
    const section = document.querySelector('.apart');
    const header  = document.querySelector('.apart-header h2');
    const cards   = gsap.utils.toArray('.apart-card');
    if (!section || !cards.length) return;

    // ── How to tune the animation ──────────────────────────────────────────
    // Total scroll distance = section height in CSS (.apart { height: 340vh })
    // The pin occupies 100vh; the remaining 240vh is shared across card transitions.
    // Each card transition = 240vh / 5 cards = ~48vh of scroll per card.
    // To slow down the stacking, increase .apart height (e.g. 400vh).
    // To speed it up, decrease it (e.g. 280vh).
    // The scrub value below controls lag: scrub: 1 = 1s smoothing behind scroll.
    // ──────────────────────────────────────────────────────────────────────

    // Phase 1 — Header entrance: fires once on scroll-into-view, NOT scrubbed
    gsap.from(header, {
        y: 40,
        scale: 0.8,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
    });

    // Card 0 entrance: same bounce-in as the header, slightly delayed
    gsap.from(cards[0], {
        y: 60,
        scale: 0.85,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.7)',
        delay: 0.15,
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
    });
    // Cards 1-4 wait below

    gsap.set(cards.slice(1), { autoAlpha: 0 });

    // Phase 2 — Pinned stacking deck
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',        // pin locks when section hits the top
            end: 'bottom bottom',    // unpin when the tall section scrolls out
            pin: '.apart-sticky',    // only the sticky inner div gets pinned
            scrub: 1,                // 1s smoothing; set to true for instant scrub
            anticipatePin: 1,
        },
    });

    // Timeline starts at card 1 (card 0 is already visible).
    // Each incoming card slides up from below while all previous cards scale back.
    // Increase the label spacing (e.g. '+=2') to give each transition more scroll room.
    tl.addLabel('card1', 0);

    cards.slice(1).forEach((card, idx) => {
        const i = idx + 1; // real index in the full cards array

        // Slide incoming card up and make it visible
        tl.to(card, {
            y: '0%',
            autoAlpha: 1,
            duration: 1,
            ease: 'power2.out',
        }, `card${i}`);

        // Push all previous cards back: progressively deeper scale + dim
        cards.slice(0, i).forEach((prev, j) => {
            const depth  = i - j;
            const scale  = Math.max(0.78, 1 - depth * 0.06);
            const dimAmt = Math.min(0.55, depth * 0.18);
            tl.to(prev, {
                scale,
                duration: 1,
                ease: 'power2.out',
            }, `card${i}`);
            tl.to(prev.querySelector('.apart-card-dim'), {
                backgroundColor: `rgba(0,0,0,${dimAmt})`,
                duration: 1,
                ease: 'power2.out',
            }, `card${i}`);
        });

        tl.addLabel(`card${i + 1}`, `card${i}+=1.4`);
    });

    // Small buffer at the end before unpin (already baked into .apart height)
    tl.to({}, { duration: 0.6 });
})();


// Parallax on hero bg
const heroBg = document.querySelector('.hero-bg');
addParallax(heroBg, () => {
    heroBg.style.transform = `translateY(${window.scrollY * PARALLAX_HERO}px)`;
});

// Impact stats — entrance + counter animations
(function () {
    const grid = document.querySelector('.impact-grid');
    if (!grid) return;

    const photoCard  = document.querySelector('.impact-photo-card');
    const istatCards = document.querySelectorAll('.istat');

    // Photo card slides in from left
    gsap.from(photoCard, {
        x: -60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: photoCard,
            start: 'top 80%',
        },
    });

    // Stat cards stagger in from bottom
    gsap.from(istatCards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
            trigger: grid,
            start: 'top 80%',
        },
    });

    // Counters — count up when card enters viewport, reset on leave
    document.querySelectorAll('.istat-num').forEach(el => {
        const counter = animateCounter(el, COUNTER_DURATION_MS);
        if (!counter) return;
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter:    () => counter.run(),
            onLeaveBack: () => counter.reset(),
        });
    });
}());

// Parallax on advantages bg
const advBgImg = document.querySelector('.adv-bg-img');
addParallax(advBgImg, () => {
    const section     = advBgImg.closest('.advantages');
    const rect        = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    advBgImg.style.transform = `translateY(calc(${centerOffset * -PARALLAX_ADV}px))`;
});

// Parallax on impact photo — disabled in single-column layout (≤768px)
const impactPhoto = document.querySelector('.impact-photo-card img');
if (impactPhoto) {
    const updateImpactParallax = () => {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            impactPhoto.style.transform = '';
            return;
        }
        const card         = impactPhoto.closest('.impact-photo-card');
        const rect         = card.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        impactPhoto.style.transform = `translate(-50%, calc(-50% + ${centerOffset * PARALLAX_IMPACT}px))`;
    };
    window.addEventListener('scroll', updateImpactParallax, { passive: true });
    window.addEventListener('resize', updateImpactParallax, { passive: true });
}

// Hero stat counters — fire after GSAP pill animation completes
// Pills done by ~1.5s; start counters at HERO_COUNTER_DELAY
(function () {
    document.querySelectorAll('.stat-num').forEach((el, i) => {
        const counter = animateCounter(el, HERO_COUNTER_DURATION);
        if (!counter) return;
        setTimeout(() => counter.run(), HERO_COUNTER_DELAY + i * HERO_COUNTER_STAGGER);
    });
}());
