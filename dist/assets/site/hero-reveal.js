(() => {
  const hero = document.querySelector('.hero');
  const layer = hero.querySelector('.hero-reveal');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pointer;

  function draw() {
    frame = 0;
    const bounds = hero.getBoundingClientRect();
    layer.style.setProperty('--reveal-x', (pointer.clientX - bounds.left) + 'px');
    layer.style.setProperty('--reveal-y', (pointer.clientY - bounds.top) + 'px');
    hero.classList.add('is-revealing');
  }

  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    pointer = event;
    if (!frame) frame = requestAnimationFrame(draw);
  });
  hero.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    hero.classList.remove('is-revealing');
  });
})();
