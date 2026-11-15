(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !window.IntersectionObserver || !Element.prototype.animate) return;

  const stripDuration = 1250;
  const stripDelay = 42;
  const animations = new Map();
  const pending = new Set();
  const frameSets = new Map();

  // Match the Hero's bottom-up strips and its cubic-bezier(.25, .7, .25, 1).
  function ease(progress) {
    if (progress === 0 || progress === 1) return progress;
    let low = 0;
    let high = 1;
    for (let step = 0; step < 14; step++) {
      const t = (low + high) / 2;
      const x = .75 * (1 - t) * t + t ** 3;
      if (x < progress) low = t;
      else high = t;
    }
    const t = (low + high) / 2;
    return 2.1 * (1 - t) ** 2 * t + 3 * (1 - t) * t ** 2 + t ** 3;
  }

  function stripFrames(columns) {
    if (frameSets.has(columns)) return frameSets.get(columns);
    const duration = stripDuration + (columns - 1) * stripDelay;
    const frames = Array.from({ length:97 }, (_, frame) => {
      const time = frame / 96 * duration;
      const edge = [];
      for (let column = 0; column < columns; column++) {
        const progress = Math.max(0, Math.min(1, (time - column * stripDelay) / stripDuration));
        const top = 100 * (1 - ease(progress));
        edge.push(`${column / columns * 100}% ${top}%`, `${(column + 1) / columns * 100}% ${top}%`);
      }
      return { clipPath:`polygon(${edge.join(', ')}, 100% 100%, 0 100%)` };
    });
    const result = { frames, duration };
    frameSets.set(columns, result);
    return result;
  }

  let nextStart = 0;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top ||
        a.boundingClientRect.left - b.boundingClientRect.left)) {
      const target = entry.target;
      observer.unobserve(target);
      const { card, photo, detailWindow } = pendingTargets.get(target);
      photo.loading = 'eager';
      photo.decode().catch(() => {}).then(() => {
        if (!pending.delete(card)) return;
        const { frames, duration } = stripFrames(target.clientWidth > 700 ? 8 : 4);
        const now = performance.now();
        const delay = Math.max(0, nextStart - now);
        nextStart = now + delay + 150;
        const effects = [target.animate(frames, { duration, delay, fill:'backwards' })];
        if (detailWindow) {
          effects.push(card.querySelector('figcaption').animate([
            { opacity:0, translate:'0 22px' },
            { opacity:1, translate:'0 0' }
          ], { duration:520, delay:delay + 440, fill:'backwards', easing:'ease-out' }));
        }
        card.classList.remove('awaiting-project-photo');
        animations.set(card, effects);
        Promise.allSettled(effects.map(effect => effect.finished)).then(() => animations.delete(card));
      });
    }
  }, { rootMargin:'-80px 0px 0px 0px' });

  const pendingTargets = new Map();
  document.querySelectorAll('#projects .portfolio-card, .work-item, .detail-photo').forEach(card => {
    const photo = card.querySelector('img');
    if (!photo) return;
    const detailWindow = card.querySelector('.detail-photo-window');
    const target = detailWindow || photo;
    pending.add(card);
    pendingTargets.set(target, { card, photo, detailWindow });
    card.classList.add('awaiting-project-photo');
    observer.observe(target);
    card.addEventListener('focusin', () => {
      observer.unobserve(target);
      pending.delete(card);
      card.classList.remove('awaiting-project-photo');
      animations.get(card)?.forEach(animation => animation.cancel());
    }, { once:true });
  });
  motion.addEventListener('change', () => {
    observer.disconnect();
    pending.forEach(card => card.classList.remove('awaiting-project-photo'));
    pending.clear();
    animations.forEach(effects => effects.forEach(animation => animation.cancel()));
  }, { once:true });
})();
