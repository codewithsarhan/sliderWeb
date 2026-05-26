/* ══════════════════════════════════════════
   script.js — Slider + Toggle + Navbar Logic
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── ELEMENTS ─────────────────────────────
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const sliderTrack = document.getElementById('sliderTrack');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');
  const toggleBtns  = document.querySelectorAll('.toggle-btn');
  const navLinkItems = document.querySelectorAll('.nav-link');

  // ─── STATE ─────────────────────────────────
  let currentIndex  = 0;
  let visibleCards  = [];
  let cardWidth     = 0;
  let cardsPerView  = 3;
  let activeFilter  = 'all';

  // ─── NAVBAR: Scroll Effect ──────────────────
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ─── NAVBAR: Hamburger Menu ─────────────────
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // ─── NAVBAR: Active Link ────────────────────
  navLinkItems.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinkItems.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      // Close mobile menu on click
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ─── SLIDER: Setup ─────────────────────────
  function getCardsPerView() {
    const w = window.innerWidth;
    if (w < 600)  return 1;
    if (w < 900)  return 2;
    if (w < 1200) return 3;
    return 3;
  }

  function getVisibleCards() {
    const allCards = Array.from(sliderTrack.querySelectorAll('.card'));
    return allCards.filter(card => {
      if (activeFilter === 'all') return true;
      return card.dataset.category === activeFilter;
    });
  }

  function calcCardWidth() {
    const firstCard = sliderTrack.querySelector('.card:not(.hidden)');
    if (!firstCard) return 0;
    const gap = 28;
    return firstCard.offsetWidth + gap;
  }

  function updateDots() {
    dotsContainer.innerHTML = '';
    const total = visibleCards.length;
    const pages = Math.max(1, total - cardsPerView + 1);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateArrows() {
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  function applyTransform() {
    const offset = currentIndex * calcCardWidth();
    sliderTrack.style.transform = `translateX(-${offset}px)`;
  }

  function goTo(index) {
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    applyTransform();
    updateDots();
    updateArrows();
  }

  function filterCards(filter) {
    activeFilter = filter;
    currentIndex = 0;
    const allCards = Array.from(sliderTrack.querySelectorAll('.card'));

    allCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.display = '';
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    // Rebuild slider state
    setTimeout(() => {
      visibleCards = getVisibleCards();
      cardsPerView = getCardsPerView();
      sliderTrack.style.transform = 'translateX(0)';
      updateDots();
      updateArrows();
    }, 10);
  }

  function initSlider() {
    cardsPerView = getCardsPerView();
    visibleCards = getVisibleCards();
    currentIndex = 0;
    sliderTrack.style.transform = 'translateX(0)';
    updateDots();
    updateArrows();
  }

  // ─── SLIDER: Arrow Buttons ──────────────────
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // ─── SLIDER: Keyboard Navigation ───────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // ─── SLIDER: Touch/Swipe Support ───────────
  let touchStartX = 0;
  let touchEndX   = 0;

  sliderTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1);
      else          goTo(currentIndex - 1);
    }
  }, { passive: true });

  // ─── SLIDER: Mouse Drag Support ────────────
  let isDragging   = false;
  let startX       = 0;
  let dragDeltaX   = 0;

  sliderTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    sliderTrack.style.transition = 'none';
    sliderTrack.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDeltaX = e.clientX - startX;
    const baseOffset = currentIndex * calcCardWidth();
    sliderTrack.style.transform = `translateX(${-baseOffset + dragDeltaX}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    sliderTrack.style.transition = '';
    sliderTrack.style.cursor = '';
    if (dragDeltaX < -80)     goTo(currentIndex + 1);
    else if (dragDeltaX > 80) goTo(currentIndex - 1);
    else                       applyTransform();
    dragDeltaX = 0;
  });

  // ─── TOGGLE: Filter Logic ──────────────────
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Animate out cards, then filter
      sliderTrack.style.opacity = '0';
      sliderTrack.style.transform = 'translateX(-20px)';
      sliderTrack.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

      setTimeout(() => {
        filterCards(btn.dataset.filter);
        sliderTrack.style.opacity = '1';
        sliderTrack.style.transform = 'translateX(0)';
      }, 280);
    });
  });

  // ─── RESIZE: Recalculate on window resize ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initSlider();
    }, 200);
  });

  // ─── AUTO-PLAY (subtle, 5s interval) ───────
  let autoPlayTimer = setInterval(() => {
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    if (currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else {
      goTo(0);
    }
  }, 5000);

  // Pause autoplay on user interaction
  [prevBtn, nextBtn, sliderTrack].forEach(el => {
    el.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    el.addEventListener('touchstart', () => clearInterval(autoPlayTimer), { passive: true });
  });

  // ─── INIT ──────────────────────────────────
  initSlider();

  // Staggered card entrance animation
  const allCards = document.querySelectorAll('.card');
  allCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s, box-shadow 0.45s ease, border-color 0.45s ease`;
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 70);
  });

});