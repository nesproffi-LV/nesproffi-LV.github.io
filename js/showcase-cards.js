/**
 * Витринные карточки: авто-переключение картинок при скролле
 */
(function() {
  'use strict';

  function initShowcaseCards() {
    var cards = document.querySelectorAll('.showcase-card');
    if (!cards.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var card = entry.target;
        var images = card.querySelectorAll('.showcase-card__img');
        var dots = card.querySelectorAll('.showcase-card__img-dots .dot');
        if (!images.length) return;

        var currentIndex = 0;
        var intervalId = parseInt(card.dataset.intervalId) || 0;

        if (entry.isIntersecting && !intervalId) {
          intervalId = setInterval(function() {
            images[currentIndex].classList.remove('active');
            if (dots.length) dots[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
            if (dots.length) dots[currentIndex].classList.add('active');
          }, 3000);
          card.dataset.intervalId = intervalId;
        } else if (!entry.isIntersecting && intervalId) {
          clearInterval(intervalId);
          card.dataset.intervalId = '';
        }
      });
    }, { threshold: 0.3 });

    cards.forEach(function(card) { observer.observe(card); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowcaseCards);
  } else {
    initShowcaseCards();
  }
})();
