// ── Animation constants ──────────────────────────────────────────────────────
const HERO_ANIM_DELAY       = 0.2;   // s — delay before hero entrance starts
const COUNTER_DURATION_MS   = 1800;  // ms — impact stat counter duration
const HERO_COUNTER_DURATION = 1600;  // ms — hero pill counter duration
const HERO_COUNTER_DELAY    = 1000;  // ms — delay before hero counters start
const HERO_COUNTER_STAGGER  = 100;   // ms — gap between each hero counter
const PARALLAX_HERO         = 0.4;   // scroll fraction for hero bg
const PARALLAX_ADV          = 0.15;  // center-offset fraction for adv bg
const PARALLAX_IMPACT       = 0.15;  // center-offset fraction for impact photo
const PARALLAX_GOV_IMG      = 0.10;  // center-offset fraction for gov section images
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
    const proxy   = { val: 0 };
    let tween;
    return {
        run() {
            if (tween) tween.kill();
            proxy.val = 0;
            tween = gsap.to(proxy, {
                val: end,
                duration: duration / 1000,
                ease: 'expo.out',
                onUpdate() {
                    el.textContent = prefix + (isFloat ? proxy.val.toFixed(1) : Math.floor(proxy.val)) + suffix;
                },
                onComplete() { el.textContent = target; },
            });
        },
        reset() { if (tween) tween.kill(); el.textContent = target; },
    };
}

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

// ── What Sets Us Apart — header fade-in on scroll ────────────────────────────
(function () {
    const header = document.querySelector('.apart-header h2');
    if (!header) return;

    gsap.from(header, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
        },
    });
})();


// Parallax on hero bg — direct scroll listener avoids ScrollTrigger no-trigger edge cases
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
    const updateHeroBg = () => gsap.set(heroBg, { y: window.scrollY * PARALLAX_HERO });
    updateHeroBg();
    window.addEventListener('scroll', updateHeroBg, { passive: true });
}

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
if (advBgImg) {
    const advSection = advBgImg.closest('.advantages');
    ScrollTrigger.create({
        trigger: advSection,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
            gsap.set(advBgImg, {
                y: (0.5 - self.progress) * (window.innerHeight + advSection.offsetHeight) * PARALLAX_ADV,
            });
        },
    });
}

// Parallax on impact photo — disabled in single-column layout (≤768px)
const impactPhoto = document.querySelector('.impact-photo-card img');
if (impactPhoto) {
    const impactCard = impactPhoto.closest('.impact-photo-card');
    gsap.matchMedia().add(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`, () => {
        gsap.set(impactPhoto, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
        const st = ScrollTrigger.create({
            trigger: impactCard,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate(self) {
                const offset = (0.5 - self.progress) * (window.innerHeight + impactCard.offsetHeight);
                gsap.set(impactPhoto, { y: offset * PARALLAX_IMPACT });
            },
        });
        return () => { st.kill(); gsap.set(impactPhoto, { clearProps: 'transform' }); };
    });
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

// Ethics & Compliance Leadership (governance.html)
(function () {
    const desktopBtns = document.querySelectorAll('.ecl-avatar-btn');
    const panels      = document.querySelectorAll('.ecl-panel');
    const mobDropdown = document.querySelector('.ecl-mob-dropdown');
    const mobTrigger  = document.querySelector('.ecl-mob-trigger');
    const mobList     = document.querySelector('.ecl-mob-list');
    const mobItems    = document.querySelectorAll('.ecl-mob-item');
    if (!desktopBtns.length && !mobTrigger) return;

    function closeMobDropdown() {
        if (!mobDropdown) return;
        mobDropdown.classList.remove('is-open');
        if (mobTrigger) mobTrigger.setAttribute('aria-expanded', 'false');
        if (mobList)    mobList.setAttribute('aria-hidden', 'true');
        const quoteCard = document.querySelector('.ecl-quote-card');
        if (quoteCard) quoteCard.classList.remove('blurred');
    }

    function updateMobTrigger(index) {
        if (!mobTrigger) return;
        const src = document.querySelector(`.ecl-mob-item[data-profile="${index}"]`);
        if (!src) return;
        const triggerImg  = mobTrigger.querySelector('.ecl-mob-img-wrap img');
        const triggerName = mobTrigger.querySelector('.ecl-name');
        const triggerRole = mobTrigger.querySelector('.ecl-role');
        const srcImg  = src.querySelector('.ecl-mob-sm-img-wrap img');
        const srcName = src.querySelector('.ecl-name');
        const srcRole = src.querySelector('.ecl-role');
        if (triggerImg && srcImg)   { triggerImg.src = srcImg.src; triggerImg.alt = srcImg.alt; }
        if (triggerName && srcName) triggerName.textContent = srcName.textContent;
        if (triggerRole && srcRole) triggerRole.textContent = srcRole.textContent;
    }

    function activate(index) {
        const i = String(index);
        desktopBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.profile === i);
            btn.setAttribute('aria-selected', String(btn.dataset.profile === i));
        });
        panels.forEach(p => p.classList.toggle('active', p.dataset.profile === i));
        mobItems.forEach(item => {
            item.classList.toggle('active', item.dataset.profile === i);
            item.setAttribute('aria-selected', String(item.dataset.profile === i));
        });
        updateMobTrigger(i);
    }

    desktopBtns.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.profile)));

    if (mobTrigger) {
        mobTrigger.addEventListener('click', () => {
            const isOpen = mobDropdown.classList.toggle('is-open');
            mobTrigger.setAttribute('aria-expanded', String(isOpen));
            if (mobList) mobList.setAttribute('aria-hidden', String(!isOpen));
            const quoteCard = document.querySelector('.ecl-quote-card');
            if (quoteCard) {
                if (isOpen) {
                    quoteCard.classList.add('blurred');
                } else {
                    quoteCard.classList.remove('blurred');
                }
            }
        });
    }

    mobItems.forEach(item => {
        item.addEventListener('click', () => {
            activate(item.dataset.profile);
            closeMobDropdown();
        });
    });

    document.addEventListener('click', e => {
        if (mobDropdown && !mobDropdown.contains(e.target)) closeMobDropdown();
    });
}());

// Parallax on Environmental Sustainability + Foundation images (governance.html)
['.gov-env-img', '.gov-fdn-img'].forEach(sel => {
    const img = document.querySelector(sel);
    if (!img) return;
    const container = img.parentElement;
    ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
            gsap.set(img, {
                y: (0.5 - self.progress) * (window.innerHeight + container.offsetHeight) * PARALLAX_GOV_IMG,
            });
        },
    });
});

// ── Apart tabs ────────────────────────────────────────────────────────────────
(function () {
  const tabs  = document.querySelectorAll('.apart-tab');
  const cards = document.querySelectorAll('.apart-card');
  if (!tabs.length || !cards.length) return;

  let current = 0;
  let autoTimer = null;
  const INTERVAL = 5000;

  function activate(idx) {
    tabs.forEach(t => t.classList.remove('apart-tab--active'));
    cards.forEach(c => c.classList.remove('apart-card--active'));
    tabs[idx].classList.add('apart-tab--active');
    const target = document.querySelector(`.apart-card[data-card="${idx}"]`);
    if (target) target.classList.add('apart-card--active');
    current = idx;
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      activate((current + 1) % tabs.length);
    }, INTERVAL);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activate(Number(tab.dataset.tab));
      startAuto(); // reset timer on manual click
    });
  });

  startAuto();
}());
