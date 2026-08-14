/**
 * SPLATTER — терракотовые брызги при клике
 * Кнопки: #heroCta, .hero-cta, .side-menu__cta, .course-drawer__cta, .quiz-option, .atmosphere-cta
 * НЕ применяется на .showcase-card__btn — только hover
 */
(function() {
  'use strict';
  var COLOR = '#E8783F';
  var GLOW  = '0 0 18px #E8783F, 0 0 40px rgba(232,120,63,0.5)';
  var SELECTORS = '#heroCta, .hero-cta, .side-menu__cta, .course-drawer__cta, .quiz-option, .atmosphere-cta';

  function drop(fromX, fromY, toX, toY, size, duration) {
    var d = document.createElement('span');
    d.style.cssText =
      'position:fixed;pointer-events:none;z-index:99999;border-radius:50%;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + fromX + 'px;top:' + fromY + 'px;' +
      'background:' + COLOR + ';opacity:0.9;' +
      'box-shadow:' + GLOW + ';';
    document.body.appendChild(d);

    requestAnimationFrame(function() {
      d.style.transition = 'all ' + duration + 's cubic-bezier(0.1, 0.85, 0.15, 1)';
      d.style.left = toX + 'px';
      d.style.top = toY + 'px';
      d.style.opacity = '0';
      d.style.transform = 'scale(0.2)';
    });
    setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, duration * 1000 + 300, d);
  }

  function splatter(el) {
    var r = el.getBoundingClientRect();
    drop(r.left, r.top, r.left - 80, r.top - 60, 24, 2.2);
    drop(r.right, r.bottom, r.right + 80, r.bottom + 60, 24, 2.2);
    var offsets = [[-2, -2], [6, -4], [-4, 6]];
    offsets.forEach(function(o) {
      drop(r.left + o[0], r.top + o[1], r.left - 70 + Math.random()*20, r.top - 50 + Math.random()*20, 7 + Math.random()*5, 1.8 + Math.random()*0.5);
      drop(r.right + o[0], r.bottom + o[1], r.right + 70 + Math.random()*20, r.bottom + 50 + Math.random()*20, 7 + Math.random()*5, 1.8 + Math.random()*0.5);
    });
  }

  function bind() {
    document.querySelectorAll(SELECTORS).forEach(function(btn) {
      if (btn.dataset.splatter) return;
      btn.dataset.splatter = '1';
      btn.addEventListener('mousedown', function() { splatter(this); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else { bind(); }

  if (window.MutationObserver) {
    new MutationObserver(bind).observe(document.body, {childList:true, subtree:true});
  }
})();
