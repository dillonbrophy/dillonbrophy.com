/* ========================================
   BROPHY — Site Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Scroll-triggered nav styling ----
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ---- Mobile menu toggle ----
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // ---- Stat counter animation ----
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsCounted = false;

    function formatNumber(n, useCommas) {
        if (useCommas) return n.toLocaleString('en-US');
        return n.toString();
    }

    function animateCounters() {
        statNumbers.forEach(el => {
            const baseTarget = parseInt(el.dataset.target, 10);
            const useCommas = el.dataset.format === 'commas';
            const rate = parseInt(el.dataset.rate || '0', 10);
            const baselineDate = el.dataset.baselineDate;

            // Calculate live target — only tick within 24 hours of baseline, then cap
            let liveTarget = baseTarget;
            if (rate && baselineDate) {
                const daysSince = (Date.now() - new Date(baselineDate).getTime()) / 86400000;
                const cappedDays = Math.min(daysSince, 1);
                liveTarget = baseTarget + Math.floor(cappedDays * rate);
            }

            const duration = 8000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                // Current animated value
                let current;
                if (progress < 1) {
                    current = Math.floor(eased * liveTarget);
                } else if (rate) {
                    // After initial animation, keep ticking but cap at 1 day
                    const daysSince = (Date.now() - new Date(baselineDate).getTime()) / 86400000;
                    const cappedDays = Math.min(daysSince, 1);
                    current = baseTarget + Math.floor(cappedDays * rate);
                } else {
                    el.textContent = formatNumber(liveTarget, useCommas);
                    return;
                }

                el.textContent = formatNumber(current, useCommas);
                requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });

        // Animate the percent countdown (100 -> 1)
        const percentEl = document.querySelector('.stat-percent');
        if (percentEl) {
            const target = parseInt(percentEl.dataset.target, 10);
            const duration = 8000;
            const start = performance.now();

            function updatePercent(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(100 - eased * (100 - target));
                percentEl.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updatePercent);
                } else {
                    percentEl.textContent = 'TOP ' + target;
                }
            }
            requestAnimationFrame(updatePercent);
        }
    }

    // ---- Intersection Observer for fade-ups ----
    const fadeElements = document.querySelectorAll('.fade-up');
    const heroStats = document.querySelector('.hero-stats');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));

    // Trigger counter when hero stats become visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsCounted) {
                statsCounted = true;
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (heroStats) statsObserver.observe(heroStats);

    // ---- Smooth scroll for nav links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---- Featured carousel ----
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.remove('active');
        // Force reflow for animation
        void slides[currentSlide].offsetWidth;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    let autoplayInterval;

    function startAutoplay() {
        autoplayInterval = setInterval(() => goToSlide(currentSlide + 1), 6000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); });
        nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });
        dots.forEach(dot => {
            dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.slide)); resetAutoplay(); });
        });
        startAutoplay();

        const featuredCarousel = document.querySelector('.featured-carousel');
        if (featuredCarousel) {
            featuredCarousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
            featuredCarousel.addEventListener('mouseleave', () => startAutoplay());
        }
    }

    // ---- Discography carousel ----
    const discoSlides = document.querySelectorAll('.disco-slide');
    const discoPrev = document.querySelector('.disco-prev');
    const discoNext = document.querySelector('.disco-next');
    let currentDisco = 0;

    function goToDisco(index) {
        discoSlides[currentDisco].classList.remove('active');
        currentDisco = (index + discoSlides.length) % discoSlides.length;
        void discoSlides[currentDisco].offsetWidth;
        discoSlides[currentDisco].classList.add('active');
    }

    let discoAutoplay;
    const discoCarousel = document.querySelector('.disco-carousel');

    function startDiscoAutoplay() {
        discoAutoplay = setInterval(() => goToDisco(currentDisco + 1), 6000);
    }

    function resetDiscoAutoplay() {
        clearInterval(discoAutoplay);
        startDiscoAutoplay();
    }

    if (discoPrev && discoNext) {
        discoPrev.addEventListener('click', () => { goToDisco(currentDisco - 1); resetDiscoAutoplay(); });
        discoNext.addEventListener('click', () => { goToDisco(currentDisco + 1); resetDiscoAutoplay(); });
        startDiscoAutoplay();

        if (discoCarousel) {
            discoCarousel.addEventListener('mouseenter', () => clearInterval(discoAutoplay));
            discoCarousel.addEventListener('mouseleave', () => startDiscoAutoplay());
        }
    }

    // ---- Credits show more / collapse ----
    const showMoreBtn = document.getElementById('showMoreCredits');
    const VISIBLE_COUNT = 20;
    let creditsExpanded = false;

    function collapseCredits() {
        const visible = document.querySelectorAll('.credit-item:not(.hidden)');
        visible.forEach((item, i) => {
            if (i >= VISIBLE_COUNT) {
                item.classList.add('collapsed');
            } else {
                item.classList.remove('collapsed');
            }
        });
    }

    // Collapse on load
    collapseCredits();

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            creditsExpanded = !creditsExpanded;
            if (creditsExpanded) {
                document.querySelectorAll('.credit-item.collapsed').forEach(item => {
                    item.classList.remove('collapsed');
                });
                showMoreBtn.textContent = 'Show Less';
            } else {
                collapseCredits();
                showMoreBtn.textContent = 'Show All Credits';
                // Scroll back to credits section
                document.getElementById('credits').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ---- Credits filter ----
    const filterBtns = document.querySelectorAll('.filter-btn');
    const creditItems = document.querySelectorAll('.credit-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            creditItems.forEach(item => {
                if (filter === 'all') {
                    item.classList.remove('hidden');
                } else {
                    const roles = item.dataset.roles || '';
                    if (roles.split(' ').includes(filter)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                }
            });

            // Re-collapse after filtering
            creditsExpanded = false;
            showMoreBtn.textContent = 'Show All Credits';
            collapseCredits();
        });
    });

    // ---- Preview play buttons ----
    let currentAudio = null;
    let currentBtn = null;
    let currentItem = null;
    let audioCtx = null;
    let analyser = null;
    let animFrameId = null;

    const playIcon = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6V2z"/></svg>';
    const pauseIcon = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>';

    const isMobile = window.innerWidth <= 768;

    // Create mobile player and edge glow elements
    let mobilePlayer = null;
    let edgeGlow = null;

    if (isMobile) {
        mobilePlayer = document.createElement('div');
        mobilePlayer.className = 'mobile-player';
        mobilePlayer.innerHTML = `
            <div class="mobile-player-bg"></div>
            <div class="mobile-player-overlay"></div>
            <button class="mobile-player-close">&times;</button>
            <div class="mobile-player-art">
                <div class="vinyl-platter"></div>
                <img src="" alt="">
            </div>
            <div class="mobile-player-info">
                <div class="mobile-player-artist"></div>
                <div class="mobile-player-track"></div>
                <div class="mobile-player-streams"></div>
            </div>
            <button class="mobile-player-btn">${pauseIcon}</button>
        `;
        document.body.appendChild(mobilePlayer);

        edgeGlow = document.createElement('div');
        edgeGlow.className = 'edge-glow';
        document.body.appendChild(edgeGlow);

        // Close button
        mobilePlayer.querySelector('.mobile-player-close').addEventListener('click', () => {
            if (currentAudio) {
                currentAudio.pause();
                if (currentBtn) { currentBtn.innerHTML = playIcon; currentBtn.classList.remove('playing'); }
                if (currentItem) { currentItem.classList.remove('now-playing'); }
                stopBassAnalysis(currentItem);
                currentAudio = null;
                currentBtn = null;
                currentItem = null;
            }
            mobilePlayer.classList.remove('active');
            edgeGlow.style.opacity = '0';
        });

        // Pause/play button in mobile player
        mobilePlayer.querySelector('.mobile-player-btn').addEventListener('click', () => {
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    mobilePlayer.querySelector('.mobile-player-btn').innerHTML = pauseIcon;
                } else {
                    currentAudio.pause();
                    mobilePlayer.querySelector('.mobile-player-btn').innerHTML = playIcon;
                }
            }
        });
    }

    function showMobilePlayer(item) {
        if (!mobilePlayer) return;
        const thumb = item.querySelector('.credit-thumb img');
        const artist = item.querySelector('.credit-artist').textContent;
        const track = item.querySelector('.credit-track').textContent;
        const cert = item.querySelector('.credit-cert').textContent;
        const imgSrc = thumb ? thumb.src : '';

        mobilePlayer.querySelector('.mobile-player-bg').style.backgroundImage = `url(${imgSrc})`;
        mobilePlayer.querySelector('.mobile-player-art img').src = imgSrc;
        mobilePlayer.querySelector('.mobile-player-artist').textContent = artist;
        mobilePlayer.querySelector('.mobile-player-track').textContent = track;
        mobilePlayer.querySelector('.mobile-player-streams').textContent = cert;
        mobilePlayer.querySelector('.mobile-player-btn').innerHTML = pauseIcon;
        mobilePlayer.classList.add('active');
    }

    function updateEdgeGlow(bass) {
        if (!edgeGlow || !mobilePlayer || !mobilePlayer.classList.contains('active')) return;
        const intensity = bass * 0.7;
        const spread = 20 + bass * 50;
        edgeGlow.style.opacity = String(intensity);
        edgeGlow.style.boxShadow = `inset 0 0 ${spread}px ${spread * 0.4}px rgba(201, 168, 76, ${intensity})`;
    }

    function startBassAnalysis(audio, item) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        let source;
        try {
            source = audioCtx.createMediaElementSource(audio);
        } catch(e) {
            // Already connected or error — skip analysis but still play
            return;
        }
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const thumb = item.querySelector('.credit-thumb');
        const binHz = audioCtx.sampleRate / analyser.fftSize; // ~21.5Hz per bin
        const lowBin = Math.floor(30 / binHz);   // ~1
        const highBin = Math.ceil(120 / binHz);   // ~6

        // Create background flash element
        let flashEl = document.querySelector('.bass-flash');
        if (!flashEl) {
            flashEl = document.createElement('div');
            flashEl.className = 'bass-flash';
            document.body.appendChild(flashEl);
        }


        // Create spectrum analyzer as a fixed overlay positioned over the row
        const row = item;
        let specOverlay = document.querySelector('.spectrum-overlay');
        if (!specOverlay) {
            specOverlay = document.createElement('div');
            specOverlay.className = 'spectrum-overlay';
            const c = document.createElement('canvas');
            specOverlay.appendChild(c);
            document.body.appendChild(specOverlay);
        }
        const specCanvas = specOverlay.querySelector('canvas');
        const specCtx = specCanvas.getContext('2d');
        const NUM_BARS = 48;
        const peakHold = new Float32Array(NUM_BARS);
        const peakDecay = new Float32Array(NUM_BARS);

        function pulse() {
            analyser.getByteFrequencyData(dataArray);
            let bass = 0;
            for (let i = lowBin; i <= highBin; i++) bass += dataArray[i];
            bass = bass / (highBin - lowBin + 1) / 255;

            // Position overlay — shift right past the cover art
            const rect = row.getBoundingClientRect();
            const offset = 320; // past date + cover art + track name
            specOverlay.style.top = rect.top + 'px';
            specOverlay.style.left = (rect.left + offset) + 'px';
            specOverlay.style.width = (rect.width - offset) + 'px';
            specOverlay.style.height = rect.height + 'px';

            const cw = Math.floor(rect.width * 2);
            const ch = Math.floor(rect.height * 2);
            if (specCanvas.width !== cw || specCanvas.height !== ch) {
                specCanvas.width = cw;
                specCanvas.height = ch;
            }
            specCtx.clearRect(0, 0, cw, ch);

            const barW = Math.floor(cw / NUM_BARS);
            const gap = 2;
            const binsPerBar = Math.floor(analyser.frequencyBinCount / NUM_BARS);

            for (let i = 0; i < NUM_BARS; i++) {
                // Average the frequency bins for this bar
                let sum = 0;
                for (let j = 0; j < binsPerBar; j++) {
                    sum += dataArray[i * binsPerBar + j];
                }
                const val = sum / binsPerBar / 255;
                const barH = val * ch * 0.85;

                // Peak hold with decay
                if (barH > peakHold[i]) {
                    peakHold[i] = barH;
                    peakDecay[i] = 0;
                } else {
                    peakDecay[i] += 0.8;
                    peakHold[i] = Math.max(0, peakHold[i] - peakDecay[i]);
                }

                const x = i * barW;

                // Draw bar with gold gradient
                const grad = specCtx.createLinearGradient(0, ch, 0, ch - barH);
                grad.addColorStop(0, 'rgba(166, 138, 58, 0.5)');
                grad.addColorStop(0.5, 'rgba(201, 168, 76, 0.7)');
                grad.addColorStop(1, 'rgba(230, 200, 100, 0.9)');
                specCtx.fillStyle = grad;
                specCtx.fillRect(x + gap/2, ch - barH, barW - gap, barH);

                // Scanline effect on bars
                for (let sy = ch - barH; sy < ch; sy += 4) {
                    specCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                    specCtx.fillRect(x + gap/2, sy, barW - gap, 1);
                }

                // Peak hold indicator
                specCtx.fillStyle = 'rgba(230, 200, 100, 0.9)';
                specCtx.fillRect(x + gap/2, ch - peakHold[i] - 3, barW - gap, 3);

                // Glow on peak
                specCtx.shadowColor = 'rgba(201, 168, 76, 0.5)';
                specCtx.shadowBlur = 6;
                specCtx.fillRect(x + gap/2, ch - peakHold[i] - 3, barW - gap, 3);
                specCtx.shadowBlur = 0;
            }

            // CRT scanline overlay on entire canvas
            for (let sy = 0; sy < ch; sy += 6) {
                specCtx.fillStyle = 'rgba(0, 0, 0, 0.06)';
                specCtx.fillRect(0, sy, cw, 2);
            }

            // Clear the bottom baseline completely
            specCtx.clearRect(0, ch - 16, cw, 16);

            const now = Date.now();
            const scale = 1 + bass * 0.5;
            const glow = bass * 60;
            const spread = bass * 40;

            if (thumb) {
                thumb.style.transform = 'scale(' + scale + ')';
                thumb.style.boxShadow = '0 0 ' + glow + 'px ' + spread + 'px rgba(201, 168, 76, ' + (bass * 0.8) + ')';
            }

            const creditRow = thumb.closest('.credit-item');
            if (creditRow) {
                creditRow.style.background = 'rgba(201, 168, 76, ' + (bass * 0.08) + ')';
                creditRow.style.transform = 'scale(' + (1 + bass * 0.02) + ')';

                // Bass hit detection (threshold)
                if (bass > 0.45) {
                    creditRow.classList.add('bass-hit');
                    setTimeout(() => creditRow.classList.remove('bass-hit'), 100);

                    // Background flash
                    if (flashEl) {
                        flashEl.style.opacity = String(bass * 0.8);
                        setTimeout(() => { flashEl.style.opacity = '0'; }, 80);
                    }

                } else {
                    creditRow.classList.remove('bass-hit');
                }
            }

            // Mobile edge glow
            if (isMobile) updateEdgeGlow(bass);

            // Mobile player art pulse
            if (isMobile && mobilePlayer && mobilePlayer.classList.contains('active')) {
                const mpArt = mobilePlayer.querySelector('.mobile-player-art');
                if (mpArt) {
                    const s = 1 + bass * 0.12;
                    const g = bass * 40;
                    mpArt.style.transform = 'scale(' + s + ')';
                    mpArt.style.filter = 'drop-shadow(0 0 ' + g + 'px rgba(201, 168, 76, ' + (bass * 0.6) + '))';
                }
            }

            animFrameId = requestAnimationFrame(pulse);
        }
        pulse();
    }

    function stopBassAnalysis(item) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        const thumb = item ? item.querySelector('.credit-thumb') : null;
        if (thumb) {
            thumb.style.transform = '';
            thumb.style.boxShadow = '';
        }
        if (item) {
            item.style.background = '';
            item.style.transform = '';
            const specOverlay = document.querySelector('.spectrum-overlay');
            if (specOverlay) specOverlay.remove();
        }
    }

    document.querySelectorAll('.credit-item[data-preview]').forEach(item => {
        const previewUrl = item.dataset.preview;
        const btn = document.createElement('button');
        btn.className = 'credit-play';
        btn.innerHTML = playIcon;

        // Insert inside credit-thumb (overlay on cover art)
        const thumb = item.querySelector('.credit-thumb');
        if (thumb) {
            thumb.style.position = 'relative';
            thumb.appendChild(btn);

            // Add vinyl platter (grooved record behind the cover)
            const platter = document.createElement('div');
            platter.className = 'vinyl-platter';
            thumb.appendChild(platter);

            // Add vinyl needle
            const needle = document.createElement('div');
            needle.className = 'vinyl-needle';
            needle.innerHTML = '<svg viewBox="0 0 20 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<circle cx="16" cy="4" r="3.5" fill="#333" stroke="#555" stroke-width="1"/>' +
                '<line x1="16" y1="7" x2="8" y2="32" stroke="#888" stroke-width="2" stroke-linecap="round"/>' +
                '<line x1="8" y1="32" x2="6" y2="35" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>' +
                '<circle cx="6" cy="35" r="1" fill="#ccc"/>' +
                '</svg>';
            thumb.appendChild(needle);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentAudio && currentBtn === btn) {
                currentAudio.pause();
                btn.innerHTML = playIcon;
                btn.classList.remove('playing');
                item.classList.remove('now-playing');
                stopBassAnalysis(currentItem);
                currentAudio = null;
                currentBtn = null;
                currentItem = null;
                return;
            }
            if (currentAudio) {
                currentAudio.pause();
                currentBtn.innerHTML = playIcon;
                currentBtn.classList.remove('playing');
                if (currentItem) currentItem.classList.remove('now-playing');
                stopBassAnalysis(currentItem);
            }
            const audio = new Audio(previewUrl);
            audio.crossOrigin = 'anonymous';
            audio.play();
            btn.innerHTML = pauseIcon;
            btn.classList.add('playing');
            item.classList.add('now-playing');
            currentAudio = audio;
            currentBtn = btn;
            currentItem = item;
            startBassAnalysis(audio, item);
            if (isMobile) showMobilePlayer(item);
            audio.addEventListener('ended', () => {
                btn.innerHTML = playIcon;
                btn.classList.remove('playing');
                item.classList.remove('now-playing');
                stopBassAnalysis(item);
                currentAudio = null;
                currentBtn = null;
                currentItem = null;
                if (mobilePlayer) mobilePlayer.classList.remove('active');
                if (edgeGlow) edgeGlow.style.opacity = '0';
            });
        });
    });

    // ---- Credit item hover sound-wave effect ----
    document.querySelectorAll('.credit-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    });

});
