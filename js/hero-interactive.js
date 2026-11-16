/**
 * Ligne Vive — интерактив hero-секции
 * 1) Скролл-скраббинг видео (вверху — живой луп, при скролле — кадр по прогрессу)
 * 2) Параллакс видео за курсором
 * 3) Мягкий свет, следующий за курсором
 * 4) Появление секций при скролле (.reveal)
 * Уважает prefers-reduced-motion.
 */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  var video = document.getElementById('heroVideo');
  var hero = document.getElementById('heroVideoWrapper');

  // --- 1) Скролл-скраббинг ---
  if (video && hero && !reduced) {
    var ticking = false;
    function scrub() {
      ticking = false;
      if (window.heroOverpassActive) return; // GLSL-режим: видео живёт лупом
      var rect = hero.getBoundingClientRect();
      var h = hero.offsetHeight || window.innerHeight;
      var progress = Math.max(0, Math.min(1, -rect.top / h));
      if (progress <= 0.015) {
        // в самом верху — даём видео жить обычным лупом
        if (video.paused) { video.play().catch(function () {}); }
        return;
      }
      if (!video.paused) { video.pause(); }
      var dur = video.duration;
      if (isFinite(dur) && dur > 0) {
        video.currentTime = progress * dur;
      }
    }
    function requestScrub() {
      if (!ticking) { ticking = true; requestAnimationFrame(scrub); }
    }
    window.addEventListener('scroll', requestScrub, { passive: true });
    window.addEventListener('resize', requestScrub, { passive: true });
    if (video.readyState >= 1) { scrub(); }
    else { video.addEventListener('loadedmetadata', scrub); }
  }

  // --- 2) Параллакс видео за курсором ---
  if (video && hero && fine && !reduced) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      cx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      cy = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('mouseleave', function () { cx = 0; cy = 0; });
    function parallaxRaf() {
      if (window.heroOverpassActive) { requestAnimationFrame(parallaxRaf); return; }
      tx += (cx - tx) * 0.06;
      ty += (cy - ty) * 0.06;
      video.style.transform = 'translate(' + (-tx * 12) + 'px,' + (-ty * 12) + 'px) scale(1.06)';
      requestAnimationFrame(parallaxRaf);
    }
    requestAnimationFrame(parallaxRaf);
  }

  // --- 3) Свет за курсором ---
  var glow = document.getElementById('heroCursorGlow');
  if (glow && hero && fine && !reduced) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)';
    });
  }

  // --- 4) Появление секций при скролле ---
  var revealTargets = document.querySelectorAll(
    '.about-intro, .quiz-zone, .showcase-section, .blog-cards-section, .atmosphere-section'
  );
  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  // --- 5) Появление букв в заголовке «Личной истории» ---
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
