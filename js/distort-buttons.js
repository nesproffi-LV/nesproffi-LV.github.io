/**
 * Эффект «ЛОПНУВШАЯ КРАСКА» — мощный, с видимым взрывом
 */
(function() {
  'use strict';

  var SELECTORS = '.hero-cta, .quiz-option, .atmosphere-cta, .side-menu__cta, .booking-modal__submit, .showcase-card__btn';

  function burst(el) {
    // Создаём свежий фильтр КАЖДЫЙ раз
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;');
    svg.innerHTML = '<filter id="b"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="0;30;0" dur="0.4s" fill="freeze"/></feDisplacementMap></filter>';
    document.body.appendChild(svg);

    el.style.filter = 'url(#b)';

    setTimeout(function() {
      el.style.filter = '';
      document.body.removeChild(svg);
    }, 450);
  }

  function bind() {
    document.querySelectorAll(SELECTORS).forEach(function(btn) {
      if (btn.dataset.burst) return;
      btn.dataset.burst = '1';
      btn.addEventListener('mousedown', function() { burst(this); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else { bind(); }

  if (window.MutationObserver) {
    new MutationObserver(bind).observe(document.body, {childList:true, subtree:true});
  }
})();
