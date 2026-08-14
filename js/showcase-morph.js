(function(){
  var cards = document.querySelectorAll('.showcase-card');
  if (!cards.length) return;
  cards.forEach(function(card) {
    var imgs = card.querySelectorAll('.showcase-card__img');
    var dots = card.querySelectorAll('.showcase-card__img-dots .dot');
    if (imgs.length < 2) return;
    var current = 0, timer;
    function setActive(idx) {
      imgs.forEach(function(img, i) { img.classList.toggle('active', i === idx); });
      dots.forEach(function(dot, i) { dot.classList.toggle('active', i === idx); });
      var src = imgs[idx].getAttribute('src');
      if (src) { card.style.setProperty('--blur-bg', 'url("' + src + '")'); }
      card.classList.add('blur-active');
    }
    setActive(0);
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        timer = setInterval(function() { current = (current + 1) % imgs.length; setActive(current); }, 2500);
      } else { clearInterval(timer); }
    }, { threshold: 0.3 });
    observer.observe(card);
  });
})();
