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
        });
    });

    // ---- Credit item hover sound-wave effect ----
    document.querySelectorAll('.credit-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    });

});
