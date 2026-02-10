/* ============================================================
   ANReLa — Main JavaScript
   Scroll-driven homepage + page-specific interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // -- Scroll-driven homepage --
    const scrollDrive = document.getElementById('scrollDrive');
    const canvas = document.getElementById('heroCanvas');
    if (scrollDrive && canvas) {
        initScrollExperience(scrollDrive, canvas);
    }

    // -- Contact Form (join page only) --
    const form = document.getElementById('contactForm');
    if (form) {
        initContactForm(form);
    }
});

/* ============================================================
   SCROLL-DRIVEN HOMEPAGE EXPERIENCE
   Phase 1: Logo + Name
   Phase 2: Logo dismantles → neural network
   Phase 3: Title + CTA reveal
   ============================================================ */
function initScrollExperience(scrollDrive, canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    // DOM elements
    const phaseLogo = document.getElementById('phaselogo');
    const heroTitle = document.getElementById('heroTitle');
    const heroCta = document.getElementById('heroCta');
    const heroScroll = document.getElementById('heroScroll');
    const heroEmblem = document.getElementById('heroEmblem');

    // ── Neural Network Data ──
    const NODE_COUNT = 200;
    const CONNECTION_DIST = 180;
    let nodes = [];
    let connections = [];
    let pulses = [];
    let logoParticles = []; // particles from dismantled logo
    let frameCount = 0;

    // ── Logo center positions (calculated on resize) ──
    let logoCenterX, logoCenterY;

    // ── Particle class for logo dismantle ──
    class Particle {
        constructor(x, y) {
            this.originX = x;
            this.originY = y;
            // Random target position for neural network spread
            this.targetX = Math.random() * w;
            this.targetY = Math.random() * h;
            this.x = x;
            this.y = y;
            this.radius = 1 + Math.random() * 2;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.glow = 0;
            this.glowDecay = 0.02 + Math.random() * 0.02;
        }

        update(progress) {
            // progress: 0 = logo form, 1 = fully scattered
            const ease = easeInOutCubic(progress);
            this.x = this.originX + (this.targetX - this.originX) * ease;
            this.y = this.originY + (this.targetY - this.originY) * ease;
            this.glow = Math.max(0, this.glow - this.glowDecay);
        }

        fire() {
            this.glow = 1;
        }

        draw(ctx, time, networkAlpha) {
            const breathe = 0.5 + 0.5 * Math.sin(time * 0.8 + this.pulsePhase);
            const alpha = (0.2 + this.glow * 0.6 + breathe * 0.15) * networkAlpha;
            const r = this.radius + this.glow * 3;

            // Glow halo
            if (this.glow > 0.1 && networkAlpha > 0.3) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glow * 0.3 * networkAlpha})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.glow * 0.08 * networkAlpha})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.beginPath();
                ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }

    // ── Pulse class ──
    class Pulse {
        constructor(fromNode, toNode) {
            this.from = fromNode;
            this.to = toNode;
            this.progress = 0;
            this.speed = 0.015 + Math.random() * 0.01;
            this.alive = true;
            this.trail = [];
        }

        update() {
            this.progress += this.speed;
            if (this.progress >= 1) {
                this.to.fire();
                this.alive = false;
                // Chain reaction
                if (Math.random() < 0.3) {
                    spawnPulsesFrom(this.to);
                }
                return;
            }

            const t = this.progress;
            const mx = (this.from.x + this.to.x) / 2 + (this.to.y - this.from.y) * 0.06;
            const my = (this.from.y + this.to.y) / 2 - (this.to.x - this.from.x) * 0.06;
            const cx = (1 - t) * (1 - t) * this.from.x + 2 * (1 - t) * t * mx + t * t * this.to.x;
            const cy = (1 - t) * (1 - t) * this.from.y + 2 * (1 - t) * t * my + t * t * this.to.y;

            this.trail.push({ x: cx, y: cy });
            if (this.trail.length > 10) this.trail.shift();
        }

        draw(ctx, networkAlpha) {
            if (networkAlpha < 0.1) return;
            // Trail
            for (let i = 0; i < this.trail.length; i++) {
                const pt = this.trail[i];
                const fade = (i + 1) / this.trail.length;
                const alpha = fade * 0.8 * networkAlpha;
                const radius = 1 + fade * 1.5;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }

            // Bright head
            if (this.trail.length > 0) {
                const head = this.trail[this.trail.length - 1];
                const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 8);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * networkAlpha})`);
                gradient.addColorStop(0.4, `rgba(255, 255, 255, ${0.15 * networkAlpha})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.beginPath();
                ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    function spawnPulsesFrom(node) {
        const nearby = logoParticles.filter(p => {
            if (p === node) return false;
            const dx = p.x - node.x;
            const dy = p.y - node.y;
            return Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST;
        });
        if (nearby.length === 0) return;
        const count = Math.min(nearby.length, 1 + Math.floor(Math.random() * 2));
        const shuffled = nearby.sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            pulses.push(new Pulse(node, shuffled[i]));
        }
    }

    // ── Easing ──
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ── Initialize particles around logo center ──
    function initParticles() {
        logoParticles = [];
        logoCenterX = w / 2;
        logoCenterY = h / 2;

        for (let i = 0; i < NODE_COUNT; i++) {
            // Start particles clustered around logo center (within ~80px radius)
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80;
            const x = logoCenterX + Math.cos(angle) * radius;
            const y = logoCenterY + Math.sin(angle) * radius;
            logoParticles.push(new Particle(x, y));
        }
        pulses = [];
    }

    // ── Resize ──
    function resize() {
        dpr = window.devicePixelRatio || 1;
        w = canvas.parentElement.clientWidth;
        h = canvas.parentElement.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
    }

    // ── Scroll progress ──
    let scrollProgress = 0;
    function updateScroll() {
        const scrollTop = window.scrollY;
        const maxScroll = scrollDrive.offsetHeight - window.innerHeight;
        scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    }

    // ── Main Animation Loop ──
    let time = 0;
    function draw() {
        time += 0.016;
        frameCount++;
        ctx.clearRect(0, 0, w, h);

        const p = scrollProgress;

        // ── Phase control ──
        /*
          0.00 - 0.12  Phase 0: Big logo alone, centered
          0.12 - 0.35  Phase 1: Logo dissipates into particles
          0.35 - 0.65  Phase 2: Neural network fully active, many pulses
          0.55 - 0.75  Phase 3: "Argo Navis Research Laboratory" single line fades in
          0.80 - 1.00  Phase 4: "Explore our research" CTA fades in
        */

        // Logo emblem scale: starts big (3x), never shrinks — just fades out
        const logoScale = p < 0.05 ? 3 : p < 0.20 ? 3 - 0.5 * ((p - 0.05) / 0.15) : 2.5;

        // Entire logo phase opacity (visible 0-0.12, fades out 0.12-0.32)
        const logoPhaseAlpha = p < 0.12 ? 1 : p < 0.32 ? 1 - (p - 0.12) / 0.20 : 0;

        // Particle scatter progress (starts at 0.10, fully scattered by 0.45)
        const scatterProgress = p < 0.10 ? 0 : p < 0.45 ? (p - 0.10) / 0.35 : 1;

        // Network visibility (connections + pulses)
        const networkAlpha = p < 0.20 ? 0 : p < 0.40 ? (p - 0.20) / 0.20 : p < 0.90 ? 1 : 1 - (p - 0.90) / 0.10;

        // Single-line title opacity (fades in 0.55-0.72)
        const titleAlpha = p < 0.55 ? 0 : p < 0.72 ? (p - 0.55) / 0.17 : 1;

        // CTA opacity (fades in 0.80-0.95)
        const ctaAlpha = p < 0.80 ? 0 : Math.min(1, (p - 0.80) / 0.15);

        // Scroll indicator opacity
        const scrollAlpha = p < 0.05 ? 1 : p < 0.12 ? 1 - (p - 0.05) / 0.07 : 0;

        // ── Apply DOM elements ──
        // Logo phase: emblem stays big, whole phase fades out
        phaseLogo.style.opacity = logoPhaseAlpha;
        heroEmblem.style.transform = `scale(${logoScale})`;
        phaseLogo.style.pointerEvents = logoPhaseAlpha > 0.5 ? 'auto' : 'none';
        // Hide brand text in the hero logo phase (it's only in the navbar)
        const brandEl = phaseLogo.querySelector('.hero__brand');
        if (brandEl) brandEl.style.opacity = 0;
        if (brandEl) brandEl.style.display = 'none';

        // Single-line title
        heroTitle.style.opacity = titleAlpha;
        heroTitle.style.transform = `translateY(${(1 - titleAlpha) * 25}px)`;
        heroTitle.style.pointerEvents = titleAlpha > 0.5 ? 'auto' : 'none';

        heroCta.style.opacity = ctaAlpha;
        heroCta.style.transform = `translateY(${(1 - ctaAlpha) * 20}px)`;
        heroCta.style.pointerEvents = ctaAlpha > 0.5 ? 'auto' : 'none';

        heroScroll.style.opacity = scrollAlpha;

        // ── Navbar fade: fade out the logo text on scroll ──
        const navLogoText = document.querySelector('.nav__logo-text');
        if (navLogoText) {
            const navFade = p < 0.03 ? 1 : p < 0.12 ? 1 - (p - 0.03) / 0.09 : 0;
            navLogoText.style.opacity = navFade;
        }

        // ── Canvas: vignette ──
        // (handled by CSS ::before, but we can add more depth)

        // ── Canvas: Update particles ──
        for (const p of logoParticles) {
            p.update(scatterProgress);
        }

        // ── Canvas: Draw connections ──
        if (networkAlpha > 0.05) {
            for (let i = 0; i < logoParticles.length; i++) {
                for (let j = i + 1; j < logoParticles.length; j++) {
                    const a = logoParticles[i];
                    const b = logoParticles[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = Math.max(0, 0.06 * (1 - dist / CONNECTION_DIST) * networkAlpha);
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        const mx = (a.x + b.x) / 2 + dy * 0.04;
                        const my = (a.y + b.y) / 2 - dx * 0.04;
                        ctx.quadraticCurveTo(mx, my, b.x, b.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        // ── Canvas: Draw particles ──
        const particleAlpha = scatterProgress > 0.05 ? Math.min(1, scatterProgress * 2) : 0;
        if (particleAlpha > 0) {
            for (const p of logoParticles) {
                p.draw(ctx, time, particleAlpha);
            }
        }

        // ── Canvas: Fire pulses (only when network is visible) — MANY ──
        if (networkAlpha > 0.3 && frameCount % 12 === 0) {
            // Fire from 2-3 random nodes each cycle
            const burstCount = 2 + Math.floor(Math.random() * 2);
            for (let b = 0; b < burstCount; b++) {
                const randomNode = logoParticles[Math.floor(Math.random() * logoParticles.length)];
                randomNode.fire();
                spawnPulsesFrom(randomNode);
            }
        }

        // ── Canvas: Update and draw pulses ──
        for (const pulse of pulses) {
            pulse.update();
            pulse.draw(ctx, networkAlpha);
        }
        pulses = pulses.filter(p => p.alive);
        if (pulses.length > 150) pulses = pulses.slice(-120);

        requestAnimationFrame(draw);
    }

    // ── Events ──
    resize();

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    draw();
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            return;
        }

        // Mailto fallback
        const subject = encodeURIComponent(`Research Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:contact@argonavis-research.org?subject=${subject}&body=${body}`;
    });
}
