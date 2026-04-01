// --- 1. NEURAL CONSTELLATION MESH + AURORA WAVES ---
        const canvas = document.getElementById('particles-bg');
        const ctx = canvas.getContext('2d');
        const auroraCanvas = document.getElementById('aurora-bg');
        const actx = auroraCanvas.getContext('2d');
        let W, H;
        function resizeCanvases() {
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W; canvas.height = H;
            auroraCanvas.width = W; auroraCanvas.height = H;
        }
        resizeCanvases();
        window.addEventListener('resize', resizeCanvases);

        const particles = [];
        let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
        let rawMouseX = W / 2, rawMouseY = H / 2;
        const PARTICLE_COUNT = window.innerWidth < 768 ? 20 : 45;
        const CONNECTION_DIST = window.innerWidth < 768 ? 90 : 130;
        const MOUSE_RADIUS = 200;

        class Particle {
            constructor() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.baseSize = Math.random() * 2 + 0.5;
                this.size = this.baseSize;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.depth = Math.random(); // 0 = far, 1 = close
                this.hue = Math.random() > 0.5 ? 185 : 280; // cyan or purple
                this.parallaxFactor = this.depth * 0.015 + 0.002;
            }
            update() {
                // Mouse attraction
                const dx = rawMouseX - this.x;
                const dy = rawMouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.008;
                    this.vx += dx * force;
                    this.vy += dy * force;
                }

                // Damping
                this.vx *= 0.98;
                this.vy *= 0.98;

                this.x += this.vx;
                this.y += this.vy;

                // Wrap edges
                if (this.x < -20) this.x = W + 20;
                if (this.x > W + 20) this.x = -20;
                if (this.y < -20) this.y = H + 20;
                if (this.y > H + 20) this.y = -20;

                // Pulsing size
                this.size = this.baseSize + Math.sin(Date.now() * 0.002 + this.x * 0.01) * 0.5;

                // Parallax offset
                targetX += (mouseX - targetX) * 0.03;
                targetY += (mouseY - targetY) * 0.03;
                return {
                    displayX: this.x + (targetX * this.parallaxFactor),
                    displayY: this.y + (targetY * this.parallaxFactor)
                };
            }
        }

        // Init particles
        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        // Aurora wave state
        let auroraTime = 0;

        function drawAurora() {
            actx.clearRect(0, 0, W, H);
            auroraTime += 0.003;

            const bands = 2; // Reduced for performance
            for (let b = 0; b < bands; b++) {
                actx.beginPath();
                const yBase = H * (0.2 + b * 0.3);
                actx.moveTo(0, yBase);

                for (let x = 0; x <= W; x += 25) { // Increased step size for performance
                    const wave1 = Math.sin(x * 0.003 + auroraTime * (1 + b * 0.3)) * 60;
                    const wave2 = Math.sin(x * 0.006 + auroraTime * 1.5 + b) * 30;
                    const y = yBase + wave1 + wave2;
                    actx.lineTo(x, y);
                }

                actx.lineTo(W, H);
                actx.lineTo(0, H);
                actx.closePath();

                const hue1 = 185 + b * 30 + Math.sin(auroraTime + b) * 20;
                const hue2 = 260 + b * 15 + Math.sin(auroraTime * 0.7 + b) * 30;
                const grad = actx.createLinearGradient(0, yBase - 100, 0, yBase + 200);
                grad.addColorStop(0, `hsla(${hue1}, 80%, 60%, 0)`);
                grad.addColorStop(0.3, `hsla(${hue1}, 80%, 60%, 0.03)`);
                grad.addColorStop(0.6, `hsla(${hue2}, 70%, 50%, 0.02)`);
                grad.addColorStop(1, `hsla(${hue2}, 70%, 50%, 0)`);
                actx.fillStyle = grad;
                actx.fill();
            }
        }

        function animateBackground() {
            ctx.clearRect(0, 0, W, H);

            // Calculate all positions first
            const positions = particles.map(p => {
                const pos = p.update();
                return { p, ...pos };
            });

            // Draw connections (Neural Mesh)
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const a = positions[i], b = positions[j];
                    const dx = a.displayX - b.displayX;
                    const dy = a.displayY - b.displayY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
                        const avgHue = (a.p.hue + b.p.hue) / 2;
                        ctx.strokeStyle = `hsla(${avgHue}, 80%, 65%, ${opacity})`;
                        ctx.lineWidth = (1 - dist / CONNECTION_DIST) * 1.2;
                        ctx.beginPath();
                        ctx.moveTo(a.displayX, a.displayY);
                        ctx.lineTo(b.displayX, b.displayY);
                        ctx.stroke();
                    }
                }
            }

            // Draw Nodes
            positions.forEach(({ p, displayX, displayY }) => {
                // Soft halo (optimized instead of createRadialGradient per node)
                ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.15})`;
                ctx.beginPath();
                ctx.arc(displayX, displayY, p.size * 3.5, 0, Math.PI * 2);
                ctx.fill();

                // Core dot
                ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${p.opacity * 1.5})`;
                ctx.beginPath();
                ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Aurora
            drawAurora();

            requestAnimationFrame(animateBackground);
        }
        animateBackground();

        // --- 2. THEME & MOUSE LOGIC ---
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2);
            mouseY = (e.clientY - window.innerHeight / 2);
            rawMouseX = e.clientX;
            rawMouseY = e.clientY;
            const headline = document.getElementById('hero-headline');
            if(headline && window.innerWidth > 1024) {
                headline.style.transform = `rotateY(${mouseX / 35}deg) rotateX(${-mouseY / 35}deg)`;
            }
        });

        function setCoreEnergy(primary, accent, secondary, dot) {
            document.documentElement.style.setProperty('--primary-color', primary);
            document.documentElement.style.setProperty('--accent-glow', accent);
            document.documentElement.style.setProperty('--secondary-accent', secondary);
            document.querySelectorAll('.color-dot').forEach(el => el.classList.remove('active'));
            if (dot) dot.classList.add('active');
        }

        // --- 3. SCROLL REVEAL & NAV ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        const scrollProgress = document.getElementById('scroll-progress');
        window.addEventListener('scroll', () => {
            const h = document.documentElement, b = document.body, st = 'scrollTop', sh = 'scrollHeight';
            const percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
            if(scrollProgress) scrollProgress.style.width = percent + "%";
            
            // Scroll Spy
            let current = 'hero';
            document.querySelectorAll('section').forEach(s => {
                if (window.scrollY >= (s.offsetTop - s.clientHeight / 3)) current = s.getAttribute('id');
            });
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active-nav');
                if (l.getAttribute('href').includes(current)) l.classList.add('active-nav');
            });
        });

        // --- 4. CINEMATIC ROBOT REVEAL (NAV CLICK) ---
        function triggerIdentityPulse() {
            const overlay = document.getElementById('preloader');
            if(!overlay) return;
            document.body.style.overflow = 'hidden';
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 10);
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.classList.remove('active');
                    overlay.style.opacity = '1'; overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }, 800);
            }, 3000);
        }

        // --- 5. SECRET GAME: VOID RUNNER (FULLSCREEN) ---
        let gameActive = false;
        function triggerScanning() {
            const scanLine = document.getElementById('scan-line');
            const btn = document.getElementById('fingerprint-btn');
            btn.classList.add('opacity-0', 'scale-0');
            scanLine.style.transform = 'scaleY(1)';
            
            setTimeout(() => {
                document.getElementById('game-overlay').classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                initVoidRunner();
            }, 1000);
        }

        function initVoidRunner() {
            const cvs = document.getElementById('game-canvas');
            const gctx = cvs.getContext('2d');
            const overlay = document.getElementById('game-ui-overlay');
            
            cvs.width = window.innerWidth; cvs.height = window.innerHeight;

            let score = 0;
            let player = { x: 150, y: cvs.height - 100, r: 20, dy: 0, jumpPower: -18, gravity: 0.8, grounded: true };
            let obstacles = [];
            let frame = 0;
            let gameSpeed = 10;
            gameActive = false;

            let highSync = localStorage.getItem('void_high_sync') || 0;
            const updateUI = () => {
                const sEl = document.getElementById('game-score');
                const hEl = document.getElementById('game-high-score');
                if(sEl) sEl.innerText = score.toString().padStart(4, '0');
                if(hEl) hEl.innerText = highSync.toString().padStart(4, '0');
            };
            updateUI();

            window.startGame = () => {
                gameActive = true;
                overlay.classList.add('hidden');
                document.getElementById('game-over-overlay').classList.add('hidden');
                requestAnimationFrame(gameLoop);
            };

            window.resetGame = () => {
                score = 0; frame = 0; gameSpeed = 10; obstacles = []; 
                player.y = cvs.height - 100; player.dy = 0; player.grounded = true;
                updateUI();
                startGame();
            };

            const doJump = (e) => { 
                if(!gameActive) return;
                if(player.grounded) { player.dy = player.jumpPower; player.grounded = false; } 
                if(e && e.type === 'pointerdown') e.preventDefault();
            };

            // Enhanced Universal Controls
            window.addEventListener('keydown', (e) => { if(e.code === 'Space' || e.code === 'ArrowUp') doJump(); });
            window.addEventListener('pointerdown', doJump, { passive: false });
            window.addEventListener('touchstart', (e) => { if(gameActive) e.preventDefault(); }, { passive: false });

            function gameLoop() {
                if(!gameActive) return;
                gctx.clearRect(0, 0, cvs.width, cvs.height);

                // Ground Line
                gctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
                gctx.lineWidth = 2;
                gctx.beginPath(); gctx.moveTo(0, cvs.height - 80); gctx.lineTo(cvs.width, cvs.height - 80); gctx.stroke();

                // Player Physics
                player.dy += player.gravity;
                player.y += player.dy;
                if (player.y > cvs.height - 100) { player.y = cvs.height - 100; player.dy = 0; player.grounded = true; }

                // Draw Player (Glowing Orb)
                gctx.shadowBlur = 30; gctx.shadowColor = '#00f0ff';
                gctx.fillStyle = '#dbfcff';
                gctx.beginPath(); gctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); gctx.fill();
                gctx.shadowBlur = 0;

                // Obstacle Generation
                if (frame % Math.floor(100 / (gameSpeed/10)) === 0) {
                    obstacles.push({ x: cvs.width, w: 40, h: 60 + Math.random() * 40 });
                }

                obstacles.forEach((o, i) => {
                    o.x -= gameSpeed;
                    
                    // Style Obstacle (Neon Spike)
                    gctx.fillStyle = '#9400e4';
                    gctx.shadowBlur = 15; gctx.shadowColor = '#9400e4';
                    gctx.beginPath();
                    gctx.moveTo(o.x, cvs.height - 80);
                    gctx.lineTo(o.x + o.w/2, cvs.height - 80 - o.h);
                    gctx.lineTo(o.x + o.w, cvs.height - 80);
                    gctx.fill();

                    // Collision Check
                    if (Math.abs(o.x - player.x) < 30 && player.y > cvs.height - 80 - o.h) {
                        gameActive = false;
                        if(score > highSync) {
                            highSync = score;
                            localStorage.setItem('void_high_sync', highSync);
                        }
                        showGameOver();
                    }

                    if (o.x < -100) { obstacles.splice(i, 1); score += 10; gameSpeed += 0.1; updateUI(); }
                });

                frame++;
                if (gameActive) requestAnimationFrame(gameLoop);
            }

            function showGameOver() {
                const goOverlay = document.getElementById('game-over-overlay');
                document.getElementById('final-score').innerText = score.toString().padStart(4, '0');
                document.getElementById('top-performer').innerText = highSync.toString().padStart(4, '0');
                goOverlay.classList.remove('hidden');
            }
        }

        // Initialize mobile menu
        document.getElementById('mobile-menu-btn').onclick = () => document.getElementById('mobile-menu').classList.toggle('hidden');
        
        // --- 6. FORM LOGIC ---
        function closeModal() { document.getElementById('success-modal').classList.add('hidden'); document.body.style.overflow = ''; }
        document.getElementById('contact-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('success-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            e.target.reset();
        });
        
        window.triggerIdentityPulse = triggerIdentityPulse;
        window.triggerScanning = triggerScanning;
        window.closeModal = closeModal;
        
        // --- 7. DEEP DIVE TOGGLE ---
        window.toggleDeepDive = function(btn) {
            const card = btn.closest('.interactive-card');
            const content = card.querySelector('.deep-dive-content');
            const isExpanded = content.classList.toggle('expanded');
            
            // UI Feedback
            if(isExpanded) {
                btn.innerHTML = 'Close Dive';
                btn.classList.add('bg-primary', 'text-surface');
                btn.classList.remove('bg-primary/20', 'text-primary');
            } else {
                btn.innerHTML = 'Deep Dive';
                btn.classList.remove('bg-primary', 'text-surface');
                btn.classList.add('bg-primary/20', 'text-primary');
            }
        };

        // --- 8. DYNAMIC TYPING ENGINE ---
        const typingEl = document.getElementById('dynamic-text');
        const phrases = [
            "intelligent Arduino simulations",
            "autonomous IoT ecosystems",
            "responsive web architectures",
            "high-speed embedded logic",
            "future-ready circuits"
        ];
        let pIdx = 0;
        let cIdx = 0;
        let deleting = false;
        let tSpeed = 100;

        function runTyping() {
            const current = phrases[pIdx];
            if (deleting) {
                typingEl.textContent = current.substring(0, cIdx - 1);
                cIdx--;
                tSpeed = 50;
            } else {
                typingEl.textContent = current.substring(0, cIdx + 1);
                cIdx++;
                tSpeed = 100;
            }

            if (!deleting && cIdx === current.length) {
                tSpeed = 2500; // Pause at end
                deleting = true;
            } else if (deleting && cIdx === 0) {
                deleting = false;
                pIdx = (pIdx + 1) % phrases.length;
                tSpeed = 500;
            }
            setTimeout(runTyping, tSpeed);
        }
        if(typingEl) runTyping();

        // --- 9. DISCORD-INSPIRED: Reveal-Title + Glow Lines on Section Headings ---
        document.querySelectorAll('section:not(#hero) h2').forEach(h2 => {
            if (h2.closest('.glass-panel') || h2.closest('.interactive-card')) return;
            if (h2.classList.contains('animate-float')) return;
            h2.classList.add('reveal-title');
            const line = document.createElement('div');
            line.className = 'glow-line';
            if (h2.closest('.text-center') || (h2.parentElement && h2.parentElement.classList.contains('text-center'))) {
                line.classList.add('center');
            }
            h2.insertAdjacentElement('afterend', line);
        });

        const titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    const line = entry.target.nextElementSibling;
                    if (line && line.classList.contains('glow-line')) {
                        setTimeout(() => line.classList.add('visible'), 400);
                    }
                }
            });
        }, { threshold: 0.2 });
        document.querySelectorAll('.reveal-title').forEach(el => titleObserver.observe(el));

        // --- 10. DISCORD-INSPIRED: Stats Counter Animation ---
        (function() {
            const statsGrid = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
            if (!statsGrid) return;
            let animated = false;
            const sObs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        statsGrid.querySelectorAll('p.text-4xl').forEach(el => {
                            const original = el.textContent.trim();
                            const match = original.match(/^0*(\d+)(.*)/);
                            if (!match) return;
                            const target = parseInt(match[1]);
                            const suffix = match[2];
                            let current = 0;
                            el.textContent = '00' + suffix;
                            const timer = setInterval(() => {
                                current++;
                                if (current >= target) { current = target; clearInterval(timer); }
                                el.textContent = current.toString().padStart(2, '0') + suffix;
                            }, 80);
                        });
                    }
                });
            }, { threshold: 0.3 });
            sObs.observe(statsGrid);
        })();

        // --- 11. DISCORD-INSPIRED: Floating Scroll-to-Top Button ---
        (function() {
            const fab = document.getElementById('fab-scroll-top');
            if (!fab) return;
            window.addEventListener('scroll', () => {
                if (window.scrollY > 600) fab.classList.add('visible');
                else fab.classList.remove('visible');
            }, { passive: true });
        })();

        // --- 12. DISCORD-INSPIRED: Parallax Layers ---
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            document.querySelectorAll('.parallax-layer').forEach(layer => {
                const speed = parseFloat(layer.dataset.speed) || 0;
                layer.style.transform = 'translate3d(0, ' + (scrollY * speed * 0.05) + 'px, 0)';
            });
        }, { passive: true });

        // --- 13. PHASE 2: Mouse-Follow Cursor Glow ---
        (function() {
            const glow = document.createElement('div');
            glow.id = 'cursor-glow';
            document.body.appendChild(glow);
            let glowX = 0, glowY = 0, targetGX = 0, targetGY = 0;
            document.addEventListener('mousemove', (e) => {
                targetGX = e.clientX; targetGY = e.clientY;
            });
            function animateGlow() {
                glowX += (targetGX - glowX) * 0.08;
                glowY += (targetGY - glowY) * 0.08;
                glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
                requestAnimationFrame(animateGlow);
            }
            animateGlow();
            // Hide on mobile
            if (window.innerWidth < 768) glow.style.display = 'none';
        })();

        // --- 14. PHASE 2: 3D Tilt Effect on Cards ---
        (function() {
            document.querySelectorAll('.interactive-card').forEach(card => {
                // Add shine overlay
                const shine = document.createElement('div');
                shine.className = 'tilt-shine';
                card.style.position = 'relative';
                card.appendChild(shine);

                card.addEventListener('mousemove', (e) => {
                    if (window.innerWidth < 768) return;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / centerY * -4;
                    const rotateY = (x - centerX) / centerX * 4;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
                    shine.style.setProperty('--shine-x', (x / rect.width * 100) + '%');
                    shine.style.setProperty('--shine-y', (y / rect.height * 100) + '%');
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                    card.style.transition = 'transform 0.5s ease';
                    setTimeout(() => card.style.transition = '', 500);
                });
            });
        })();

        // --- 15. PHASE 2: Staggered Grid Card Reveals ---
        (function() {
            const grids = document.querySelectorAll('.grid');
            grids.forEach(grid => {
                const children = grid.querySelectorAll('.interactive-card, .group');
                if (children.length < 2) return;
                children.forEach(child => child.classList.add('stagger-item'));
            });

            // Observe individual items to ensure they animate exactly when scrolled to
            const staggerObs = new IntersectionObserver((entries) => {
                let intersectingItems = entries.filter(e => e.isIntersecting);
                intersectingItems.forEach((entry, i) => {
                    setTimeout(() => entry.target.classList.add('visible'), i * 150);
                    staggerObs.unobserve(entry.target);
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.stagger-item').forEach(el => staggerObs.observe(el));
        })();

        // --- 16. PHASE 2: Animated Gradient Border on Featured Project ---
        (function() {
            const featured = document.querySelector('.md\\:col-span-2.interactive-card');
            if (featured) featured.classList.add('gradient-border-animated');
        })();

        // --- 17. PHASE 3: Custom Animated Cursor + Trail ---
        (function() {
            if (window.innerWidth < 768 || matchMedia('(pointer: coarse)').matches) return;
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);

            // Trail particles
            const trailCount = 5;
            const trails = [];
            for (let i = 0; i < trailCount; i++) {
                const t = document.createElement('div');
                t.className = 'cursor-trail';
                t.style.opacity = (1 - i / trailCount) * 0.4;
                t.style.width = (6 - i) + 'px';
                t.style.height = (6 - i) + 'px';
                document.body.appendChild(t);
                trails.push({ el: t, x: 0, y: 0 });
            }

            let curX = 0, curY = 0, targetCX = 0, targetCY = 0;
            document.addEventListener('mousemove', e => {
                targetCX = e.clientX; targetCY = e.clientY;
            });

            // Hover detection for links/buttons
            document.addEventListener('mouseover', e => {
                const target = e.target.closest('a, button, .cta-button, .interactive-card, input, textarea');
                if (target) cursor.classList.add('hover-active');
            });
            document.addEventListener('mouseout', e => {
                const target = e.target.closest('a, button, .cta-button, .interactive-card, input, textarea');
                if (target) cursor.classList.remove('hover-active');
            });

            function animateCursor() {
                curX += (targetCX - curX) * 0.3;
                curY += (targetCY - curY) * 0.3;
                cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;

                let prevX = curX, prevY = curY;
                trails.forEach((t, i) => {
                    const speed = 0.15 - (i * 0.015);
                    t.x += (prevX - t.x) * speed;
                    t.y += (prevY - t.y) * speed;
                    t.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%)`;
                    prevX = t.x; prevY = t.y;
                });
                requestAnimationFrame(animateCursor);
            }
            animateCursor();
        })();

        // --- 18. PHASE 3: Magnetic CTA Buttons ---
        (function() {
            if (window.innerWidth < 768) return;
            document.querySelectorAll('.cta-button').forEach(btn => {
                btn.classList.add('magnetic-btn');
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        })();

        // --- 19. PHASE 3: Preloader Loading Percentage ---
        (function() {
            const fillBar = document.getElementById('preloader-fill');
            const percentText = document.getElementById('preloader-percent');
            const overlay = document.getElementById('preloader');
            if (!fillBar || !percentText || !overlay) return;

            // Override the triggerIdentityPulse to include loading animation
            const originalTrigger = window.triggerIdentityPulse;
            window.triggerIdentityPulse = function() {
                document.body.style.overflow = 'hidden';
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('active'), 10);

                let progress = 0;
                fillBar.style.width = '0%';
                const loadInterval = setInterval(() => {
                    progress += Math.random() * 15 + 5;
                    if (progress > 100) progress = 100;
                    fillBar.style.width = progress + '%';
                    percentText.textContent = Math.floor(progress).toString().padStart(3, '0') + '%';
                    if (progress >= 100) {
                        clearInterval(loadInterval);
                        setTimeout(() => {
                            overlay.style.opacity = '0';
                            setTimeout(() => {
                                overlay.classList.remove('active');
                                overlay.style.opacity = '1';
                                overlay.style.display = 'none';
                                document.body.style.overflow = '';
                                fillBar.style.width = '0%';
                                percentText.textContent = '000%';
                            }, 800);
                        }, 400);
                    }
                }, 120);
            };
        })();

        // --- 20. PHASE 3: Hero Text Word Reveal ---
        (function() {
            const heroH1 = document.querySelector('#hero h1');
            if (!heroH1) return;
            // Use textContent-based approach: wrap each word, preserve child elements
            const children = heroH1.childNodes;
            let wordIndex = 0;
            const fragment = document.createDocumentFragment();

            children.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Split text into words, preserve whitespace
                    const text = node.textContent;
                    const parts = text.split(/(\s+)/);
                    parts.forEach(part => {
                        if (/^\s+$/.test(part)) {
                            fragment.appendChild(document.createTextNode(part));
                        } else if (part.length > 0) {
                            const span = document.createElement('span');
                            span.className = 'char-reveal';
                            span.style.animationDelay = (wordIndex * 0.08) + 's';
                            span.textContent = part;
                            fragment.appendChild(span);
                            wordIndex++;
                        }
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'BR') {
                        fragment.appendChild(node.cloneNode());
                    } else {
                        // Wrap the entire element (e.g. <span>Future</span>)
                        const wrapper = node.cloneNode(true);
                        wrapper.classList.add('char-reveal');
                        wrapper.style.animationDelay = (wordIndex * 0.08) + 's';
                        fragment.appendChild(wrapper);
                        wordIndex++;
                    }
                }
            });

            heroH1.innerHTML = '';
            heroH1.appendChild(fragment);
        })();

        // --- 21. PHASE 3: Scroll-Driven Background Color Shifts ---
        (function() {
            const sections = document.querySelectorAll('main > section');
            const bgColors = [
                '#131313', // hero
                '#131313', // about
                '#141418', // skills (slightly blue)
                '#131315', // community (slight purple)
                '#111113', // stats (deeper)
                '#131313', // projects
                '#121214', // proof of work
                '#131318', // certificates (deeper blue)
                '#0f0f0f', // contact (darkest)
                '#0a0a0a', // giant statement
            ];
            const scrollBGObs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(sections).indexOf(entry.target);
                        const color = bgColors[idx] || '#131313';
                        document.body.style.backgroundColor = color;
                    }
                });
            }, { threshold: 0.3 });
            sections.forEach(s => scrollBGObs.observe(s));
        })();