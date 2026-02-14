/* ============================================================
   ANReLa — Shared Components
   Injects nav & footer on every page to avoid duplication
   ============================================================ */

function renderNav(activePage) {
  const pages = [
    { id: 'home', label: 'home', href: '/' },
    { id: 'research', label: 'research', href: '/research' },
    // { id: 'story', label: 'our story', href: '/story' },
    { id: 'team', label: 'team', href: '/team' },
    { id: 'join', label: 'Join ANRL', href: '/join' },
  ];

  const links = pages
    .map(p => `<a href="${p.href}" class="nav__link${p.id === activePage ? ' active' : ''}">${p.label}</a>`)
    .join('\n          ');

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'nav';

  // On non-home pages, make nav always visible
  if (activePage !== 'home') {
    nav.classList.add('nav--visible');
  }

  nav.innerHTML = `
    <div class="nav__inner">
      <a href="/" class="nav__logo">
        <img src="assets/ANReLa.svg" alt="ANReLa" />
        <span class="nav__logo-text">Argo Navis Research Laboratory</span>
      </a>
      <button class="nav__toggle" id="navToggle" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  document.body.prepend(nav);

  // Create mobile overlay as a separate element outside nav
  // (backdrop-filter on .nav creates a containing block that breaks position:fixed)
  const mobileOverlay = document.createElement('div');
  mobileOverlay.className = 'nav__links';
  mobileOverlay.id = 'navLinks';
  mobileOverlay.innerHTML = links;
  document.body.insertBefore(mobileOverlay, nav.nextSibling);

  // Mobile menu toggle
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });
}

function renderFooter() {
  // Only show footer on the "Join Us" page
  // Check if pathname contains 'join.html' OR if the active nav item passed to renderNav was 'join'
  // But renderNav is separate. Let's rely on the URL or allow an override.
  // Simple check:
  if (!window.location.pathname.includes('/join')) return;

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer__inner">
        <div class="footer__left">
          <div class="footer__name">Argo Navis Research Laboratory</div>
          <div class="footer__copy">© ${new Date().getFullYear()} ANRL. Open science, open source, open minds.</div>
        </div>
        <div class="footer__links">
          <a href="https://github.com/BGSTA9" target="_blank" rel="noopener" class="footer__link">
            GitHub
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://huggingface.co/argo-navis-research-laboratory" target="_blank" rel="noopener" class="footer__link">
            Hugging Face
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/soheil-s-495a62320/" target="_blank" rel="noopener" class="footer__link">
            LinkedIn
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://instagram.com/orcanopus" target="_blank" rel="noopener" class="footer__link">
            Instagram
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

/* ── Google Analytics (private dashboard at analytics.google.com) ── */
function renderAnalytics() {
  if (document.getElementById('ga-script')) return;
  const GA_ID = 'G-8EVBERXBL0';
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);
  script.onload = function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  };
}
