/* ═════════════════════════════════════════════════════════════════
   FARDIN REHMAN — COMPLETE PORTFOLIO LOGIC & INTERACTION ENGINE
   4 Canonical Movements: Work • About • Experience • Contact
   Frame Scroll Engine • Case Studies • Clean Resume Modal
   ═════════════════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────────────────────
     1. HERO CANVAS SCROLL-DRIVEN FRAME ANIMATION ENGINE
  ───────────────────────────────────────────────────────────── */
  const FRAME_COUNT = 122;
  const FRAME_DIR   = 'ezgif-401ab6cea54b4b2c-jpg/';
  const images      = new Array(FRAME_COUNT);
  let loadedCount   = 0;
  let currentFrame  = 0;
  let rafId         = null;

  const canvas         = document.getElementById('hero-frame-canvas');
  const ctx            = canvas ? canvas.getContext('2d') : null;
  const heroCard       = document.getElementById('hero-card');
  const scrollCue      = document.getElementById('hero-scroll-cue');
  const scrollCaption  = document.getElementById('hero-scroll-caption');
  const heroSection    = document.getElementById('hero');
  const preloaderBar   = document.getElementById('preloader-bar');
  const preloader      = document.getElementById('preloader');

  function getFrameUrl(idx) {
    const num = String(idx + 1).padStart(3, '0');
    return `${FRAME_DIR}ezgif-frame-${num}.jpg?v=2.5`;
  }

  function resizeHeroCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width  = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawFrame(currentFrame);
  }

  function drawFrame(index) {
    if (!ctx) return;
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    let dx;
    if (cw >= 992) {
      dx = Math.max(cw - dw, (cw - dw) * 0.84);
    } else if (cw >= 768) {
      dx = (cw - dw) * 0.72;
    } else {
      const targetFaceX = cw * 0.58;
      dx = targetFaceX - (1460 * scale);
      dx = Math.min(0, Math.max(cw - dw, dx));
    }

    const targetHeadY = cw < 768 ? Math.max(72, ch * 0.08) : Math.max(92, ch * 0.11);
    const initialDy = targetHeadY - (35 * scale);
    const centeredDy = (ch - dh) / 2;

    const blend = Math.min(1, Math.max(0, (index - 10) / 45));
    const dy = initialDy * (1 - blend) + centeredDy * blend;

    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function loadSingleFrame(idx) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        images[idx] = img;
        loadedCount++;
        updatePreloader();
        resolve();
      };
      img.onerror = () => {
        images[idx] = null;
        loadedCount++;
        updatePreloader();
        resolve();
      };
      img.src = getFrameUrl(idx);
    });
  }

  function updatePreloader() {
    const pct = Math.floor((loadedCount / FRAME_COUNT) * 100);
    if (preloaderBar) preloaderBar.style.width = `${pct}%`;
  }

  async function initHeroFrames() {
    const safetyTimer = setTimeout(() => {
      if (preloader) preloader.classList.add('loaded');
    }, 1200);

    try {
      await loadSingleFrame(0);
      resizeHeroCanvas();
      drawFrame(0);

      setTimeout(() => {
        if (preloader) preloader.classList.add('loaded');
        clearTimeout(safetyTimer);
      }, 300);

      const batchSize = 15;
      for (let i = 1; i < FRAME_COUNT; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, FRAME_COUNT); j++) {
          batch.push(loadSingleFrame(j));
        }
        await Promise.all(batch);
      }
    } catch (err) {
      if (preloader) preloader.classList.add('loaded');
      clearTimeout(safetyTimer);
    }
  }

  const storyPanel1 = document.getElementById('story-panel-1');
  const storyPanel2 = document.getElementById('story-panel-2');
  const storyPanel3 = document.getElementById('story-panel-3');

  function onHeroScroll() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const heroHeight = heroSection.offsetHeight - window.innerHeight;
    if (heroHeight <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / heroHeight));

    const targetFrame = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    if (targetFrame !== currentFrame) {
      currentFrame = targetFrame;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawFrame(currentFrame));
    }

    // Hero intro card fade & translate out
    if (heroCard) {
      if (progress <= 0.22) {
        const cardOpacity = 1 - (progress / 0.18);
        const cardY = progress * -120;
        heroCard.style.opacity = Math.max(0, cardOpacity).toFixed(3);
        heroCard.style.transform = `translateY(${cardY.toFixed(1)}px)`;
        heroCard.style.pointerEvents = progress > 0.15 ? 'none' : 'auto';
      } else {
        heroCard.style.opacity = '0';
        heroCard.style.pointerEvents = 'none';
      }
    }

    // Story stream panels orchestration
    if (storyPanel1) {
      const p1Active = progress >= 0.22 && progress < 0.46;
      storyPanel1.classList.toggle('active', p1Active);
    }
    if (storyPanel2) {
      const p2Active = progress >= 0.46 && progress < 0.74;
      storyPanel2.classList.toggle('active', p2Active);
    }
    if (storyPanel3) {
      const p3Active = progress >= 0.74 && progress <= 0.98;
      storyPanel3.classList.toggle('active', p3Active);
    }

    if (scrollCue) {
      scrollCue.style.opacity = progress > 0.04 ? '0' : '0.85';
      scrollCue.style.pointerEvents = progress > 0.04 ? 'none' : 'auto';
    }

    if (scrollCaption) {
      const showCaption = progress >= 0.35 && progress <= 0.85;
      scrollCaption.classList.toggle('visible', showCaption);
    }
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true });
  window.addEventListener('resize', resizeHeroCanvas, { passive: true });

  initHeroFrames();


  /* ─────────────────────────────────────────────────────────────
     2. FLOATING NAVBAR & MOBILE DRAWER
  ───────────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const mobileResumeLink = document.getElementById('mobile-resume-link');

  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if (mobileResumeLink) {
    mobileResumeLink.addEventListener('click', (e) => {
      e.preventDefault();
      openResume();
    });
  }


  /* ─────────────────────────────────────────────────────────────
     3. PROJECT CASE STUDY MODAL
  ───────────────────────────────────────────────────────────── */
  const caseStudyModal = document.getElementById('case-study-modal');
  const modalCloseBtn  = document.getElementById('modal-close-btn');
  const modalCat       = document.getElementById('modal-project-cat');
  const modalTitle     = document.getElementById('modal-project-title');
  const modalContent   = document.getElementById('modal-project-content');
  const caseStudyBtns  = document.querySelectorAll('.open-case-study-btn');

  const projectData = {
    rebellion: {
      category: 'Flagship • Full-Stack Web Application',
      title: 'Rebellion Sports Arena — QR Ordering Platform',
      html: `
        <div class="cs-section">
          <h4>01 — Overview</h4>
          <p>A multi-panel food ordering and table booking platform built to streamline restaurant operations. Guests scan unique table QR codes to browse live menus and place orders. Order tickets appear on the kitchen display the moment a guest confirms.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Problem & Solution</h4>
          <p>Traditional restaurant workflows often face order bottlenecks during rush hours, misplaced manual tickets, and slow bill generation. Rebellion replaces physical menus with instant digital table ordering across three synchronized panels.</p>
        </div>
        <div class="cs-section">
          <h4>03 — Core Panels & Features</h4>
          <ul class="cs-bullets">
            <li><strong>Customer Panel:</strong> Instant table QR scanning, responsive dish customization, table booking, and real-time kitchen preparation tracking.</li>
            <li><strong>Admin Panel:</strong> Menu item creation and editing, pricing controls, order history telemetry, and table occupancy management.</li>
            <li><strong>Chef Panel:</strong> Live Kitchen Display System (KDS) receiving new order tickets with automated preparation timers.</li>
            <li><strong>Digital Billing:</strong> Automated itemized bills with order breakdown calculations.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>04 — Technology Stack</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">React</span>
            <span class="cs-tech-pill">Node.js</span>
            <span class="cs-tech-pill">Express.js</span>
            <span class="cs-tech-pill">MongoDB</span>
            <span class="cs-tech-pill">JavaScript (ES6+)</span>
          </div>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View GitHub Profile</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
        </div>
      `
    },
    decors: {
      category: 'E-Commerce Platform • Full-Stack Web',
      title: 'DR. DECORS — E-Commerce Platform',
      html: `
        <div class="cs-section">
          <h4>01 — Overview</h4>
          <p>A modern e-commerce web platform for curated home décor products, providing a responsive catalog and administrative inventory controls.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Key Features</h4>
          <ul class="cs-bullets">
            <li><strong>Product Browsing:</strong> Categorized home décor items with price filtering and responsive product cards.</li>
            <li><strong>Admin Dashboard:</strong> Full CRUD capability to add, update, and manage inventory seamlessly.</li>
            <li><strong>Role-Based Authentication:</strong> Secure user access separating standard customer accounts from store managers.</li>
            <li><strong>Cloudinary Integration:</strong> Scalable cloud image uploads and optimized asset delivery.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>03 — Technology</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">React</span>
            <span class="cs-tech-pill">Node.js</span>
            <span class="cs-tech-pill">Express.js</span>
            <span class="cs-tech-pill">MongoDB</span>
            <span class="cs-tech-pill">Cloudinary</span>
          </div>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View GitHub Profile</span>
          </a>
        </div>
      `
    },
    attendance: {
      category: 'Computer Vision & Machine Learning',
      title: 'Facial Recognition Attendance System',
      html: `
        <div class="cs-section">
          <h4>01 — Overview</h4>
          <p>An automated attendance management system using facial recognition and computer vision to verify individuals and log verified records in under a second.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Technical Implementation</h4>
          <ul class="cs-bullets">
            <li><strong>Face Detection:</strong> Real-time frame capture identifying human faces accurately.</li>
            <li><strong>Feature Encoding:</strong> Matching extracted facial landmarks against stored database embeddings.</li>
            <li><strong>Automated Logging:</strong> Instant attendance timestamping upon verification, eliminating paper roll-calls.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>03 — Technology</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">Python</span>
            <span class="cs-tech-pill">OpenCV</span>
            <span class="cs-tech-pill">NumPy</span>
            <span class="cs-tech-pill">Machine Learning</span>
          </div>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View GitHub Profile</span>
          </a>
        </div>
      `
    },
    caption: {
      category: 'Deep Learning & Natural Language Processing',
      title: 'Image Caption Generator',
      html: `
        <div class="cs-section">
          <h4>01 — Overview</h4>
          <p>An AI system that synthesizes coherent natural language descriptions for uploaded images using a hybrid deep learning architecture.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Architecture</h4>
          <ul class="cs-bullets">
            <li><strong>CNN Feature Extractor:</strong> Extracts high-level visual representation vectors from input images.</li>
            <li><strong>LSTM Sequence Predictor:</strong> Generates sequential word tokens conditioned on image feature vectors.</li>
            <li><strong>Hybrid Pipeline:</strong> Merges visual convolutional representations with recurrent language generation.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>03 — Technology</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">Python</span>
            <span class="cs-tech-pill">TensorFlow</span>
            <span class="cs-tech-pill">Keras</span>
            <span class="cs-tech-pill">CNN</span>
            <span class="cs-tech-pill">LSTM</span>
          </div>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View GitHub Profile</span>
          </a>
        </div>
      `
    }
  };

  function openCaseStudy(projKey) {
    const data = projectData[projKey];
    if (!data) return;
    if (modalCat) modalCat.textContent = data.category;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalContent) modalContent.innerHTML = data.html;
    if (caseStudyModal) {
      caseStudyModal.classList.add('open');
      caseStudyModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCaseStudy() {
    if (caseStudyModal) {
      caseStudyModal.classList.remove('open');
      caseStudyModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  caseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      openCaseStudy(projKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCaseStudy);

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) closeCaseStudy();
    });
  }


  /* ─────────────────────────────────────────────────────────────
     4. RESUME VIEWER MODAL
  ───────────────────────────────────────────────────────────── */
  const resumeModal        = document.getElementById('resume-modal');
  const openResumeNavBtn   = document.getElementById('open-resume-nav-btn');
  const viewResumeModalBtn = document.getElementById('view-resume-modal-btn');
  const downloadResumeBtn  = document.getElementById('download-resume-btn');
  const resumeCloseBtn     = document.getElementById('resume-close-btn');
  const printResumeBtn     = document.getElementById('print-resume-btn');

  function openResume() {
    if (resumeModal) {
      resumeModal.classList.add('open');
      resumeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResume() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      resumeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (openResumeNavBtn) openResumeNavBtn.addEventListener('click', openResume);
  if (viewResumeModalBtn) viewResumeModalBtn.addEventListener('click', openResume);
  if (resumeCloseBtn) resumeCloseBtn.addEventListener('click', closeResume);

  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', () => {
      openResume();
      setTimeout(() => window.print(), 350);
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => window.print());
  }

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResume();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCaseStudy();
      closeResume();
    }
  });


  /* ─────────────────────────────────────────────────────────────
     5. DYNAMIC AMBIENT BACKGROUND CANVAS ENGINE
  ───────────────────────────────────────────────────────────── */
  const bgCanvas = document.getElementById('dynamic-bg-canvas');
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext('2d');
    let bgWidth = 0;
    let bgHeight = 0;
    let bgParticles = [];
    let bgShockwaves = [];
    let mousePos = { x: -1000, y: -1000, active: false };

    // 4 Canonical Movements Palette mappings
    const SECTION_PALETTES = {
      hero:       { r1: 99,  g1: 102, b1: 241, r2: 6,   g2: 182, b2: 212, speed: 0.6, count: 65 },
      work:       { r1: 16,  g1: 185, b1: 129, r2: 6,   g2: 182, b2: 212, speed: 0.8, count: 75 },
      about:      { r1: 168, g1: 85,  b1: 247, r2: 244, g2: 63,  b2: 94,  speed: 0.7, count: 70 },
      experience: { r1: 245, g1: 158, b1: 11,  r2: 99,  g2: 102, b2: 241, speed: 0.7, count: 75 },
      contact:    { r1: 244, g1: 63,  b1: 94,  r2: 99,  g2: 102, b2: 241, speed: 0.8, count: 70 }
    };

    let currentColor = { r1: 99, g1: 102, b1: 241, r2: 6, g2: 182, b2: 212, speed: 0.6 };

    function resizeBgCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgWidth  = window.innerWidth;
      bgHeight = window.innerHeight;
      bgCanvas.width  = Math.round(bgWidth * dpr);
      bgCanvas.height = Math.round(bgHeight * dpr);
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class DynamicParticle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * bgWidth;
        this.y = initial ? Math.random() * bgHeight : (Math.random() < 0.5 ? -10 : bgHeight + 10);
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
        this.colorType = Math.random() < 0.65 ? 1 : 2;
      }
      update(currentSpeed) {
        this.pulse += 0.03;
        this.x += this.vx * currentSpeed;
        this.y += this.vy * currentSpeed;

        if (mousePos.active) {
          const dx = mousePos.x - this.x;
          const dy = mousePos.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
            this.size = this.baseSize * (1 + force * 1.5);
          } else {
            this.size = this.baseSize;
          }
        }

        if (this.x < -20) this.x = bgWidth + 20;
        if (this.x > bgWidth + 20) this.x = -20;
        if (this.y < -20) this.y = bgHeight + 20;
        if (this.y > bgHeight + 20) this.y = -20;
      }
      draw() {
        const pulseAlpha = this.alpha * (0.8 + 0.2 * Math.sin(this.pulse));
        const r = this.colorType === 1 ? currentColor.r1 : currentColor.r2;
        const g = this.colorType === 1 ? currentColor.g1 : currentColor.g2;
        const b = this.colorType === 1 ? currentColor.b1 : currentColor.b2;

        bgCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseAlpha})`;
        bgCtx.shadowColor = `rgba(${r}, ${g}, ${b}, ${pulseAlpha * 0.8})`;
        bgCtx.shadowBlur = 6;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.shadowBlur = 0;
      }
    }

    function initBgParticles() {
      bgParticles = [];
      const count = 70;
      for (let i = 0; i < count; i++) {
        bgParticles.push(new DynamicParticle());
      }
    }

    function triggerShockwave(x, y) {
      bgShockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: 180,
        alpha: 0.6,
        r: currentColor.r1,
        g: currentColor.g1,
        b: currentColor.b1
      });
    }

    window.addEventListener('click', (e) => {
      triggerShockwave(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      mousePos.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mousePos.active = false;
    });

    function renderBgAnimation() {
      bgCtx.clearRect(0, 0, bgWidth, bgHeight);

      const activeSec = document.body.dataset.activeSection || 'hero';
      const targetPalette = SECTION_PALETTES[activeSec] || SECTION_PALETTES.hero;
      const lerpFactor = 0.04;

      currentColor.r1 += (targetPalette.r1 - currentColor.r1) * lerpFactor;
      currentColor.g1 += (targetPalette.g1 - currentColor.g1) * lerpFactor;
      currentColor.b1 += (targetPalette.b1 - currentColor.b1) * lerpFactor;
      currentColor.r2 += (targetPalette.r2 - currentColor.r2) * lerpFactor;
      currentColor.g2 += (targetPalette.g2 - currentColor.g2) * lerpFactor;
      currentColor.b2 += (targetPalette.b2 - currentColor.b2) * lerpFactor;
      currentColor.speed += (targetPalette.speed - currentColor.speed) * lerpFactor;

      for (let i = 0; i < bgParticles.length; i++) {
        bgParticles[i].update(currentColor.speed);
        bgParticles[i].draw();

        for (let j = i + 1; j < bgParticles.length; j++) {
          const dx = bgParticles[i].x - bgParticles[j].x;
          const dy = bgParticles[i].y - bgParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.18;
            bgCtx.strokeStyle = `rgba(${currentColor.r1}, ${currentColor.g1}, ${currentColor.b1}, ${lineAlpha})`;
            bgCtx.lineWidth = 0.75;
            bgCtx.beginPath();
            bgCtx.moveTo(bgParticles[i].x, bgParticles[i].y);
            bgCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
            bgCtx.stroke();
          }
        }
      }

      for (let i = bgShockwaves.length - 1; i >= 0; i--) {
        const sw = bgShockwaves[i];
        sw.radius += 5;
        sw.alpha -= 0.015;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          bgShockwaves.splice(i, 1);
          continue;
        }

        bgCtx.save();
        bgCtx.strokeStyle = `rgba(${sw.r}, ${sw.g}, ${sw.b}, ${sw.alpha})`;
        bgCtx.shadowColor = `rgba(${sw.r}, ${sw.g}, ${sw.b}, ${sw.alpha})`;
        bgCtx.shadowBlur = 10;
        bgCtx.lineWidth = 2;
        bgCtx.beginPath();
        bgCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        bgCtx.stroke();
        bgCtx.restore();
      }

      requestAnimationFrame(renderBgAnimation);
    }

    resizeBgCanvas();
    initBgParticles();
    renderBgAnimation();
    window.addEventListener('resize', resizeBgCanvas, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────────
     6. ACTIVE SECTION SPY & SMART DOCK (4 MOVEMENTS)
  ───────────────────────────────────────────────────────────── */
  const allSections = document.querySelectorAll('section[id]');
  const dockItems   = document.querySelectorAll('.dock-item');
  const navMenuItems = document.querySelectorAll('.nav-menu .nav-item');
  const dockFill    = document.getElementById('dock-progress-fill');
  const dockPctLabel= document.getElementById('dock-pct-label');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.body.dataset.activeSection = id;

        dockItems.forEach(item => {
          const match = item.getAttribute('href') === `#${id}`;
          item.classList.toggle('active', match);
        });

        navMenuItems.forEach(item => {
          const match = item.getAttribute('href') === `#${id}`;
          item.classList.toggle('active', match);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -40% 0px',
    threshold: 0.1
  });

  allSections.forEach(sec => sectionObserver.observe(sec));

  function updateScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled  = window.scrollY;
    const progress  = docHeight > 0 ? Math.min(1, Math.max(0, scrolled / docHeight)) : 0;
    const pct       = Math.round(progress * 100);

    if (dockPctLabel) dockPctLabel.textContent = `${pct}%`;
    if (dockFill) {
      const circumference = 87.96;
      const offset = circumference - (progress * circumference);
      dockFill.style.strokeDashoffset = offset;
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();


  /* ─────────────────────────────────────────────────────────────
     7. 3D CARD TILT MICRO-INTERACTIONS
  ───────────────────────────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });


  /* ─────────────────────────────────────────────────────────────
     8. MAGNETIC BUTTONS & DESKTOP CURSOR
  ───────────────────────────────────────────────────────────── */
  const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .brand-link, .btn-resume-nav, .btn-nav-cta');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  const cursorGlow = document.getElementById('cursor-glow');
  const cursorDot  = document.getElementById('cursor-dot');

  if (cursorGlow && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top  = `${mouseY}px`;
    }, { passive: true });

    function renderGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top  = `${glowY}px`;
      requestAnimationFrame(renderGlow);
    }
    renderGlow();

    const interactiveTargets = document.querySelectorAll('a, button, [data-tilt], input, textarea');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  /* ─────────────────────────────────────────────────────────────
     9. CONTACT FORM HANDLING
  ───────────────────────────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        if (formFeedback) {
          formFeedback.className = 'form-status-alert error';
          formFeedback.textContent = 'Please fill out all required fields.';
        }
        return;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = '<span>Preparing Message…</span>';
      }

      setTimeout(() => {
        if (formFeedback) {
          formFeedback.className = 'form-status-alert success';
          formFeedback.innerHTML = `Thank you, <strong>${name}</strong>! Opening your email client to dispatch to <strong>fardinrehman63@gmail.com</strong>...`;
        }

        const mailtoUrl = `mailto:fardinrehman63@gmail.com?subject=${encodeURIComponent(`Portfolio Inquiry from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        window.location.href = mailtoUrl;

        contactForm.reset();

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = '<span>Send Message</span>';
        }
      }, 600);
    });
  }

});
