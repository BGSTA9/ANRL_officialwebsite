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
/* ============================================================
   SCROLL-DRIVEN HOMEPAGE EXPERIENCE (IMAGE-BASED)
   Phase 1: Logo + Name
   Phase 2: Logo dismantles → neural network (using ANReaL.png)
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

    // ── Image Asset ──
    const neuralImg = new Image();
    neuralImg.src = 'ANReaL.png';
    let imageLoaded = false;

    // ── Animation State ──
    let nodes = []; // {x, y, freq, phase}
    let paths = []; // {x, y}
    let activeFlickers = []; // {type, x, y, life, decay, radius}

    // Offscreen mask for clipping flickers to the image shape
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');

    // Layout
    let imgDrawX, imgDrawY, imgDrawW, imgDrawH;

    let frameCount = 0;

    neuralImg.onload = () => {
        imageLoaded = true;
        resize();
        draw();
    };

    // ── Resizing & Feature Scanning ──
    function resize() {
        dpr = window.devicePixelRatio || 1;
        w = canvas.parentElement.clientWidth;
        h = canvas.parentElement.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        if (!imageLoaded) return;

        // Mask canvas needs to match screen size
        maskCanvas.width = w;
        maskCanvas.height = h;

        // Calculate "Cover" fit
        const scale = Math.max(w / neuralImg.width, h / neuralImg.height);
        imgDrawW = neuralImg.width * scale;
        imgDrawH = neuralImg.height * scale;
        imgDrawX = (w - imgDrawW) / 2;
        imgDrawY = (h - imgDrawH) / 2;

        scanFeatures();
    }

    // Scan the drawn image to find "Nodes" and "Paths"
    function scanFeatures() {
        // Draw image to mask canvas once to read data
        maskCtx.clearRect(0, 0, w, h);
        maskCtx.drawImage(neuralImg, imgDrawX, imgDrawY, imgDrawW, imgDrawH);

        // Sampling resolution (skip pixels for performance) -> scan every 4th pixel
        // Note: getImageData is expensive, do this only on resize
        const step = 4;
        const imageData = maskCtx.getImageData(0, 0, w, h);
        const data = imageData.data;

        nodes = [];
        paths = [];

        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const i = (y * w + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;

                // Thresholds
                if (brightness > 180) { // High brightness = Node
                    // Add randomness to prevent grid artifacts
                    if (Math.random() < 0.15) { // sub-sample
                        nodes.push({
                            x: x,
                            y: y,
                            freq: 2 + Math.random() * 5, // 2-7 Hz rhythm
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                } else if (brightness > 40) { // Mid brightness = Path
                    if (Math.random() < 0.05) { // very sparse sampling for paths
                        paths.push({ x: x, y: y });
                    }
                }
            }
        }
    }

    // ── Flicker System ──
    class Flicker {
        constructor(isNode) {
            if (isNode && nodes.length > 0) {
                const n = nodes[Math.floor(Math.random() * nodes.length)];
                this.x = n.x;
                this.y = n.y;
                this.radius = 20 + Math.random() * 40;
                this.life = 1;
                this.decay = 0.05 + Math.random() * 0.05; // Node flash duration
                this.type = 'node';
            } else if (paths.length > 0) {
                const p = paths[Math.floor(Math.random() * paths.length)];
                this.x = p.x;
                this.y = p.y;
                this.radius = 40 + Math.random() * 60; // Wider for paths
                this.life = 1;
                this.decay = 0.15 + Math.random() * 0.2; // Path blink is faster
                this.type = 'path';
            } else {
                this.life = 0;
            }
        }

        update() {
            this.life -= this.decay;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            const alpha = this.life;
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let scrollProgress = 0;
    function updateScroll() {
        const scrollTop = window.scrollY;
        const maxScroll = scrollDrive.offsetHeight - window.innerHeight;
        scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
    }

    // ── Main Animation Loop ──
    function draw() {
        frameCount++;
        ctx.clearRect(0, 0, w, h);

        const p = scrollProgress;

        // Phases & Opacities
        const logoScale = p < 0.08 ? 1 : p < 0.12 ? 1 + 0.1 : 1.1;
        const logoPhaseAlpha = p < 0.10 ? 1 : p < 0.12 ? 1 - (p - 0.10) / 0.02 : 0;

        // Transition: Logo fades out -> Neural fades in
        // Network visibility starts at 0.10, full by 0.15
        const networkAlpha = p < 0.10 ? 0 : p < 0.15 ? (p - 0.10) / 0.05 : p < 0.90 ? 1 : 1 - (p - 0.90) / 0.10;

        const titleAlpha = p < 0.20 ? 0 : p < 0.35 ? (p - 0.20) / 0.15 : 1;
        const subtitleAlpha = p < 0.30 ? 0 : p < 0.45 ? (p - 0.30) / 0.15 : 1;
        const ctaAlpha = p < 0.80 ? 0 : Math.min(1, (p - 0.80) / 0.15);
        const scrollAlpha = p < 0.05 ? 1 : p < 0.10 ? 1 - (p - 0.05) / 0.05 : 0;

        // Update DOM
        phaseLogo.style.opacity = logoPhaseAlpha;
        heroEmblem.style.transform = `scale(${logoScale})`;
        phaseLogo.style.pointerEvents = logoPhaseAlpha > 0.5 ? 'auto' : 'none';

        heroTitle.style.opacity = titleAlpha;
        heroTitle.style.transform = `translateY(${(1 - titleAlpha) * 25}px)`;
        heroSubtitle.style.opacity = subtitleAlpha;
        heroSubtitle.style.transform = `translateY(${(1 - subtitleAlpha) * 20 + 60}px)`;
        heroCta.style.opacity = ctaAlpha;
        heroCta.style.transform = `translateY(${(1 - ctaAlpha) * 20}px)`;
        heroScroll.style.opacity = scrollAlpha;

        const nav = document.querySelector('.nav');
        if (nav) {
            const navAlpha = p < 0.1 ? 0 : Math.min(1, (p - 0.1) * 5);
            nav.style.opacity = navAlpha;
            nav.style.pointerEvents = navAlpha > 0.1 ? 'auto' : 'none';
        }

        // ── Render Neural Network ──
        if (networkAlpha > 0.01 && imageLoaded) {

            // 1. Base Layer (Static Image)
            // Use 'screen' blend to make black transparent against the dark background
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.2 * networkAlpha; // Low opacity background (20% visibility)
            ctx.drawImage(neuralImg, imgDrawX, imgDrawY, imgDrawW, imgDrawH);

            // 2. Flicker Logic
            // Fire new flickers randomly
            // Higher firing rate when scrolled in
            if (activeFlickers.length < 30) {
                if (Math.random() < 0.4) activeFlickers.push(new Flicker(true)); // Node flash
                if (Math.random() < 0.4) activeFlickers.push(new Flicker(false)); // Path blink
            }

            // Update flickers
            activeFlickers.forEach(f => f.update());
            activeFlickers = activeFlickers.filter(f => f.life > 0);

            // 3. Masking & Composition
            // We want the flickers to ONLY appear where the neurons are.

            // Step A: Draw all flickers (white blobs) onto the mask canvas
            maskCtx.globalCompositeOperation = 'source-over';
            maskCtx.clearRect(0, 0, w, h);
            activeFlickers.forEach(f => f.draw(maskCtx));

            // Step B: Clip the flickers using the neural image
            // 'multiply' or 'source-in' works. 
            // We draw the image ON TOP of the white blobs using 'source-in' => keeps image pixels only where blobs are alpha>0
            // Actually, we want the BRIGHTNESS of the image to mask the blobs.
            // Let's use 'multiply' to tint the white blobs with the image content? 
            // Better: Draw Image. Draw Blobs with 'destination-in'? No.
            // Best: Draw Blobs. Draw Image with 'source-in'. Result = Image pixels, but clipped to blobs.
            maskCtx.globalCompositeOperation = 'source-in';
            maskCtx.drawImage(neuralImg, imgDrawX, imgDrawY, imgDrawW, imgDrawH);

            // Step C: Draw the masked result onto proper canvas
            // Use 'lighter' (additive) to make them glow
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 1.0 * networkAlpha; // Full brightness for flashes
            ctx.drawImage(maskCanvas, 0, 0);

            // Reset
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 100); });

    // Reset listener
    setTimeout(() => {
        const navLogo = document.querySelector('.nav__logo');
        if (navLogo) {
            navLogo.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    const scrollDrive = document.getElementById('scrollDrive');
    const heroCanvas = document.getElementById('heroCanvas');
    if (scrollDrive && heroCanvas) {
        initScrollExperience(scrollDrive, heroCanvas);
    }
});




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
