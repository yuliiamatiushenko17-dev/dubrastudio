(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const items = [...document.querySelectorAll('.work-item')];
  const list = document.querySelector('.work-list');
  const result = document.querySelector('.work-result');
  function applyFilter(type, updateUrl) {
    if (!filters.some(button => button.dataset.filter === type)) type = 'all';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
    let count = 0;
    items.forEach(item => {
      const show = type === 'all' || item.dataset.type === type;
      item.hidden = !show;
      if (show) count++;
    });
    list.classList.toggle('is-filtered', type !== 'all');
    const visible = items.filter(item => !item.hidden);
    const rows = [];
    for (let index = 0; index < visible.length; index += 2) {
      const row = document.createElement('div');
      row.className = 'work-row';
      row.append(...visible.slice(index, index + 2));
      rows.push(row);
    }
    list.replaceChildren(...rows, ...items.filter(item => item.hidden));
    list.classList.add('has-work-rows');

    const label = document.documentElement.lang === 'cs'
      ? (count >= 1 && count <= 4 ? 'realizace' : 'realizací')
      : count === 1 ? 'project' : 'projects';
    result.textContent = `${count} ${label}`;
    if (updateUrl) {
      const url = new URL(location.href);
      if (type === 'all') url.searchParams.delete('type');
      else url.searchParams.set('type', type);
      try { history.replaceState(null, '', url); } catch (_) { /* File preview still filters normally. */ }
    }
  }
  if (list) {
    filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter, true)));
    applyFilter(new URLSearchParams(location.search).get('type') || 'all', false);
    addEventListener('popstate', () => applyFilter(new URLSearchParams(location.search).get('type') || 'all', false));
  }
  const open = document.querySelector('.project-photo-open');
  const dialog = document.querySelector('.project-lightbox');
  if (open && dialog) {
    open.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }
})();

(() => {
 document.querySelectorAll('.project-comparison').forEach(compare => {
  const range=compare.querySelector('.comparison-range');
  function update(){
   const value=Math.max(0,Math.min(100,Number(range.value)));
   compare.style.setProperty('--reveal',value+'%');
   range.setAttribute('aria-valuetext',Math.round(value)+'% furnished room');
  }
  range.addEventListener('input',update);
  range.addEventListener('change',update);
  update();
 });
})();

(() => {
 document.querySelectorAll('.project-comparison').forEach(compare => {
  const range = compare.querySelector('.comparison-range');
  if (!range) return;
  range.addEventListener('pointermove', event => {
   const box = compare.getBoundingClientRect();
   const handleX = box.left + box.width * Number(range.value) / 100;
   const handleY = box.top + box.height / 2;
   compare.classList.toggle('is-handle-hovered', Math.hypot(event.clientX - handleX, event.clientY - handleY) <= 24);
  });
  range.addEventListener('pointerleave', () => compare.classList.remove('is-handle-hovered'));
 });
})();
(() => {
  const story = document.querySelector('.project-story');
  if (!story) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !window.IntersectionObserver || !story.animate) return;

  const caption = document.querySelector('.comparison-caption');
  if (caption) {
    const message = caption.textContent.trim();
    const track = document.createElement('span');
    track.className = 'comparison-caption-track';
    const original = document.createElement('span');
    original.textContent = message;
    track.append(original);
    caption.replaceChildren(track);
    caption.classList.add('is-moving');

    let animation;
    function updateCaption() {
      animation?.cancel();
      const width = original.getBoundingClientRect().width;
      const copies = Math.ceil(caption.clientWidth / width);
      while (track.childElementCount > 1) track.lastElementChild.remove();
      for (let index = 0; index < copies; index++) {
        const copy = original.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.append(copy);
      }
      animation = track.animate([
        { transform:'translateX(0)' },
        { transform:`translateX(-${width}px)` }
      ], { duration:width / .043, iterations:Infinity });
    }
    const captionObserver = new ResizeObserver(updateCaption);
    captionObserver.observe(caption);
    captionObserver.observe(original);
    motion.addEventListener('change', () => {
      captionObserver.disconnect();
      animation?.cancel();
      caption.textContent = message;
      caption.classList.remove('is-moving');
    }, { once:true });
  }

  const animations = [];
  const rise = [{ opacity:0, translate:'0 28px' }, { opacity:1, translate:'0 0' }];
  function queue(element, frames, delay, duration) {
    const animation = element.animate(frames, {
      delay, duration, easing:'cubic-bezier(.25,.7,.25,1)', fill:'backwards'
    });
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
  }
  queue(story.querySelector('.section-label'), rise, 0, 520);
  story.querySelectorAll('.project-story-copy > p').forEach(paragraph => queue(paragraph, rise, 0, 520));
  const title = story.querySelector('h2');
  const words = title.textContent.trim().split(/\s+/);
  title.replaceChildren(...words.flatMap((text, index) => {
    const word = document.createElement('span');
    word.className = 'approach-word';
    word.textContent = text;
    queue(word, rise, 520 + index * 80, 360);
    return index ? [' ', word] : [word];
  }));
  const factsStart = 520 + (words.length - 1) * 80 + 360;
  CSS.registerProperty?.({ name:'--fact-line', syntax:'<number>', initialValue:'1', inherits:true });
  story.querySelectorAll('.project-facts > div').forEach((row, index) => {
    const delay = factsStart + index * 710;
    [...row.children].forEach(element => queue(element, rise, delay, 390));
    queue(row, [{ '--fact-line':'0' }, { '--fact-line':'1' }], delay + 390, 320);
  });
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    animations.forEach(animation => animation.play());
  }, { threshold:.14 });
  observer.observe(story);
  motion.addEventListener('change', () => {
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
  }, { once:true });
})();
(() => {
  const project = document.querySelector('.project-title-row');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!project || motion.matches || !window.IntersectionObserver || !project.animate) return;

  const rise = [{ opacity:0, translate:'0 36px' }, { opacity:1, translate:'0 0' }];
  const animations = [];
  function queue(element, frames, delay, duration) {
    const animation = element.animate(frames, {
      delay, duration, easing:'cubic-bezier(.25,.7,.25,1)', fill:'backwards'
    });
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
    return animation;
  }
  function words(element, start) {
    const parts = element.textContent.trim().split(/(\s+)/);
    let index = 0;
    const group = [];
    element.replaceChildren(...parts.map(text => {
      if (/^\s+$/.test(text)) return text;
      const word = document.createElement('span');
      word.className = 'approach-word';
      word.textContent = text;
      group.push(queue(word, rise, start + index++ * 85, 400));
      return word;
    }));
    return group;
  }
  const groups = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      groups.get(entry.target).forEach(animation => animation.play());
    }
  }, { threshold:.12 });
  function onEntry(element, group) {
    groups.set(element, group);
    observer.observe(element);
  }

  onEntry(project, words(project.querySelector(':scope > p'), 0));
  document.querySelectorAll('.project-specification .spec-heading, .project-closeups .spec-heading').forEach(heading => {
    onEntry(heading, [
      queue(heading.querySelector('.section-label'), rise, 0, 520),
      queue(heading.querySelector(':scope > p'), rise, 0, 520),
      ...words(heading.querySelector('h2'), 520)
    ]);
  });
  document.querySelectorAll('.spec-board-row').forEach((row, index) => {
    row.parentElement.classList.add('has-animated-rows');
    const frame = document.createElement('span');
    frame.className = 'spec-row-frame';
    frame.setAttribute('aria-hidden', 'true');
    const rule = document.createElement('span');
    rule.className = 'spec-row-rule';
    rule.setAttribute('aria-hidden', 'true');
    const content = [...row.children];
    row.prepend(frame, rule);
    const start = Math.max(0, 1050 - index * 100) + index * 210;
    onEntry(row, [
      ...content.map(element => queue(element, rise, start, 500)),
      queue(rule, [{ scale:'0 1' }, { scale:'1 1' }], start + 390, 340),
      queue(frame, [{ clipPath:'inset(0 0 100% 0)' }, { clipPath:'inset(0)' }], start + 580, 480)
    ]);
  });
  motion.addEventListener('change', () => {
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
  }, { once:true });
})();
