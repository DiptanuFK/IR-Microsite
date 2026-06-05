(function () {
'use strict';

// Smooth page transitions for cross-page nav links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        e.preventDefault();
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        document.body.addEventListener('transitionend', () => {
            window.location.href = href;
        }, { once: true });
    });
});

// ── Constants ────────────────────────────────────────────────────────────────
const SECTION_COUNT     = 6;
const AUTO_ADVANCE_MS   = 60000;  // ms — time on intro before auto-scrolling to first brand
const PARALLAX_DRIFT    = 0.15;   // fraction of vh for section bg parallax
const SWITCH_DELAY_MS   = 300;    // ms — num exit animation before content swap
const PEEK_SCROLL_RANGE = 3;      // peek reveal tracks over this many viewport heights
const CONTENT_SWAP_LEAD = 0.6;    // next section triggers content swap when this fraction from top

// CSS classes required on #ui-logo-inner:
// .logo-entering { transform: scale(0.4); opacity: 0; transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease; }
// .logo-visible  { transform: scale(1);   opacity: 1; }

// ── Device detection ─────────────────────────────────────────────────────────
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

document.querySelector('#ui-cta span').textContent =
  isMobileDevice ? 'Swipe up to explore' : 'Scroll to explore';

const DATA = [
    { logo: null,                           bullets: [] },
    { logo: 'images/myntra%20logo.svg',     bullets: ['Leading Lifestyle destination for India','Differentiated offerings: Luxe (Premium), Mnow (Quick), Fwd (GenZ)','3K+ popular global brands, 1.5K+ D2C Brands'] },
    { logo: 'images/Shopsy%20logo.svg',     bullets: ['Hypervalue Leader – Affordable AND quality','Over 450 million downloads','Enables "king-size" living on a budget','Unparalleled market access for all sellers'] },
    { logo: 'images/Cleartrip%20logo.svg',  bullets: ['India\'s fastest-growing travel tech company.','Seamless, end-to-end booking for flights, hotels and trains','Industry-first offerings including ClearChoice and Visa Rejection Cover.'] },
    { logo: 'images/Super-Money.svg',       bullets: ['300Mn+ UPI Transactions monthly','Marketplace for loans, insurance','Bank-Grade Security: Fully ISO 27001 and PCI DSS certified'] },
    { logo: 'images/Minutes%20logo.svg',    bullets: ['1000+ Dark Stores','Delivery in Minutes'] },
];

const sections      = Array.from({length: SECTION_COUNT}, (_, i) => document.getElementById('sec' + i));
const bgs           = Array.from({length: SECTION_COUNT}, (_, i) => document.getElementById('bg' + i));
const uiLine        = document.getElementById('ui-line');
const uiLineFill    = document.getElementById('ui-line-fill');
const uiLogo        = document.getElementById('ui-logo');
const uiLogoInner   = document.getElementById('ui-logo-inner');
const uiLogoImg     = document.getElementById('ui-logo-img');
const uiIntro       = document.getElementById('ui-intro');
const uiText        = document.getElementById('ui-text');
const uiTextList    = uiText ? uiText.querySelector('ul') : null;
const uiCtaIcon     = document.getElementById('ui-cta-icon');

// Guard — bail out if critical elements are missing
if (!sections[0] || !uiLine || !uiLogo || !uiText || !uiLogoInner) return;

let current      = -1;
let pending      = -1;
let autoRaf      = null;
let autoStart    = null;
let scrollRaf    = null;
let switchTimers = [];

function switchTo(i) {
    if (current === i || pending === i) return;
    pending = i;

    switchTimers.forEach(t => clearTimeout(t));
    switchTimers = [];

    switchTimers.push(setTimeout(() => doSwitch(i), SWITCH_DELAY_MS));
}

function doSwitch(i) {
    switchTimers.forEach(t => clearTimeout(t));
    switchTimers = [];
    current = i;
    pending = i;
    const d = DATA[i];

    uiLogo.classList.remove('vis');
    uiLogoInner.classList.remove('logo-visible', 'logo-entering');
    uiLogoImg.style.cssText = '';
    uiTextList.querySelectorAll('li').forEach(li => li.classList.remove('vis'));
    uiIntro.querySelectorAll('p').forEach(p => p.classList.remove('vis'));

    if (i === 0) {
        uiEl.classList.add('ui--intro');
        uiLine.classList.add('ui-hidden');
        uiLogo.classList.add('ui-hidden');
        uiText.classList.add('ui-hidden');
        uiIntro.classList.remove('ui-hidden');
        uiIntro.classList.remove('exit');
        uiCtaIcon.classList.add('morph-out');
        setTimeout(() => {
            uiCtaIcon.src = 'images/arrow-down.svg';
            uiCtaIcon.classList.remove('morph-out');
            uiCtaIcon.classList.add('morph-in');
            setTimeout(() => uiCtaIcon.classList.remove('morph-in'), 200);
        }, 200);
        switchTimers.push(setTimeout(() => document.getElementById('ip0').classList.add('vis'), 150));
        switchTimers.push(setTimeout(() => document.getElementById('ip1').classList.add('vis'), 450));
        stopAuto();
        startAuto();
    } else {
        uiEl.classList.remove('ui--intro');
        uiIntro.classList.add('exit');
        setTimeout(() => uiIntro.classList.add('ui-hidden'), 400);

        uiLine.classList.remove('ui-hidden');
        uiLogo.classList.remove('ui-hidden');
        uiText.classList.remove('ui-hidden');
        uiCtaIcon.classList.add('morph-out');
        setTimeout(() => {
            uiCtaIcon.src = 'images/arrows-vertical.svg';
            uiCtaIcon.classList.remove('morph-out');
            uiCtaIcon.classList.add('morph-in');
            setTimeout(() => uiCtaIcon.classList.remove('morph-in'), 200);
        }, 200);
        stopAuto();

        uiLogoImg.src = d.logo;
        uiLogoImg.alt = '';
        uiLogoInner.classList.add('logo-entering');
        uiLogoImg.style.cssText = 'width:80%; height:80%; object-fit:contain; display:block;';

        uiTextList.replaceChildren(...d.bullets.map(b => {
            const li = document.createElement('li');
            li.textContent = b;
            return li;
        }));

        switchTimers.push(setTimeout(() => uiLogo.classList.add('vis'), 100));
        switchTimers.push(setTimeout(() => {
            uiLogoInner.classList.remove('logo-entering');
            uiLogoInner.classList.add('logo-visible');
        }, 250));
        uiTextList.querySelectorAll('li').forEach((li, n) =>
            switchTimers.push(setTimeout(() => li.classList.add('vis'), 250 + n * 130))
        );
    }
}

function updateLine(t) {
    uiLineFill.style.width = (t * 100) + '%';
}

function startAuto() {
    autoStart = performance.now();
    function tick(now) {
        const t = Math.min((now - autoStart) / AUTO_ADVANCE_MS, 1);
        updateLine(t);
        if (t >= 1) { scrollToSection(1); return; }
        autoRaf = requestAnimationFrame(tick);
    }
    autoRaf = requestAnimationFrame(tick);
}

function stopAuto() {
    if (autoRaf) { cancelAnimationFrame(autoRaf); autoRaf = null; }
}

function scrollToSection(i) {
    const sec = sections[i];
    if (!sec) return;
    gsap.to(window, {
        duration: .2,
        scrollTo: { y: sec, autoKill: false },
        ease: 'power2.Out',
        overwrite: 'auto',
    });
}

/* ── GSAP ── */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* Parallax per section */
sections.forEach((sec, i) => {
    const bg = bgs[i];
    if (!bg) return;

    ScrollTrigger.create({
        trigger: sec,
        start: 'top top',
        end: () => `+=${window.innerHeight * PEEK_SCROLL_RANGE}`,
        scrub: .5,
        onUpdate: self => {
            const maxDrift = window.innerHeight * PARALLAX_DRIFT;
            gsap.set(bg, { y: -self.progress * maxDrift });
        },
    });
});

/* ── Scroll UI elements up with Minutes screen into footer ── */
const uiEl = document.getElementById('ui');
ScrollTrigger.create({
    trigger: '#apart-business',
    start: 'top bottom',
    end: 'top top',
    scrub: true,
    onUpdate: self => {
        gsap.set(uiEl, { y: -self.progress * window.innerHeight });
    },
    onLeave:     () => gsap.set(uiEl, { y: -window.innerHeight }),
    onEnterBack: () => {},
});

/* ── Scroll-based content swap + line ── */
function onScroll() {
    const sy = window.scrollY;
    const vh = window.innerHeight;

    sections.forEach((sec, i) => {
        const top   = sec.offsetTop;
        const enter = i === 0 ? 0 : top - vh * CONTENT_SWAP_LEAD;
        const next  = sections[i + 1];
        const exit  = next ? next.offsetTop - vh * CONTENT_SWAP_LEAD : Infinity;
        if (sy >= enter && sy < exit && current !== i) switchTo(i);
    });

    /* Global line progress */
    const start   = sections[1].offsetTop;
    const end     = sections[SECTION_COUNT - 1].offsetTop;
    const globalT = Math.max(0, Math.min(1, (sy - start) / (end - start)));
    if (sy >= start) updateLine(globalT);
}

window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => { scrollRaf = null; onScroll(); });
}, { passive: true });

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault(); scrollToSection(Math.min(current + 1, SECTION_COUNT - 1));
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault(); scrollToSection(Math.max(current - 1, 0));
    }
});

window.scrollTo(0, 0);
requestAnimationFrame(onScroll);

})();
