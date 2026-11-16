/**
 * Ligne Vive — hero-crossfade (каркас)
 * Пока ролик один — ничего не делает.
 * Чтобы включить кроссфейд, добавьте пути роликов в window.HERO_CLIPS
 * (2+ бесшовных клипа в одном стиле). Ролики плавно растворяются друг в друге.
 * ВАЖНО: кроссфейд (живой цикл) и скролл-скраббинг (рисунок по скроллу) — разные
 * режимы. При включении кроссфейда отключите скраббинг в hero-interactive.js.
 */
(function () {
  'use strict';
  var CLIPS = window.HERO_CLIPS || ['/videos/hero-bg.mp4'];
  if (!CLIPS || CLIPS.length < 2) return;

  var wrapper = document.getElementById('heroVideoWrapper');
  var first = document.getElementById('heroVideo');
  if (!wrapper || !first) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var layers = [first];

  first.style.transition = 'opacity 1.2s ease';
  first.style.opacity = '1';

  for (var i = 1; i < CLIPS.length; i++) {
    var v = document.createElement('video');
    v.className = 'hero-video';
    v.autoplay = true;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = CLIPS[i];
    v.style.zIndex = String(i);
    v.style.opacity = '0';
    v.style.transition = 'opacity 1.2s ease';
    wrapper.insertBefore(v, first.nextSibling);
    layers.push(v);
  }

  var active = 0;
  var INTERVAL = reduced ? 0 : 6000;

  function crossfade() {
    var next = (active + 1) % layers.length;
    layers[active].style.opacity = '0';
    layers[next].style.opacity = '1';
    active = next;
  }

  if (INTERVAL > 0) setInterval(crossfade, INTERVAL);
})();
