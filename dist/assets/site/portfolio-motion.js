(() => {
  const heading = document.querySelector('.portfolio-page-heading');
  const toolbar = document.querySelector('.work-toolbar');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !window.IntersectionObserver || !heading.animate) return;

  const rise = [{ opacity:0, translate:'0 36px' }, { opacity:1, translate:'0 0' }];
  const easing = 'cubic-bezier(.25,.7,.25,1)';
  const animations = [];
  function animate(element, frames, delay, duration) {
    const animation = element.animate(frames, { delay, duration, easing, fill:'backwards' });
    animations.push(animation);
    return animation;
  }

  const title = heading.querySelector('h1');
  const words = [];
  for (const node of [...title.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(text => {
      if (/^\s+$/.test(text)) return text;
      const word = document.createElement('span');
      word.className = 'portfolio-word';
      word.textContent = text;
      words.push(word);
      return word;
    }));
  }

  CSS.registerProperty?.({
    name:'--portfolio-line-progress', syntax:'<number>', initialValue:'1', inherits:true
  });
  const draw = [{ '--portfolio-line-progress':'0' }, { '--portfolio-line-progress':'1' }];
  animate(heading.querySelector('.section-label'), rise, 0, 520);
  animate(heading.querySelector(':scope > p'), rise, 0, 520);
  words.forEach((word, index) => animate(word, rise, 520 + index * 90, 400));
  const lineStart = 520 + (words.length - 1) * 90 + 400;
  const intro = [animate(toolbar, draw, lineStart, 520)];
  toolbar.querySelectorAll('button, .work-result').forEach((element, index) => {
    intro.push(animate(element, rise, lineStart + 520 + index * 100, 420));
  });
  toolbar.addEventListener('focusin', event => { if (event.target.matches(':focus-visible')) intro.forEach(animation => animation.cancel()); });

  motion.addEventListener('change', () => {
    animations.forEach(animation => animation.cancel());
  }, { once:true });
})();
