/* ============================================================
   ANReLa — Main JavaScript
   Handles page-specific interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // -- Prime Spiral Canvas (homepage only) --
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        initPrimeSpiral(canvas);
    }

    // -- Contact Form (join page only) --
    const form = document.getElementById('contactForm');
    if (form) {
        initContactForm(form);
    }
});

/* ============================================================
   PRIME SPIRAL VISUALIZATION
   ============================================================ */
function initPrimeSpiral(canvas) {
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

    function spiralCoords(n) {
        // Ulam spiral coordinate mapping
        if (n === 0) return { x: 0, y: 0 };
        let layer = Math.ceil((Math.sqrt(n) - 1) / 2);
        let leg = Math.floor((n - (2 * layer - 1) ** 2) / (2 * layer));
        let elem = (n - (2 * layer - 1) ** 2) - 2 * layer * leg;

        let x, y;
        switch (leg) {
            case 0: x = layer; y = -layer + 1 + elem; break;
            case 1: x = layer - 1 - elem; y = layer; break;
            case 2: x = -layer; y = layer - 1 - elem; break;
            case 3: x = -layer + 1 + elem; y = -layer; break;
            default: x = 0; y = 0;
        }
        return { x, y };
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
    }

    function draw() {
        time += 0.002;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const spacing = Math.min(w, h) / 80;
        const maxN = 2000;

        for (let n = 1; n <= maxN; n++) {
            if (!isPrime(n)) continue;

            const { x, y } = spiralCoords(n);
            const px = cx + x * spacing;
            const py = cy + y * spacing;

            // Skip offscreen points
            if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

            // Distance from center for fade
            const dist = Math.sqrt(x * x + y * y);
            const maxDist = Math.sqrt(maxN);
            const fade = 1 - (dist / maxDist) * 0.7;

            // Subtle pulse
            const pulse = 0.6 + 0.4 * Math.sin(time * 2 + n * 0.1);
            const alpha = fade * pulse * 0.5;

            const radius = 1.2 + pulse * 0.5;

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }

        animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
        }, 100);
    });
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
