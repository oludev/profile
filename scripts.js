
        // ========== THEME TOGGLE ==========
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;

        function setTheme(theme) {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }

        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });

        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);

        // ========== PARTICLE BACKGROUND ==========
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = -1000;
        let mouseY = -1000;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.8 + 0.3;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120 * 0.02;
                    this.x -= dx * force;
                    this.y -= dy * force;
                }

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                const theme = html.getAttribute('data-theme');
                const color = theme === 'dark' ? '124, 108, 240' : '99, 84, 217';
                ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 18000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            const theme = html.getAttribute('data-theme');
            const color = theme === 'dark' ? '124, 108, 240' : '99, 84, 217';
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        const opacity = (1 - dist / 140) * 0.12;
                        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        resizeCanvas();
        initParticles();
        animateParticles();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 200);
        });

        // Mouse tracking for particles
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // ========== SKILL CARD MOUSE TRACKING ==========
        document.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });

        // ========== TYPING EFFECT ==========
        const typingTexts = [
            'Backend Engineer',
            'API Architect',
            'Problem Solver'
        ];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingElement = document.getElementById('typing-text');

        function typeEffect() {
            const currentText = typingTexts[textIndex];
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? 40 : 90;

            if (!isDeleting && charIndex === currentText.length) {
                speed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % typingTexts.length;
                speed = 400;
            }

            setTimeout(typeEffect, speed);
        }

        typeEffect();

        // ========== COUNTER ANIMATION ==========
        let countersAnimated = false;

        function animateCounters() {
            if (countersAnimated) return;
            countersAnimated = true;

            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const start = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 4);
                    counter.textContent = Math.floor(eased * target) + '+';
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }

        // Observe stats for counter animation
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateCounters();
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.hero-stats').forEach(el => statsObserver.observe(el));

        // ========== PROJECTS CAROUSEL ==========
        const carouselTrack = document.getElementById('carouselTrack');
        const slides = carouselTrack.children;
        const totalSlides = slides.length;
        let currentSlide = 0;
        let autoplayInterval;

        const dotsContainer = document.getElementById('carouselDots');
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
            dotsContainer.appendChild(dot);
        }

        function goToSlide(index) {
            currentSlide = index;
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        }

        document.getElementById('prevBtn').addEventListener('click', () => {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
            resetAutoplay();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            goToSlide((currentSlide + 1) % totalSlides);
            resetAutoplay();
        });

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                goToSlide((currentSlide + 1) % totalSlides);
            }, 5000);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }

        startAutoplay();

        // Touch/Swipe support
        let touchStartX = 0;
        carouselTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                goToSlide(diff > 0
                    ? (currentSlide + 1) % totalSlides
                    : (currentSlide - 1 + totalSlides) % totalSlides
                );
                resetAutoplay();
            }
        }, { passive: true });

        // ========== TESTIMONIALS SLIDER ==========
        const testTrack = document.getElementById('testimonialTrack');
        const testSlides = testTrack.children;
        let currentTest = 0;
        let testAutoplay;

        function goToTestimonial(index) {
            currentTest = index;
            testTrack.style.transform = `translateX(-${currentTest * 100}%)`;
        }

        document.getElementById('testPrev').addEventListener('click', () => {
            goToTestimonial((currentTest - 1 + testSlides.length) % testSlides.length);
            clearInterval(testAutoplay);
            startTestAutoplay();
        });

        document.getElementById('testNext').addEventListener('click', () => {
            goToTestimonial((currentTest + 1) % testSlides.length);
            clearInterval(testAutoplay);
            startTestAutoplay();
        });

        function startTestAutoplay() {
            testAutoplay = setInterval(() => {
                goToTestimonial((currentTest + 1) % testSlides.length);
            }, 6000);
        }

        startTestAutoplay();

        // ========== SCROLL REVEAL ==========
        const revealElements = document.querySelectorAll('.reveal, .timeline-item');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));

        // ========== SKILL BARS ANIMATION ==========
        const skillBars = document.querySelectorAll('.skill-bar');

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    setTimeout(() => {
                        bar.style.width = bar.getAttribute('data-width') + '%';
                    }, 200);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(bar => skillObserver.observe(bar));

        // ========== NAVBAR ==========
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        const navOverlay = document.getElementById('navOverlay');

        function toggleMobileNav() {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }

        function closeMobileNav() {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', toggleMobileNav);
        navOverlay.addEventListener('click', closeMobileNav);

        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileNav();
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');

        function updateActiveNav() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                if (scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }

        // ========== NAVBAR SCROLL EFFECT ==========
        const navbar = document.getElementById('navbar');

        function handleScroll() {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
            scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
            updateActiveNav();
        }

        // Throttle scroll events
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        // ========== SCROLL TO TOP ==========
        const scrollTopBtn = document.getElementById('scrollTop');

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // ========== CONTACT FORM ==========
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('.btn-submit');
            const originalText = btn.textContent;
            btn.textContent = 'Sending... <i class="fa-solid fa-hourglass-half"></i>';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'Message Sent! <i class="fa-solid fa-check"></i>';
                btn.style.opacity = '1';
                btn.style.background = 'linear-gradient(135deg, #00e0d0, #00b894)';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    e.target.reset();
                }, 2500);
            }, 1500);
        });

        // ========== KEYBOARD NAVIGATION ==========
        document.addEventListener('keydown', (e) => {
            // Only for carousel when it's in view
            if (e.key === 'Escape') {
                closeMobileNav();
            }
        });

        // Carousel keyboard nav only when focused
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        carouselWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                document.getElementById('prevBtn').click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('nextBtn').click();
            }
        });

        // ========== INITIAL SCROLL CHECK ==========
        handleScroll();
    