/* ============================================
   ARGO NAVIS RESEARCH LABORATORY — Main Script
   Navigation, animations, prime spiral canvas
   ============================================ */

(function () {
    'use strict';

    // --- DOM Elements ---
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section[id]');
    const reveals = document.querySelectorAll('.reveal');
    const canvas = document.getElementById('hero-canvas');

    // --- Navbar Scroll Effect ---
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // --- Active Nav Link ---
    function highlightActiveLink() {
        const scrollPos = window.scrollY + 200;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // --- Mobile Menu ---
    function toggleMobileMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    // --- Scroll Reveal (IntersectionObserver) ---
    function initScrollReveal() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        reveals.forEach((el) => observer.observe(el));
    }

    // --- Prime Spiral Canvas (Ulam Spiral) ---
    function initPrimeSpiral() {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let w, h, dpr;
        let animationId;
        let time = 0;

        function isPrime(n) {
            if (n < 2) return false;
            if (n === 2) return true;
            if (n % 2 === 0) return false;
            for (let i = 3; i * i <= n; i += 2) {
                if (n % i === 0) return false;
            }
            return true;
        }

        function resize() {
            dpr = window.devicePixelRatio || 1;
            w = canvas.parentElement.offsetWidth;
            h = canvas.parentElement.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.scale(dpr, dpr);
        }

        function spiralCoords(n) {
            // Ulam spiral coordinates
            if (n === 0) return { x: 0, y: 0 };

            let layer = Math.ceil((Math.sqrt(n) - 1) / 2);
            let leg = Math.floor((n - (2 * layer - 1) * (2 * layer - 1)) / (2 * layer));
            let idx = (n - (2 * layer - 1) * (2 * layer - 1)) % (2 * layer);

            let x, y;
            switch (leg) {
                case 0:
                    x = layer;
                    y = -layer + 1 + idx;
                    break;
                case 1:
                    x = layer - 1 - idx;
                    y = layer;
                    break;
                case 2:
                    x = -layer;
                    y = layer - 1 - idx;
                    break;
                case 3:
                    x = -layer + 1 + idx;
                    y = -layer;
                    break;
                default:
                    x = 0;
                    y = 0;
            }
            return { x, y };
        }

        function draw() {
            time += 0.003;
            ctx.clearRect(0, 0, w, h);

            const cx = w * 0.65;
            const cy = h * 0.5;
            const spacing = Math.min(w, h) / 100;
            const maxN = 2500;

            for (let n = 1; n <= maxN; n++) {
                if (!isPrime(n)) continue;

                const { x, y } = spiralCoords(n);
                const px = cx + x * spacing;
                const py = cy + y * spacing;

                // Check if point is visible
                if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

                // Pulsing glow
                const pulse = 0.5 + 0.5 * Math.sin(time * 2 + n * 0.1);
                const size = 1 + pulse * 0.8;
                const alpha = 0.3 + pulse * 0.4;

                // Distance-based fade
                const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
                const maxDist = Math.min(w, h) * 0.45;
                const distFade = Math.max(0, 1 - dist / maxDist);

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${alpha * distFade})`;
                ctx.fill();

                // Subtle glow ring for some primes
                if (n < 200) {
                    ctx.beginPath();
                    ctx.arc(px, py, size + 2 + pulse, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 212, 255, ${0.05 * distFade * pulse})`;
                    ctx.fill();
                }
            }

            // Subtle grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 0.5;
            const gridSpacing = 60;
            for (let gx = gridSpacing; gx < w; gx += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, h);
                ctx.stroke();
            }
            for (let gy = gridSpacing; gy < h; gy += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        }

        resize();
        draw();

        window.addEventListener('resize', () => {
            cancelAnimationFrame(animationId);
            resize();
            draw();
        });
    }

    // --- Contact Form ---
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = form.querySelector('[name="name"]').value.trim();
            const email = form.querySelector('[name="email"]').value.trim();
            const message = form.querySelector('[name="message"]').value.trim();

            if (!name || !email || !message) {
                return;
            }

            // Mailto fallback
            const subject = encodeURIComponent(`[ANReLa] Inquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
            window.location.href = `mailto:contact@argonavis-research.org?subject=${subject}&body=${body}`;
        });
    }

    // --- Smooth scroll for nav links ---
    function initSmoothScroll() {
        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    closeMobileMenu();
                    const offset = navbar.offsetHeight;
                    const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    // --- Initialize ---
    function init() {
        window.addEventListener('scroll', () => {
            handleNavbarScroll();
            highlightActiveLink();
        }, { passive: true });

        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }

        initSmoothScroll();
        initScrollReveal();
        initPrimeSpiral();
        initContactForm();

        // Trigger initial states
        handleNavbarScroll();
        highlightActiveLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
