/* ============================================================
   ANReLa — Shared Components
   Injects nav & footer on every page to avoid duplication
   ============================================================ */

function renderNav(activePage) {
  const pages = [
    { id: 'home', label: 'home', href: 'index.html' },
    { id: 'research', label: 'research', href: 'research.html' },
    { id: 'story', label: 'our story', href: 'story.html' },
    { id: 'team', label: 'team', href: 'team.html' },
    { id: 'join', label: 'join us', href: 'join.html' },
  ];

  const links = pages
    .map(p => `<a href="${p.href}" class="nav__link${p.id === activePage ? ' active' : ''}">${p.label}</a>`)
    .join('\n          ');

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.id = 'nav';
  nav.innerHTML = `
    <div class="nav__inner">
      <a href="index.html" class="nav__logo">
        <img src="ANReLa.svg" alt="ANReLa" />
        <span class="nav__logo-text">Argo Navis Research Laboratory</span>
      </a>
      <div class="nav__links" id="navLinks">
        ${links}
      </div>
      <button class="nav__toggle" id="navToggle" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  document.body.prepend(nav);

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
  if (!window.location.href.includes('join.html')) return;

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer__inner">
        <div class="footer__left">
          <div class="footer__name">Argo Navis Research Laboratory</div>
          <div class="footer__copy">© ${new Date().getFullYear()} ANReLa. Open science, open source, open minds.</div>
        </div>
        <div class="footer__links">
          <a href="https://github.com" target="_blank" rel="noopener" class="footer__link">
            GitHub
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://huggingface.co" target="_blank" rel="noopener" class="footer__link">
            Hugging Face
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="footer__link">
            LinkedIn
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" class="footer__link">
            Instagram
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}
