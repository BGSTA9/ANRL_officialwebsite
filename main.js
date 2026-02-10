/* ============================================================
   ANReLa — Main JavaScript
   Handles page-specific interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // -- Neural Network Canvas (homepage only) --
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        initNeuralNetwork(canvas);
    }

    // -- Contact Form (join page only) --
    const form = document.getElementById('contactForm');
    if (form) {
        initContactForm(form);
    }
});

/* ============================================================
   NEURAL NETWORK VISUALIZATION
   Procedural neuron network with firing pulses
   ============================================================ */
function initNeuralNetwork(canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let nodes = [];
    let connections = [];
    let pulses = [];
    let time = 0;

    const NODE_COUNT = 120;
    const CONNECTION_DIST = 180;
    const PULSE_SPEED = 1.5;
    const FIRE_INTERVAL = 60; // frames between random fires

    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseRadius = 1.5 + Math.random() * 2;
            this.glow = 0;
            this.glowDecay = 0.02 + Math.random() * 0.02;
            this.pulsePhase = Math.random() * Math.PI * 2;
            // Slight drift
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
        }

        update() {
            this.glow = Math.max(0, this.glow - this.glowDecay);
            // Gentle drift
            this.x += this.vx;
            this.y += this.vy;
            // Wrap edges
            if (this.x < -20) this.x = w + 20;
            if (this.x > w + 20) this.x = -20;
            if (this.y < -20) this.y = h + 20;
            if (this.y > h + 20) this.y = -20;
        }

        fire() {
            this.glow = 1;
        }

        draw(ctx, time) {
            const breathe = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.8 + this.pulsePhase));
            const alpha = 0.15 + this.glow * 0.7 + breathe * 0.1;
            const r = this.baseRadius + this.glow * 3;

            // Glow halo
            if (this.glow > 0.1) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glow * 0.3})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.glow * 0.08})`);
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

    class Connection {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }

        draw(ctx) {
            const dx = this.b.x - this.a.x;
            const dy = this.b.y - this.a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const alpha = Math.max(0, 0.04 * (1 - dist / CONNECTION_DIST));

            ctx.beginPath();
            ctx.moveTo(this.a.x, this.a.y);

            // Slight curve for organic feel
            const mx = (this.a.x + this.b.x) / 2 + (dy * 0.05);
            const my = (this.a.y + this.b.y) / 2 - (dx * 0.05);
            ctx.quadraticCurveTo(mx, my, this.b.x, this.b.y);

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    class Pulse {
        constructor(connection, direction) {
            this.connection = connection;
            this.direction = direction; // 1 = a→b, -1 = b→a
            this.progress = 0;
            this.speed = PULSE_SPEED + Math.random() * 0.8;
            this.alive = true;
            this.trail = [];
        }

        update() {
            const a = this.direction === 1 ? this.connection.a : this.connection.b;
            const b = this.direction === 1 ? this.connection.b : this.connection.a;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.progress += this.speed / dist;

            if (this.progress >= 1) {
                // Arrived — fire the target node
                b.fire();
                this.alive = false;

                // Chain reaction: sometimes fire onward
                if (Math.random() < 0.35) {
                    spawnPulsesFrom(b);
                }
            }

            // Current position
            const t = this.progress;
            const mx = (a.x + b.x) / 2 + ((b.y - a.y) * 0.05);
            const my = (a.y + b.y) / 2 - ((b.x - a.x) * 0.05);
            const cx = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
            const cy = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;

            this.trail.push({ x: cx, y: cy, alpha: 1 });

            // Limit trail length
            if (this.trail.length > 12) this.trail.shift();
        }

        draw(ctx) {
            // Draw trail
            for (let i = 0; i < this.trail.length; i++) {
                const pt = this.trail[i];
                const fade = (i + 1) / this.trail.length;
                const alpha = fade * 0.9;
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
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.beginPath();
                ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    function spawnPulsesFrom(node) {
        const nodeConnections = connections.filter(c => c.a === node || c.b === node);
        if (nodeConnections.length === 0) return;

        // Fire 1-2 random connections
        const count = Math.min(nodeConnections.length, 1 + Math.floor(Math.random() * 2));
        const shuffled = nodeConnections.sort(() => Math.random() - 0.5);

        for (let i = 0; i < count; i++) {
            const c = shuffled[i];
            const dir = c.a === node ? 1 : -1;
            pulses.push(new Pulse(c, dir));
        }
    }

    function init() {
        nodes = [];
        connections = [];
        pulses = [];

        // Create nodes
        for (let i = 0; i < NODE_COUNT; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            nodes.push(new Node(x, y));
        }

        // Create connections between nearby nodes
        buildConnections();
    }

    function buildConnections() {
        connections = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    connections.push(new Connection(nodes[i], nodes[j]));
                }
            }
        }
    }

    let frameCount = 0;
    function draw() {
        time += 0.016;
        frameCount++;
        ctx.clearRect(0, 0, w, h);

        // Periodically rebuild connections (nodes drift)
        if (frameCount % 120 === 0) {
            buildConnections();
        }

        // Random firing
        if (frameCount % FIRE_INTERVAL === 0) {
            const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            randomNode.fire();
            spawnPulsesFrom(randomNode);
        }

        // Draw connections
        for (const conn of connections) {
            conn.draw(ctx);
        }

        // Update and draw nodes
        for (const node of nodes) {
            node.update();
            node.draw(ctx, time);
        }

        // Update and draw pulses
        for (const pulse of pulses) {
            pulse.update();
            pulse.draw(ctx);
        }

        // Remove dead pulses
        pulses = pulses.filter(p => p.alive);

        // Cap pulse count to prevent runaway chains
        if (pulses.length > 80) {
            pulses = pulses.slice(-60);
        }

        requestAnimationFrame(draw);
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

    resize();
    init();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            init();
        }, 150);
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
