/**
 * Noko Landing Page - Client-side Interactivity
 * - Language toggle (FR/EN)
 * - Scroll animations (Intersection Observer)
 */

import { translations, type Lang } from '../i18n/translations';

// ============================================
// Language Toggle
// ============================================

type TranslationValue = string | string[] | { [key: string]: TranslationValue };

function getNestedValue(obj: TranslationValue, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    if (typeof current === 'string') return undefined;
    if (Array.isArray(current)) {
      const index = parseInt(key, 10);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else {
      current = current[key];
    }
  }

  return typeof current === 'string' ? current : undefined;
}

function setLanguage(lang: Lang): void {
  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Store preference
  localStorage.setItem('noko-lang', lang);

  // Update language toggle active state
  const langOptions = document.querySelectorAll('.lang-toggle__option');
  langOptions.forEach((option) => {
    const optionLang = option.getAttribute('data-lang');
    if (optionLang === lang) {
      option.classList.add('is-active');
    } else {
      option.classList.remove('is-active');
    }
  });

  // Update all translatable elements
  const elements = document.querySelectorAll('[data-i18n]');
  const t = translations[lang];

  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    const value = getNestedValue(t as TranslationValue, key);
    if (value) {
      // Handle line breaks in translations
      if (value.includes('\n')) {
        el.innerHTML = value.replace(/\n/g, '<br/>');
      } else {
        // Preserve HTML tags for certain keys
        if (key.includes('footer') || key.includes('comparison.footer') || key.includes('pricing.footer') || key === 'hero.title') {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    }
  });
}

function initLanguageToggle(): void {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const currentLang = document.documentElement.lang as Lang;
    const newLang: Lang = currentLang === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
  });
}

function initLanguage(): void {
  // Check saved preference
  const savedLang = localStorage.getItem('noko-lang') as Lang | null;

  if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
    setLanguage(savedLang);
    return;
  }

  // Check browser preference
  const browserLang = navigator.language.toLowerCase();
  const preferredLang: Lang = browserLang.startsWith('fr') ? 'fr' : 'en';

  // Default to French for Swiss users
  setLanguage(preferredLang);
}

// ============================================
// Scroll Animations
// ============================================

function initScrollAnimations(): void {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Make all elements visible immediately
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add delay based on data-animate-delay attribute
          const delay = entry.target.getAttribute('data-animate-delay');
          if (delay) {
            const delayMs = parseInt(delay, 10) * 100;
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, delayMs);
          } else {
            entry.target.classList.add('is-visible');
          }

          // Stop observing once animated
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// ============================================
// Testimonials Carousel
// ============================================

function initTestimonialsCarousel(): void {
  const carousel = document.querySelector('[data-testimonials-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]') as HTMLElement;
  const cards = carousel.querySelectorAll('[data-carousel-card]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');

  if (!track || cards.length === 0 || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let autoplayInterval: number | null = null;
  const totalSlides = cards.length;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateCarousel(): void {
    // Calculate offset to center the active card
    const containerWidth = carousel!.clientWidth;
    const card = cards[0] as HTMLElement;
    const cardWidth = card.offsetWidth;
    const gap = 32; // 2rem gap on desktop

    // Calculate the offset needed to center the active card
    const offset = (containerWidth - cardWidth) / 2 - currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(${offset}px)`;

    // Update active state
    cards.forEach((cardEl, index) => {
      if (index === currentIndex) {
        cardEl.classList.add('is-active');
      } else {
        cardEl.classList.remove('is-active');
      }
    });
  }

  function goToSlide(index: number): void {
    // Wrap around
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateCarousel();
  }

  function startAutoplay(): void {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayInterval = window.setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
  }

  function stopAutoplay(): void {
    if (autoplayInterval !== null) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // Event listeners
  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    goToSlide(currentIndex - 1);
    startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    goToSlide(currentIndex + 1);
    startAutoplay();
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Handle window resize
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(updateCarousel, 100);
  });

  // Initialize
  updateCarousel();
  startAutoplay();
}

// ============================================
// Initialize
// ============================================

function init(): void {
  initLanguage();
  initLanguageToggle();
  initScrollAnimations();
  initTestimonialsCarousel();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
