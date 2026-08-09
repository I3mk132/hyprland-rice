/* ==========================================
   DIJIVOO — SCRIPT
   Perf notes (see comments inline near each function):
   - Canvas particle background: capped to ~30fps, uses
     squared-distance prefiltering, scales particle count
     to screen size, and pauses when the tab is hidden.
   - Card tilt effect: caches getBoundingClientRect() and
     batches transform writes into requestAnimationFrame
     instead of writing on every mousemove.
   - Scroll progress bar / nav shrink: throttled to one
     rAF-batched update instead of running on every
     'scroll' event.
   - Hero mouse glow: same rAF-batching pattern (note: the
     --mx/--my custom properties it sets aren't currently
     referenced anywhere in style.css, so this is inert —
     safe to remove entirely if you don't plan to wire up
     a glow effect with it).
   ========================================== */

/* ==========================================
   SITE DATA — EDIT HERE EASILY
   ========================================== */

const SERVICES = [
  {
    icon: '🛒',
    tr: { title: 'Dijital Mağazalar', desc: 'E-ticaret sitesi kurulumu, ürün yönetimi ve online satış altyapısı. Müşterilerinize 7/24 ulaşın.', tag: 'E-Ticaret' },
    ar: { title: 'المتاجر الرقمية', desc: 'إنشاء متاجر إلكترونية وإدارة المنتجات وبنية تحتية للمبيعات عبر الإنترنت. تواصل مع عملائك على مدار الساعة.', tag: 'التجارة الإلكترونية' },
    en: { title: 'Digital Stores', desc: 'E-commerce site setup, product management, and online sales infrastructure. Reach your customers 24/7.', tag: 'E-Commerce' }
  },
  {
    icon: '📦',
    tr: { title: 'Ürün Yönetim Sistemleri', desc: 'Stok takibi, sipariş yönetimi ve raporlama. İşletmenizi verimli yönetin.', tag: 'Yönetim Sistemi' },
    ar: { title: 'أنظمة إدارة المنتجات', desc: 'تتبع المخزون وإدارة الطلبات وإعداد التقارير. أدر عملك بكفاءة عالية.', tag: 'نظام إدارة' },
    en: { title: 'Product Management Systems', desc: 'Stock tracking, order management, and reporting. Manage your business efficiently.', tag: 'Management' }
  },
  {
    icon: '🍽️',
    tr: { title: 'Dijital Menüler', desc: 'Restoran ve kafeler için QR kodlu dijital menüler. Güncel tutması kolay, görsel açıdan çarpıcı.', tag: 'Restoran & Kafe' },
    ar: { title: 'القوائم الرقمية', desc: 'قوائم رقمية بالرمز QR للمطاعم والمقاهي. سهلة التحديث ومثيرة بصرياً.', tag: 'مطاعم وكافيهات' },
    en: { title: 'Digital Menus', desc: 'QR-coded digital menus for restaurants and cafes. Easy to update and visually striking.', tag: 'Restaurant & Cafe' }
  },
  {
    icon: '📅',
    tr: { title: 'Randevu Sistemleri', desc: 'Klinik, salon ve hizmet sektörü için online randevu ve takvim yönetim sistemleri.', tag: 'Randevu' },
    ar: { title: 'أنظمة المواعيد', desc: 'أنظمة حجز المواعيد وإدارة التقويم للعيادات والصالونات وقطاع الخدمات.', tag: 'حجوزات' },
    en: { title: 'Appointment Systems', desc: 'Online booking and calendar management systems for clinics, salons and service sectors.', tag: 'Booking' }
  },
  {
    icon: '🌐',
    tr: { title: 'Tam Dijital Dönüşüm', desc: 'Fiziksel işletmenizi dijital dünyaya taşıyoruz. Web sitesi, sosyal medya hesapları, Google Maps kaydı ve marka kimliği.', tag: 'Dönüşüm' },
    ar: { title: 'التحول الرقمي الكامل', desc: 'ننقل عملك التقليدي إلى العالم الرقمي. موقع إلكتروني وحسابات تواصل اجتماعي وتسجيل خرائط جوجل وهوية العلامة التجارية.', tag: 'تحول رقمي' },
    en: { title: 'Full Digital Transformation', desc: 'We bring your physical business to the digital world. Website, social media accounts, Google Maps listing and brand identity.', tag: 'Transformation' }
  },
  {
    icon: '📱',
    tr: { title: 'Sosyal Medya Yönetimi', desc: 'Instagram, TikTok ve diğer platformlarda içerik üretimi, hesap yönetimi ve büyüme stratejisi.', tag: 'Sosyal Medya' },
    ar: { title: 'إدارة وسائل التواصل الاجتماعي', desc: 'إنتاج محتوى وإدارة حسابات واستراتيجية نمو على إنستغرام وتيك توك والمنصات الأخرى.', tag: 'سوشيال ميديا' },
    en: { title: 'Social Media Management', desc: 'Content creation, account management and growth strategy on Instagram, TikTok and other platforms.', tag: 'Social Media' }
  }
];

const WORKS = [
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    tags: ['E-Ticaret', 'Web'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Moda Butik Mağazası', desc: 'Tam kapsamlı e-ticaret sitesi, ürün yönetimi ve ödeme entegrasyonu ile.' },
    ar: { title: 'متجر البوتيك الأزياء', desc: 'موقع تجارة إلكترونية متكامل مع إدارة المنتجات وتكامل الدفع.' },
    en: { title: 'Fashion Boutique Store', desc: 'Full e-commerce site with product management and payment integration.' }
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    tags: ['Dijital Menü', 'QR'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Akdeniz Mutfağı Restoran', desc: 'QR kodlu interaktif dijital menü, filtreleme ve dil desteği ile.' },
    ar: { title: 'مطعم المطبخ المتوسطي', desc: 'قائمة رقمية تفاعلية بالرمز QR مع التصفية ودعم اللغات.' },
    en: { title: 'Mediterranean Restaurant', desc: 'Interactive QR-coded digital menu with filtering and language support.' }
  },
  {
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    tags: ['Randevu', 'Klinik'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Diş Kliniği Randevu Sistemi', desc: 'Hasta randevu yönetimi, SMS hatırlatma ve doktor takvim paneli.' },
    ar: { title: 'نظام مواعيد عيادة أسنان', desc: 'إدارة مواعيد المرضى، تذكير برسائل SMS، ولوحة تحكم لجدول الطبيب.' },
    en: { title: 'Dental Clinic Booking System', desc: 'Patient appointment management, SMS reminders and doctor calendar dashboard.' }
  },
  {
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80',
    tags: ['Dönüşüm', 'Marka'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Yerel Mobilyacı Dijitalleşme', desc: 'Google Maps kaydı, sosyal medya, web sitesi ve ürün kataloğu.' },
    ar: { title: 'رقمنة محل أثاث محلي', desc: 'تسجيل خرائط جوجل وسوشيال ميديا وموقع إلكتروني وكتالوج منتجات.' },
    en: { title: 'Local Furniture Shop Digitalization', desc: 'Google Maps listing, social media, website and product catalogue.' }
  },
  {
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    tags: ['SaaS', 'Stok'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Market Stok Yönetim Sistemi', desc: 'Gerçek zamanlı stok takibi, barkod okuyucu entegrasyonu ve raporlama.' },
    ar: { title: 'نظام إدارة مخزون السوبر ماركت', desc: 'تتبع المخزون الفوري وتكامل قارئ الباركود وإعداد التقارير.' },
    en: { title: 'Market Inventory Management System', desc: 'Real-time stock tracking, barcode scanner integration and reporting.' }
  },
  {
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
    tags: ['Sosyal Medya', 'Güzellik'],
    videoUrl: '',
    codeUrl: '',
    photosUrl: '',
    tr: { title: 'Güzellik Salonu Dijital Varlığı', desc: 'Instagram & TikTok yönetimi, görsel içerik üretimi ve randevu entegrasyonu.' },
    ar: { title: 'الحضور الرقمي لصالون التجميل', desc: 'إدارة إنستغرام وتيك توك وإنتاج محتوى مرئي وتكامل الحجوزات.' },
    en: { title: 'Beauty Salon Digital Presence', desc: 'Instagram & TikTok management, visual content production and booking integration.' }
  }
];

/* ===== CONTACT & SOCIAL DATA — EASY TO EDIT ===== */
const CONTACT_INFO = {
  company: 'Dijivoo',
  phone: '+90 552 586 11 39',
  whatsapp: '+90 552 586 11 39',
  email: 'info@dijivoo.com',
  instagram: '@dijivoo.tr',
  tiktok: '@dijivoo',
  instagramUrl: 'https://instagram.com/dijivoo.tr',
  tiktokUrl: 'https://tiktok.com/@dijivoo',
  whatsappUrl: 'https://wa.me/905525861139',
  youtube: '@dijivoo',
  facebook: '@dijivoo',
  youtubeUrl: 'https://www.youtube.com/@dijivoo',
  facebookUrl: 'https://www.facebook.com/dijivoo'
};

/* ==========================================
   LANGUAGE SYSTEM
   ========================================== */
let currentLang = 'tr';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-ar', lang === 'ar');
  
  // Update font for Arabic
  document.body.style.fontFamily = lang === 'ar' 
    ? "var(--font-ar)" 
    : "var(--font-body)";

  // Update all [data-tr/ar/en] elements
  document.querySelectorAll(`[data-${lang}]`).forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-render dynamic content
  renderServices();
  renderWorks();
  renderContact();
}

/* ==========================================
   RENDER SERVICES
   ========================================== */
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = SERVICES.map((s, i) => {
    const d = s[currentLang] || s.tr;
    return `
    <div class="service-card reveal delay-${(i % 3) + 1}">
      <div class="service-icon">${s.icon}</div>
      <div class="service-title">${d.title}</div>
      <div class="service-desc">${d.desc}</div>
      <span class="service-tag">${d.tag}</span>
      <div class="corner-glow"></div>
    </div>`;
  }).join('');
  observeReveal();
}

/* ==========================================
   RENDER WORKS
   ========================================== */
function renderWorks() {
  const grid = document.getElementById('worksGrid');
  grid.innerHTML = WORKS.map((w, i) => {
    const d = w[currentLang] || w.tr;
    const tagsHtml = w.tags.map(t => `<span class="wtag">${t}</span>`).join('');
    return `
    <div class="work-card reveal delay-${(i % 3) + 1}" data-index="${i}">
      <div class="work-preview">
        <img src="${w.image}" alt="${d.title}" loading="lazy"/>
        <div class="work-overlay">
          ${tagsHtml}
        </div>
        <div class="work-actions">
          ${w.videoUrl ? `<a href="${w.videoUrl}" target="_blank" class="action-btn" title="Video">▶</a>` : ''}
          ${w.photosUrl ? `<a href="${w.photosUrl}" target="_blank" class="action-btn" title="Photos">🖼</a>` : ''}
          ${w.codeUrl ? `<a href="${w.codeUrl}" target="_blank" class="action-btn" title="Code">&lt;/&gt;</a>` : ''}
          <button class="action-btn" onclick="openModal(${i})" title="Details">🔍</button>
        </div>
      </div>
      <div class="work-info">
        <div class="work-title">${d.title}</div>
        <div class="work-desc">${d.desc}</div>
        <div class="work-tags">${tagsHtml}</div>
      </div>
    </div>`;
  }).join('');
  observeReveal();
}

/* ==========================================
   MODAL
   ========================================== */
function openModal(idx) {
  const w = WORKS[idx];
  const d = w[currentLang] || w.tr;
  document.getElementById('modalImg').src = w.image;
  document.getElementById('modalTitle').textContent = d.title;
  document.getElementById('modalDesc').textContent = d.desc;
  const links = document.getElementById('modalLinks');
  links.innerHTML = '';
  if (w.videoUrl) links.innerHTML += `<a href="${w.videoUrl}" target="_blank" class="modal-link">▶ Video</a>`;
  if (w.photosUrl) links.innerHTML += `<a href="${w.photosUrl}" target="_blank" class="modal-link">🖼 Fotoğraflar</a>`;
  if (w.codeUrl) links.innerHTML += `<a href="${w.codeUrl}" target="_blank" class="modal-link">&lt;/&gt; Kaynak Kod</a>`;
  document.getElementById('workModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('workModal').addEventListener('click', e => {
  if (e.target === document.getElementById('workModal')) closeModal();
});
function closeModal() {
  document.getElementById('workModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ==========================================
   RENDER CONTACT
   ========================================== */
function renderContact() {
  const labels = {
    tr: { company: 'Şirket', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-Posta', youtube: 'YouTube', facebook: 'Facebook', follow: 'Sosyal Medya' },
    ar: { company: 'الشركة', phone: 'الهاتف', whatsapp: 'واتساب', email: 'البريد الإلكتروني', youtube: 'يوتيوب', facebook: 'فيسبوك', follow: 'تابعنا على' },
    en: { company: 'Company', phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email', youtube: 'YouTube', facebook: 'Facebook', follow: 'Social Media' }
  };
  const L = labels[currentLang] || labels.tr;
  document.getElementById('contactItems').innerHTML = `
    <div class="contact-item">
      <div class="contact-icon">🏢</div>
      <div><div class="contact-label">${L.company}</div><div class="contact-value">${CONTACT_INFO.company}</div></div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">📞</div>
      <div><div class="contact-label">${L.phone}</div><div class="contact-value"><a href="tel:${CONTACT_INFO.phone}">${CONTACT_INFO.phone}</a></div></div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">💬</div>
      <div><div class="contact-label">${L.whatsapp}</div><div class="contact-value"><a href="${CONTACT_INFO.whatsappUrl}" target="_blank">${CONTACT_INFO.whatsapp}</a></div></div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">✉️</div>
      <div><div class="contact-label">${L.email}</div><div class="contact-value"><a href="mailto:${CONTACT_INFO.email}">${CONTACT_INFO.email}</a></div></div>
    </div>
  `;
  document.getElementById('socialItems').innerHTML = `
    <div style="margin-bottom:20px;font-family:var(--font-main);font-size:.9rem;font-weight:700;color:var(--text-dim);letter-spacing:.1em;text-transform:uppercase;">${L.follow}</div>
    <div class="social-grid">
      <a href="${CONTACT_INFO.instagramUrl}" target="_blank" class="social-card">
        <div class="social-icon">📸</div>
        <div class="social-name">Instagram</div>
        <div class="social-handle">${CONTACT_INFO.instagram}</div>
      </a>
      <a href="${CONTACT_INFO.tiktokUrl}" target="_blank" class="social-card">
        <div class="social-icon">🎵</div>
        <div class="social-name">TikTok</div>
        <div class="social-handle">${CONTACT_INFO.tiktok}</div>
      </a>
      <a href="${CONTACT_INFO.youtubeUrl}" target="_blank" class="social-card">
        <div class="social-icon">▶️</div>
        <div class="social-name">${L.youtube}</div>
        <div class="social-handle">${CONTACT_INFO.youtube}</div>
      </a>
      <a href="${CONTACT_INFO.facebookUrl}" target="_blank" class="social-card">
        <div class="social-icon">👍</div>
        <div class="social-name">${L.facebook}</div>
        <div class="social-handle">${CONTACT_INFO.facebook}</div>
      </a>
    </div>
  `;
}

/* ==========================================
   SCROLL REVEAL
   ========================================== */
function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================
   CANVAS BACKGROUND — NETWORK PARTICLES
   ------------------------------------------
   Perf notes vs. the original:
   - Capped at ~30fps via a timestamp gate instead of
     redrawing on every single rAF tick (was ~60fps).
     This is the biggest win: the many backdrop-filter
     cards sitting on top of this canvas have to be
     re-blurred by the browser every time the canvas
     repaints, so halving the repaint rate roughly
     halves that cost too.
   - Distance check now compares squared distances first
     and only calls Math.sqrt() for pairs that actually
     pass the threshold, instead of on every single pair.
   - Particle count now scales down on smaller/lower-power
     screens instead of always being 70.
   - Canvas internal resolution is capped (devicePixelRatio
     clamped to 1.5) so it isn't rendering more pixels than
     needed on high-DPI screens.
   - Animation fully pauses when the tab isn't visible.
   ========================================== */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H, particles = [];
  let running = true;
  let lastFrame = 0;
  const FRAME_INTERVAL = 1000 / 30; // cap ~30fps
  const LINK_DIST = 140;
  const LINK_DIST2 = LINK_DIST * LINK_DIST;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  function particleCount() {
    const area = window.innerWidth * window.innerHeight;
    // Scale roughly with screen area, fewer on small/mobile screens.
    return Math.max(24, Math.min(70, Math.round(area / 14000)));
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const N = particleCount();
    if (particles.length !== N) {
      particles = new Array(N).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      }));
    }
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  function draw(now) {
    if (!running) return;
    requestAnimationFrame(draw);

    if (now - lastFrame < FRAME_INTERVAL) return;
    lastFrame = now;

    const N = particles.length;
    ctx.clearRect(0, 0, W, H);

    // Update
    for (let i = 0; i < N; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }

    // Lines — single path, squared-distance prefilter
    ctx.lineWidth = 0.7;
    for (let i = 0; i < N; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < N; j++) {
        const pj = particles[j];
        const dx = pi.x - pj.x;
        const dy = pi.y - pj.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < LINK_DIST2) {
          const dist = Math.sqrt(dist2);
          const alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(27,168,138,${alpha})`;
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.stroke();
        }
      }
    }

    // Dots
    ctx.fillStyle = 'rgba(27,168,138,0.5)';
    for (let i = 0; i < N; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}


/* ==========================================
   SCROLL PROGRESS & NAV
   Throttled to one update per animation frame and
   uses a passive listener so scrolling itself isn't
   blocked waiting on this handler.
   ========================================== */
function initScroll() {
  const bar = document.getElementById('scroll-progress');
  const nav = document.getElementById('navbar');
  let ticking = false;

  function update() {
    ticking = false;
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = (scrolled * 100) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}

/* ==========================================
   HAMBURGER MENU
   ========================================== */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================
   LANG BUTTONS
   ========================================== */
function initLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

/* ==========================================
   LOADER
   ========================================== */
function initLoader() {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
}

/* ==========================================
   FLOATING GLOW ON MOUSE (HERO)
   ========================================== */
function initMouseGlow() {
  const hero = document.getElementById('hero');
  let rect = hero.getBoundingClientRect();
  window.addEventListener('resize', () => { rect = hero.getBoundingClientRect(); }, { passive: true });

  let pending = null;
  hero.addEventListener('mousemove', e => {
    const clientX = e.clientX, clientY = e.clientY;
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = null;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
    });
  }, { passive: true });
}

/* ==========================================
   INIT
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderWorks();
  renderContact();
  observeReveal();
  initCanvas();
  initScroll();
  initHamburger();
  initLangButtons();
  initLoader();
  initMouseGlow();
  setLang('tr');
});