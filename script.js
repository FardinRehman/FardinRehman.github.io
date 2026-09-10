/* ═════════════════════════════════════════════════════════════════
   FARDIN REHMAN — COMPLETE MASTER PORTFOLIO LOGIC & INTERACTION
   Frame Scroll Engine • Tech Universe • Case Studies • Interactive CV
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
  const ctx            = canvas.getContext('2d');
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

  // Handle High DPI Canvas Sizing
  function resizeHeroCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    drawFrame(currentFrame);
  }

  // Draw current frame scaled to cover canvas with guaranteed face headroom clearance
  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    // Horizontal alignment:
    let dx;
    if (cw >= 992) {
      // Desktop: Fardin comfortably positioned on the right side
      dx = Math.max(cw - dw, (cw - dw) * 0.84);
    } else if (cw >= 768) {
      // Tablet: Fardin right-of-center
      dx = (cw - dw) * 0.72;
    } else {
      // Mobile (< 768px): Focus prominently on Fardin!
      // In the source cropped frame (1876w), Fardin's face center is at x ≈ 1460.
      // Align his face at 58% of the mobile screen width so he is clearly and attractively visible:
      const targetFaceX = cw * 0.58;
      dx = targetFaceX - (1460 * scale);
      dx = Math.min(0, Math.max(cw - dw, dx));
    }

    // Vertical alignment:
    const targetHeadY = cw < 768 ? Math.max(72, ch * 0.08) : Math.max(92, ch * 0.11);
    const initialDy = targetHeadY - (35 * scale);
    const centeredDy = (ch - dh) / 2;

    // Smoothly transition from head-anchored dy to watch-centered dy as animation zooms into the wrist
    const blend = Math.min(1, Math.max(0, (index - 10) / 45));
    const dy = initialDy * (1 - blend) + centeredDy * blend;

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Load an individual frame with promise
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
    // 1. Load first frame immediately to reveal hero without lag
    await loadSingleFrame(0);
    resizeHeroCanvas();
    drawFrame(0);

    // Fade out preloader quickly once hero is visible
    setTimeout(() => {
      if (preloader) preloader.classList.add('loaded');
    }, 400);

    // 2. Stream load remaining frames in batches of 15
    const batchSize = 15;
    for (let i = 1; i < FRAME_COUNT; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, FRAME_COUNT); j++) {
        batch.push(loadSingleFrame(j));
      }
      await Promise.all(batch);
    }
  }

  // Scroll handler calculating exact frame progress
  function onHeroScroll() {
    if (!heroSection) return;

    const rect = heroSection.getBoundingClientRect();
    const heroTop = window.scrollY + rect.top;
    const scrolled = window.scrollY - heroTop;
    const totalScroll = heroSection.offsetHeight - window.innerHeight;

    const rawProgress = totalScroll > 0 ? scrolled / totalScroll : 0;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Target frame calculation
    const targetIdx = Math.min(FRAME_COUNT - 1, Math.floor(progress * (FRAME_COUNT - 1)));
    if (targetIdx !== currentFrame) {
      currentFrame = targetIdx;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawFrame(currentFrame));
    }

    // Hero Text Fade Out: visible during first 20% of scroll
    if (heroCard) {
      const textFade = 1 - Math.min(1, progress / 0.18);
      const textY = -progress * 80;
      heroCard.style.opacity = textFade;
      heroCard.style.transform = `translateY(${textY}px)`;
      heroCard.style.pointerEvents = textFade < 0.1 ? 'none' : 'auto';
    }

    // Synchronize Story Panels in the blank space during scroll
    const storyPanel1 = document.getElementById('story-panel-1');
    const storyPanel2 = document.getElementById('story-panel-2');
    const storyPanel3 = document.getElementById('story-panel-3');

    // Stage 1: progress ~0.20 - 0.44
    const isStage1 = progress >= 0.20 && progress < 0.44;
    // Stage 2: progress ~0.44 - 0.74 (matches the exploded watch view)
    const isStage2 = progress >= 0.44 && progress < 0.74;
    // Stage 3: progress ~0.74 - 0.95
    const isStage3 = progress >= 0.74 && progress <= 0.95;

    if (storyPanel1) storyPanel1.classList.toggle('active', isStage1);
    if (storyPanel2) storyPanel2.classList.toggle('active', isStage2);
    if (storyPanel3) storyPanel3.classList.toggle('active', isStage3);

    // Scroll Cue visibility: hide after 4% scroll
    if (scrollCue) {
      scrollCue.style.opacity = progress > 0.04 ? '0' : '0.85';
      scrollCue.style.pointerEvents = progress > 0.04 ? 'none' : 'auto';
    }

    // Mid-scroll Precision Caption: visible during mid-range
    if (scrollCaption) {
      const showCaption = progress >= 0.35 && progress <= 0.85;
      scrollCaption.classList.toggle('visible', showCaption);
    }
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true });
  window.addEventListener('resize', resizeHeroCanvas, { passive: true });

  initHeroFrames();


  /* ─────────────────────────────────────────────────────────────
     2. FLOATING NAVBAR & ACTIVE SECTION OBSERVER
  ───────────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Shrink navbar on scroll
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active section spy using IntersectionObserver
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(sec => sectionObserver.observe(sec));

  // Mobile Menu Toggle
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


  /* ─────────────────────────────────────────────────────────────
     3. INTERACTIVE TECHNOLOGY UNIVERSE (CANVAS VISUALIZATION)
  ───────────────────────────────────────────────────────────── */
  const uCanvas = document.getElementById('universe-canvas');
  const uCatName = document.getElementById('u-category-name');
  const uCatTitle = document.getElementById('u-category-title');
  const uCatItems = document.getElementById('u-category-items');

  if (uCanvas) {
    const uCtx = uCanvas.getContext('2d');
    let uWidth = uCanvas.width;
    let uHeight = uCanvas.height;

    function resizeUniverse() {
      const rect = uCanvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      uCanvas.width = rect.width * dpr;
      uCanvas.height = rect.height * dpr;
      uWidth = rect.width;
      uHeight = rect.height;
      uCtx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeUniverse);
    resizeUniverse();

    // Orbiting Categories defined by Fardin's real skillset
    const categories = [
      {
        id: 'frontend',
        name: 'Frontend',
        angle: 0,
        distance: 140,
        color: '#2563eb',
        title: 'Modern Frontend Architecture',
        skills: 'React.js, JavaScript (ES6+), HTML5, CSS3, Responsive Layouts, Dynamic Canvas'
      },
      {
        id: 'backend',
        name: 'Backend',
        angle: (Math.PI * 2) / 6,
        distance: 155,
        color: '#10b981',
        title: 'Server & API Systems',
        skills: 'Node.js, Express.js, RESTful APIs, Middleware, Authentication, Server Logic'
      },
      {
        id: 'aiml',
        name: 'AI / ML',
        angle: ((Math.PI * 2) / 6) * 2,
        distance: 145,
        color: '#8b5cf6',
        title: 'Artificial Intelligence & Vision',
        skills: 'OpenCV, Computer Vision, TensorFlow, Keras, CNN, LSTM, Prompt Engineering, ChatGPT'
      },
      {
        id: 'database',
        name: 'Database',
        angle: ((Math.PI * 2) / 6) * 3,
        distance: 150,
        color: '#f59e0b',
        title: 'Data Storage & Models',
        skills: 'MongoDB, Document Schemas, Aggregation Pipelines, SQL, MySQL Relational Queries'
      },
      {
        id: 'tools',
        name: 'Tools',
        angle: ((Math.PI * 2) / 6) * 4,
        distance: 140,
        color: '#06b6d4',
        title: 'Engineering Environment',
        skills: 'Git, GitHub Collaboration, VS Code, Postman API Testing, Jupyter Notebook'
      },
      {
        id: 'design',
        name: 'Design & Cloud',
        angle: ((Math.PI * 2) / 6) * 5,
        distance: 150,
        color: '#ec4899',
        title: 'Design & Cloud Services',
        skills: 'Figma UI/UX, Component Systems, Cloudinary Cloud Storage, Firebase Services'
      }
    ];

    // Background ambient particle network
    const ambientParticles = Array.from({ length: 24 }, () => ({
      x: Math.random() * uWidth,
      y: Math.random() * uHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1
    }));

    let hoveredNode = null;
    let baseRotation = 0;

    function renderUniverse() {
      uCtx.clearRect(0, 0, uWidth, uHeight);

      const centerX = uWidth / 2;
      const centerY = uHeight / 2;
      baseRotation += 0.0015;

      // Draw ambient dust particles
      uCtx.fillStyle = 'rgba(18, 19, 22, 0.06)';
      ambientParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = uWidth;
        if (p.x > uWidth) p.x = 0;
        if (p.y < 0) p.y = uHeight;
        if (p.y > uHeight) p.y = 0;

        uCtx.beginPath();
        uCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        uCtx.fill();
      });

      // Draw orbital dashed rings
      [140, 155].forEach(radius => {
        uCtx.beginPath();
        uCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        uCtx.strokeStyle = 'rgba(18, 19, 22, 0.05)';
        uCtx.lineWidth = 1;
        uCtx.setLineDash([4, 6]);
        uCtx.stroke();
        uCtx.setLineDash([]);
      });

      // Calculate node positions
      categories.forEach(cat => {
        const currentAngle = cat.angle + baseRotation;
        cat.x = centerX + Math.cos(currentAngle) * cat.distance;
        cat.y = centerY + Math.sin(currentAngle) * cat.distance;

        // Connecting lines to center
        uCtx.beginPath();
        uCtx.moveTo(centerX, centerY);
        uCtx.lineTo(cat.x, cat.y);
        uCtx.strokeStyle = (hoveredNode === cat) ? cat.color : 'rgba(18, 19, 22, 0.1)';
        uCtx.lineWidth = (hoveredNode === cat) ? 2 : 1;
        uCtx.stroke();

        // Node circle
        uCtx.beginPath();
        uCtx.arc(cat.x, cat.y, (hoveredNode === cat) ? 22 : 18, 0, Math.PI * 2);
        uCtx.fillStyle = (hoveredNode === cat) ? cat.color : '#ffffff';
        uCtx.fill();
        uCtx.strokeStyle = cat.color;
        uCtx.lineWidth = 2.5;
        uCtx.stroke();

        // Node label
        uCtx.font = '600 11px Plus Jakarta Sans, sans-serif';
        uCtx.fillStyle = (hoveredNode === cat) ? '#ffffff' : '#121316';
        uCtx.textAlign = 'center';
        uCtx.textBaseline = 'middle';
        uCtx.fillText(cat.name, cat.x, cat.y);
      });

      // Center Core: "FARDIN"
      uCtx.beginPath();
      uCtx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      uCtx.fillStyle = '#121316';
      uCtx.fill();
      uCtx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      uCtx.lineWidth = 6;
      uCtx.stroke();

      uCtx.font = '800 13px Plus Jakarta Sans, sans-serif';
      uCtx.fillStyle = '#ffffff';
      uCtx.textAlign = 'center';
      uCtx.textBaseline = 'middle';
      uCtx.fillText('FARDIN', centerX, centerY - 2);

      uCtx.font = '600 8px Plus Jakarta Sans, sans-serif';
      uCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      uCtx.fillText('CORE', centerX, centerY + 11);

      requestAnimationFrame(renderUniverse);
    }
    renderUniverse();

    // Mousemove detection for universe nodes
    uCanvas.addEventListener('mousemove', (e) => {
      const rect = uCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found = null;
      categories.forEach(cat => {
        const dx = mouseX - cat.x;
        const dy = mouseY - cat.y;
        if (Math.hypot(dx, dy) < 26) {
          found = cat;
        }
      });

      hoveredNode = found;
      if (found) {
        uCanvas.style.cursor = 'pointer';
        if (uCatName) uCatName.textContent = found.name;
        if (uCatTitle) uCatTitle.textContent = found.title;
        if (uCatItems) uCatItems.textContent = found.skills;
      } else {
        uCanvas.style.cursor = 'default';
      }
    });
  }


  /* ─────────────────────────────────────────────────────────────
     4. PROJECT CASE STUDY MODAL & ACCESSIBLE DRAWER
  ───────────────────────────────────────────────────────────── */
  const caseStudyModal = document.getElementById('case-study-modal');
  const modalCloseBtn  = document.getElementById('modal-close-btn');
  const modalCat       = document.getElementById('modal-project-cat');
  const modalTitle     = document.getElementById('modal-project-title');
  const modalContent   = document.getElementById('modal-project-content');
  const caseStudyBtns  = document.querySelectorAll('.open-case-study-btn');

  // Authentic verified details only! No invented metrics or clients.
  const projectData = {
    rebellion: {
      category: 'Primary Featured • Full-Stack Web Application',
      title: 'Rebellion Sports Arena — Smart QR Ordering System',
      html: `
        <div class="cs-section">
          <h4>01 — Overview</h4>
          <p>A comprehensive QR-based food ordering and table-booking platform engineered to streamline restaurant dining operations. It eliminates order waiting times and replaces physical menus with instant digital table ordering.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Problem</h4>
          <p>Traditional restaurant workflows often face order bottlenecks during rush hours, misplaced manual tickets, and slow bill generation, diminishing the guest dining experience.</p>
        </div>
        <div class="cs-section">
          <h4>03 — Solution</h4>
          <p>A multi-panel digital suite: guests scan unique QR codes placed at their table to view the real-time menu, place orders directly, and track kitchen prep live without waiting for a server.</p>
        </div>
        <div class="cs-section">
          <h4>04 — Key Features</h4>
          <ul class="cs-bullets">
            <li><strong>Customer Panel:</strong> Instant QR-based ordering, table reservation, and real-time live order tracking.</li>
            <li><strong>Admin Panel:</strong> Menu item creation/editing, pricing controls, order history telemetry, and table occupancy management.</li>
            <li><strong>Chef Panel:</strong> Live kitchen display system (KDS) receiving new order tickets instantaneously with preparation timers.</li>
            <li><strong>Digital Bill Generation:</strong> Automated itemized bills with full price calculations.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>05 — Technology</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">React</span>
            <span class="cs-tech-pill">Node.js</span>
            <span class="cs-tech-pill">Express.js</span>
            <span class="cs-tech-pill">MongoDB</span>
            <span class="cs-tech-pill">JavaScript</span>
          </div>
        </div>
        <div class="cs-section">
          <h4>06 — Development Highlights</h4>
          <p>Built end-to-end with modular React components, clean Express REST routing, and MongoDB document schemas that reflect live table and order states.</p>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman/" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View on GitHub</span>
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
          <p>A modern e-commerce web platform for curated home décor products, providing a responsive catalog and administrative inventory control.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Key Features</h4>
          <ul class="cs-bullets">
            <li><strong>Product Browsing:</strong> Categorized home décor items with price filtering and high-resolution galleries.</li>
            <li><strong>Admin Dashboard:</strong> Full CRUD capability to add, update, and manage inventory without touching the code.</li>
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
          <a href="https://github.com/FardinRehman/" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View on GitHub</span>
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
          <p>An automated attendance management system using facial recognition and computer vision to verify individuals and log entries without paper roll calls.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Key Features</h4>
          <ul class="cs-bullets">
            <li><strong>Face Detection:</strong> Real-time frame capture identifying human faces accurately.</li>
            <li><strong>Feature Encoding & Match:</strong> Matching extracted facial landmarks against stored database embeddings.</li>
            <li><strong>Automated Logging:</strong> Instant attendance timestamping upon verification, reducing manual roll-call overhead.</li>
          </ul>
        </div>
        <div class="cs-section">
          <h4>03 — Technology</h4>
          <div class="cs-tech-row">
            <span class="cs-tech-pill">Python</span>
            <span class="cs-tech-pill">OpenCV</span>
            <span class="cs-tech-pill">Machine Learning</span>
            <span class="cs-tech-pill">NumPy</span>
          </div>
        </div>
        <div class="cs-actions">
          <a href="https://github.com/FardinRehman/" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View on GitHub</span>
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
          <p>An AI application that automatically synthesizes meaningful natural language sentences describing arbitrary uploaded images using deep learning.</p>
        </div>
        <div class="cs-section">
          <h4>02 — Technical Approach</h4>
          <ul class="cs-bullets">
            <li><strong>CNN Feature Extractor:</strong> Extracts high-level visual representation vectors from input images.</li>
            <li><strong>LSTM Sequence Predictor:</strong> Generates sequential word tokens conditioned on image feature vectors.</li>
            <li><strong>Hybrid Architecture:</strong> Merges visual convolutional representations with recurrent language generation.</li>
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
          <a href="https://github.com/FardinRehman/" target="_blank" rel="noopener noreferrer" class="btn-primary">
            <span>View on GitHub</span>
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
     5. RESUME VIEWER MODAL & PRINT ENGINE
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

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCaseStudy();
      closeResume();
    }
  });


  /* ─────────────────────────────────────────────────────────────
     6. SUBTLE 3D CARD TILT ON MOUSEMOVE
  ───────────────────────────────────────────────────────────── */
  const tiltElements = document.querySelectorAll('[data-tilt]');

  tiltElements.forEach(card => {
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
     7. DESKTOP CURSOR GLOW & MAGNETIC ATTRACTION
  ───────────────────────────────────────────────────────────── */
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

    // Hover scale states
    const interactiveTargets = document.querySelectorAll('a, button, [data-tilt], input, textarea');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }


  /* ─────────────────────────────────────────────────────────────
     8. CONTACT FORM HANDLING (SAFE DIRECT SUBMISSION)
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

      // Provide immediate UX confirmation
      setTimeout(() => {
        if (formFeedback) {
          formFeedback.className = 'form-status-alert success';
          formFeedback.innerHTML = `Thank you, <strong>${name}</strong>! Opening your email client to dispatch to <strong>fardinrehman63@gmail.com</strong>...`;
        }

        // Trigger safe pre-filled email client fallback
        const mailtoUrl = `mailto:fardinrehman63@gmail.com?subject=${encodeURIComponent(`Portfolio Inquiry from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        window.location.href = mailtoUrl;

        contactForm.reset();

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = '<span>Say Hello →</span>';
        }
      }, 700);
    });
  }

});
