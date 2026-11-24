/**
 * Ligne Vive — hero: трёхслойное видео + кроссфейд по оси X
 * Слой 1 (низ): руки; Слой 2: конь; Слой 3: героиня.
 * Курсор: слева — конь, справа — героиня. Тач/reduced-motion — автопереключение 7с.
 * Плюс появление секций при скролле и «буквы» в заголовке «Личной истории».
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  // --- 1) Кроссфейд слоёв (конь ↔ героиня) ---
  var wrapper = document.getElementById('heroVideoWrapper');
  var horse = document.getElementById('heroVideoHorse');
  var heroine = document.getElementById('heroVideoHeroine');

  function setLayers(horseO, heroineO) {
    if (horse) horse.style.opacity = String(horseO);
    if (heroine) heroine.style.opacity = String(heroineO);
  }

  if (wrapper && horse && heroine) {
    if (fine && !reduced) {
      wrapper.addEventListener('mousemove', function (e) {
        var r = wrapper.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        // мёртвая зона: конь полностью исчезает к 65%, героиня проявляется с 35%
        var horseO = Math.max(0, Math.min(1, (0.65 - x) / 0.3));
        var heroineO = Math.max(0, Math.min(1, (x - 0.35) / 0.3));
        setLayers(horseO, heroineO);
      });
      wrapper.addEventListener('pointerleave', function () {
        setLayers(1, 0); // возврат к коню
      });
    } else {
      var showHorse = true;
      setInterval(function () {
        showHorse = !showHorse;
        setLayers(showHorse ? 1 : 0, showHorse ? 0 : 1);
      }, 7000);
    }
  }

  // --- 2) Появление секций при скролле ---
  var revealTargets = document.querySelectorAll(
    '.about-intro, .quiz-zone, .showcase-section, .blog-cards-section, .atmosphere-section'
  );
  if (revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      revealTargets.forEach(function (el) { io.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  // --- 3) Буквы в заголовке «Личной истории» ---
  var aboutTitle = document.querySelector('.about-intro__title');
  if (aboutTitle && !reduced) {
    var words = aboutTitle.textContent.trim().split(' ');
    aboutTitle.setAttribute('aria-label', aboutTitle.textContent.trim());
    var frag = document.createDocumentFragment();
    words.forEach(function (word, wi) {
      var wordSpan = document.createElement('span');
      wordSpan.className = 'split-word';
      wordSpan.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch, li) {
        var wrap = document.createElement('span');
        wrap.className = 'split-letter';
        wrap.style.transitionDelay = ((wi * 0.05) + (li * 0.012)) + 's';
        var inner = document.createElement('span');
        inner.textContent = ch;
        wrap.appendChild(inner);
        wordSpan.appendChild(wrap);
      });
      frag.appendChild(wordSpan);
      if (wi < words.length - 1) { frag.appendChild(document.createTextNode(' ')); }
    });
    aboutTitle.textContent = '';
    aboutTitle.appendChild(frag);
    var titleIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          aboutTitle.classList.add('is-revealed');
          titleIO.disconnect();
        }
      });
    }, { threshold: 0.4 });
    titleIO.observe(aboutTitle);
  }
})();

