(() => {
  const section = document.querySelector('#process');
  const slot = section?.querySelector('.process-video-slot');
  if (!slot) return;

  const video = slot.querySelector('video');
  const track = section.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('nav');
  let frame;
  let travel;
  let pinTop;

  function update() {
    frame = null;
    if (motion.matches) return;
    const bounds = section.getBoundingClientRect();
    const start = slot.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (pinTop - track.getBoundingClientRect().top) / travel));
    const mix = (from, to) => from + (to - from) * progress;
    Object.assign(video.style, {
      left:`${mix(start.left - bounds.left, 0)}px`,
      top:`${mix(start.top - bounds.top, 0)}px`,
      width:`${mix(start.width, bounds.width)}px`,
      height:`${mix(start.height, bounds.height)}px`,
      filter:`brightness(${1 - progress * .62})`,
    });
    section.classList.toggle('has-video-backdrop', progress >= .75);
    if (bounds.bottom > 0 && bounds.top < innerHeight) {
      if (video.paused) video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function schedule() {
    if (frame == null) frame = requestAnimationFrame(update);
  }

  function measure() {
    if (motion.matches) return;
    travel = Math.max(320, innerHeight * .72);
    pinTop = Math.min(header?.getBoundingClientRect().height ?? 0, innerHeight - section.offsetHeight);
    track.style.setProperty('--video-travel', `${travel}px`);
    section.style.setProperty('--process-pin-top', `${pinTop}px`);
    schedule();
  }

  function configure() {
    const enabled = !motion.matches;
    track.classList.toggle('is-video-enhanced', enabled);
    section.classList.toggle('is-video-enhanced', enabled);
    video.controls = !enabled;
    video.muted = enabled;
    video.loop = enabled;
    if (enabled) {
      section.prepend(video);
      measure();
    } else {
      video.pause();
      video.removeAttribute('style');
      section.classList.remove('has-video-backdrop');
      slot.append(video);
    }
  }

  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', measure);
  new ResizeObserver(measure).observe(section);
  motion.addEventListener('change', configure);
  configure();
})();
