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
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroCta = document.getElementById('heroCta');
    const heroScroll = document.getElementById('heroScroll');
    const heroEmblem = document.getElementById('heroEmblem');

    // ── Neural Network Data ──
    const NODE_COUNT = 200;
    const CONNECTION_DIST = 180;
    let nodes = [];
    let connections = [];
    let pulses = [];
    let logoParticles = [];
    let frameCount = 0;
    let logoCenterX, logoCenterY;

    // ── Particle class (with polyrhythmic flickering) ──
    class Particle {
        constructor(x, y) {
            this.originX = x;
            this.originY = y;
            this.targetX = Math.random() * w;
            this.targetY = Math.random() * h;
            this.x = x;
            this.y = y;
            this.radius = 1 + Math.random() * 2;

            // Polyrhythmic flicker: 3 overlapping sine waves at different frequencies
            this.flickerFreq1 = 3.0 + Math.random() * 5.0;   // fast: 3–8 Hz
            this.flickerFreq2 = 1.2 + Math.random() * 2.5;   // medium: 1.2–3.7 Hz
            this.flickerFreq3 = 0.3 + Math.random() * 0.8;   // slow envelope: 0.3–1.1 Hz
            this.flickerPhase1 = Math.random() * Math.PI * 2;
            this.flickerPhase2 = Math.random() * Math.PI * 2;
            this.flickerPhase3 = Math.random() * Math.PI * 2;

            // Fired flash state
            this.glow = 0;
            this.glowDecay = 0.12 + Math.random() * 0.08; // fast decay (3–5 frames)
        }

        update(progress) {
            const ease = easeInOutCubic(progress);
            this.x = this.originX + (this.targetX - this.originX) * ease;
            this.y = this.originY + (this.targetY - this.originY) * ease;
            this.glow = Math.max(0, this.glow - this.glowDecay);
        }

        fire() {
            this.glow = 1;
        }

        // Compute the polyrhythmic flicker brightness [0..1]
        getFlickerIntensity(time) {
            const s1 = Math.sin(time * this.flickerFreq1 * Math.PI * 2 + this.flickerPhase1);
            const s2 = Math.sin(time * this.flickerFreq2 * Math.PI * 2 + this.flickerPhase2);
            const s3 = Math.sin(time * this.flickerFreq3 * Math.PI * 2 + this.flickerPhase3);

            // Non-linear combination: threshold the product for sharp on/off
            const combined = (s1 * 0.5 + 0.5) * (s2 * 0.4 + 0.6) * (s3 * 0.3 + 0.7);
            // Sharp threshold: push toward binary flicker
            return Math.pow(combined, 2.5);
        }

        draw(ctx, time, networkAlpha) {
            const flicker = this.getFlickerIntensity(time);
            const totalBrightness = Math.min(1, flicker * 0.35 + this.glow);
            const alpha = (0.08 + totalBrightness * 0.7) * networkAlpha;
            const r = this.radius + this.glow * 3.5 + flicker * 0.8;

            // Glow halo when fired
            if (this.glow > 0.15 && networkAlpha > 0.3) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 5);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glow * 0.4 * networkAlpha})`);
                gradient.addColorStop(0.4, `rgba(255, 255, 255, ${this.glow * 0.1 * networkAlpha})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.beginPath();
                ctx.arc(this.x, this.y, r * 5, 0, Math.PI * 2);
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

    // ── FlickerEvent class (instantaneous path blink, no trajectory) ──
    class FlickerEvent {
        constructor(fromNode, toNode) {
            this.from = fromNode;
            this.to = toNode;
            this.life = 1.0;         // starts at full brightness
            this.decay = 0.15 + Math.random() * 0.15; // dies in ~3–5 frames
        }

        update() {
            this.life -= this.decay;
        }

        draw(ctx, networkAlpha) {
            if (this.life <= 0 || networkAlpha < 0.01) return;

            // Draw the ENTIRE path instantly — no interpolation/trajectory
            const dx = this.to.x - this.from.x;
            const dy = this.to.y - this.from.y;
            const mx = (this.from.x + this.to.x) / 2 + dy * 0.06;
            const my = (this.from.y + this.to.y) / 2 - dx * 0.06;

            const flashAlpha = this.life * networkAlpha;

            // Bright glow line
            ctx.beginPath();
            ctx.moveTo(this.from.x, this.from.y);
            ctx.quadraticCurveTo(mx, my, this.to.x, this.to.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Softer wider halo for the path
            if (flashAlpha > 0.3) {
                ctx.beginPath();
                ctx.moveTo(this.from.x, this.from.y);
                ctx.quadraticCurveTo(mx, my, this.to.x, this.to.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.15})`;
                ctx.lineWidth = 6;
                ctx.stroke();
            }
        }
    }

    function spawnFlickersFrom(node) {
        const nearby = logoParticles.filter(p => {
            if (p === node) return false;
            const dx = p.x - node.x;
            const dy = p.y - node.y;
            return Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST;
        });
        if (nearby.length === 0) return;

        const count = Math.min(nearby.length, 1 + Math.floor(Math.random() * 3));
        const shuffled = nearby.sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            shuffled[i].fire(); // destination node also flashes
            pulses.push(new FlickerEvent(node, shuffled[i]));

            // Cascading burst: ~40% chance the destination fires onward
            if (Math.random() < 0.4) {
                setTimeout(() => {
                    shuffled[i].fire();
                    spawnFlickersFrom(shuffled[i]);
                }, 16 + Math.random() * 48); // 1–3 frames later
            }
        }
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function initParticles() {
        logoParticles = [];
        logoCenterX = w / 2;
        logoCenterY = h / 2;
        for (let i = 0; i < NODE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 80;
            const x = logoCenterX + Math.cos(angle) * radius;
            const y = logoCenterY + Math.sin(angle) * radius;
            logoParticles.push(new Particle(x, y));
        }
        pulses = [];
    }

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

        // Phases
        const logoScale = p < 0.08 ? 1 : p < 0.12 ? 1 + 0.1 : 1.1;
        const logoPhaseAlpha = p < 0.10 ? 1 : p < 0.12 ? 1 - (p - 0.10) / 0.02 : 0;
        const scatterProgress = p < 0.10 ? 0 : p < 0.12 ? (p - 0.10) / 0.02 : 1;
        const networkAlpha = p < 0.10 ? 0 : p < 0.12 ? (p - 0.10) / 0.02 : p < 0.90 ? 1 : 1 - (p - 0.90) / 0.10;
        const titleAlpha = p < 0.20 ? 0 : p < 0.35 ? (p - 0.20) / 0.15 : 1;
        const subtitleAlpha = p < 0.30 ? 0 : p < 0.45 ? (p - 0.30) / 0.15 : 1;
        const ctaAlpha = p < 0.80 ? 0 : Math.min(1, (p - 0.80) / 0.15);
        const scrollAlpha = p < 0.05 ? 1 : p < 0.10 ? 1 - (p - 0.05) / 0.05 : 0;

        // DOM Updates
        phaseLogo.style.opacity = logoPhaseAlpha;
        heroEmblem.style.transform = `scale(${logoScale})`;
        heroEmblem.style.filter = `brightness(0) invert(1)`;
        phaseLogo.style.pointerEvents = logoPhaseAlpha > 0.5 ? 'auto' : 'none';
        const brandEl = phaseLogo.querySelector('.hero__brand');
        if (brandEl) { brandEl.style.opacity = 0; brandEl.style.display = 'none'; }

        heroTitle.style.opacity = titleAlpha;
        heroTitle.style.transform = `translateY(${(1 - titleAlpha) * 25}px)`;
        heroTitle.style.pointerEvents = titleAlpha > 0.5 ? 'auto' : 'none';

        if (heroSubtitle) {
            heroSubtitle.style.opacity = subtitleAlpha;
            heroSubtitle.style.transform = `translateY(${(1 - subtitleAlpha) * 20 + 60}px)`;
        }

        heroCta.style.opacity = ctaAlpha;
        heroCta.style.transform = `translateY(${(1 - ctaAlpha) * 20}px)`;
        heroCta.style.pointerEvents = ctaAlpha > 0.5 ? 'auto' : 'none';

        heroScroll.style.opacity = scrollAlpha;

        const navLogoText = document.querySelector('.nav__logo-text');
        if (navLogoText) {
            const navFade = p < 0.03 ? 1 : p < 0.12 ? 1 - (p - 0.03) / 0.09 : 0;
            navLogoText.style.opacity = navFade;
        }

        for (const p of logoParticles) {
            p.update(scatterProgress);
        }

        // Connections (static background network at low opacity)
        if (networkAlpha > 0.05) {
            const connectionAlpha = 0.2 * networkAlpha;
            for (let i = 0; i < logoParticles.length; i++) {
                for (let j = i + 1; j < logoParticles.length; j++) {
                    const a = logoParticles[i];
                    const b = logoParticles[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = Math.max(0, connectionAlpha * (1 - dist / CONNECTION_DIST));
                        if (alpha > 0.01) {
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
        }

        // Particles (with polyrhythmic flickering)
        const particleAlpha = scatterProgress > 0.05 ? Math.min(1, scatterProgress * 2) : 0;
        if (particleAlpha > 0) {
            for (const p of logoParticles) {
                p.draw(ctx, time, particleAlpha);
            }
        }

        // Fire rapid flickering events — high frequency, multiple per frame
        if (networkAlpha > 0.3) {
            // Fire 3–5 events every 2 frames for dense, rapid flickering
            if (frameCount % 2 === 0) {
                const burstCount = 3 + Math.floor(Math.random() * 3);
                for (let b = 0; b < burstCount; b++) {
                    const randomNode = logoParticles[Math.floor(Math.random() * logoParticles.length)];
                    randomNode.fire();
                    spawnFlickersFrom(randomNode);
                }
            }
        }

        // Draw flicker events (instantaneous path blinks)
        for (const pulse of pulses) {
            pulse.update();
            pulse.draw(ctx, networkAlpha);
        }
        pulses = pulses.filter(p => p.life > 0);
        if (pulses.length > 200) pulses = pulses.slice(-160);

        requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    draw();
}

function initContactForm(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        if (!name || !email || !message) return;
        const subject = encodeURIComponent(`Research Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:contact@argonavis-research.org?subject=${subject}&body=${body}`;
    });
}
