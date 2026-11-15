(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
  const easing = 'cubic-bezier(.25,.7,.25,1)';
  function queue(element, frames, delay, duration, group) {
    const animation = element.animate(frames, { delay, duration, easing, fill:'backwards' });
    animation.pause();
    animation.currentTime = 0;
    group.push(animation);
  }

  // Reveal vertical strips from the bottom while keeping the image in place.
  function stripFrames(columns, stagger = .035) {
    return Array.from({ length:37 }, (_, frame) => {
      const time = frame / 36;
      const edge = [];
      for (let column = 0; column < columns; column++) {
        const progress = Math.max(0, Math.min(1, (time - column * stagger) / (1 - (columns - 1) * stagger)));
        const height = 100 * (1 - (1 - progress) ** 2);
        edge.push(`${column / columns * 100}% ${100 - height}%`,
                  `${(column + 1) / columns * 100}% ${100 - height}%`);
      }
      return { clipPath:`polygon(${edge.join(', ')}, 100% 100%, 0 100%)` };
    });
  }

  function playOnVisible(trigger, group, focusScope, options, onStart) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      onStart?.();
      group.forEach(animation => animation.play());
    }, options);
    function showImmediately() {
      observer.disconnect();
      group.forEach(animation => animation.cancel());
    }
    focusScope.addEventListener('focusin', showImmediately, { once:true });
    motion.addEventListener('change', showImmediately, { once:true });
    observer.observe(trigger);
  }


  function revealWords(heading, delay, group, rise) {
    let index = 0;
    for (const node of [...heading.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(text => {
        if (!text.trim()) return text;
        const word = document.createElement('span');
        word.className = 'inner-cta-word';
        word.textContent = text;
        queue(word, rise, delay + index++ * 100, 480, group);
        return word;
      }));
    }
    return delay + Math.max(0, index - 1) * 100 + 480;
  }

  const servicesIntro = document.querySelector('.services-page .portfolio-page-heading');
  if (servicesIntro) {
    const rise = [{ opacity:0, translate:'0 38px' }, { opacity:1, translate:'0 0' }];
    const draw = [{ backgroundSize:'0% 1px' }, { backgroundSize:'100% 1px' }];
    const filters = document.querySelector('.services-page .page-jump');
    const filterRule = document.querySelector('.services-filter-rule');
    const group = [];
    queue(servicesIntro.querySelector('.section-label'), rise, 0, 580, group);
    queue(servicesIntro.querySelector('p'), rise, 0, 580, group);
    const headingEnd = revealWords(servicesIntro.querySelector('h1'), 580, group, rise);
    queue(filterRule, draw, headingEnd, 480, group);
    [...filters.children].forEach((link, index) => {
      queue(link, rise, headingEnd + 480 + index * 105, 480, group);
    });
    playOnVisible(servicesIntro, group, document.querySelector('main'), { threshold:.05 });

    for (const row of document.querySelectorAll('.service-row')) {
      const group = [];
      const photo = row.querySelector('img');
      const copy = row.lastElementChild;
      const [description, materials] = copy.querySelectorAll(':scope > p');
      const [includedLabel, materialsLabel] = copy.querySelectorAll('.mini-label');
      const link = copy.querySelector('.page-line-link');
      queue(photo, stripFrames(8), 0, 1120, group);
      queue(photo, [{ translate:'0 36px' }, { translate:'0 0' }], 0, 700, group);
      queue(copy.querySelector('.section-label'), rise, 0, 550, group);
      queue(description, rise, 0, 550, group);
      let next = revealWords(copy.querySelector('h2'), 550, group, rise);
      queue(includedLabel, rise, next, 360, group);
      next += 300;
      for (const item of copy.querySelectorAll('.included-list li')) {
        queue(item, rise, next, 360, group);
        queue(item, draw, next + 140, 360, group);
        next += 200;
      }
      queue(materialsLabel, rise, next + 300, 400, group);
      queue(materials, rise, next + 700, 440, group);
      const linkEnd = revealWords(link.querySelector('.service-link-label'), next + 1140, group, rise);
      queue(link.querySelector('.page-arrow'), rise, linkEnd - 180, 380, group);
      queue(link, draw, linkEnd + 200, 480, group);
      playOnVisible(row, group, row, { rootMargin:'-85px 0px 0px', threshold:.06 });
    }
  }

  const processIntro = document.querySelector('.process-page .portfolio-page-heading');
  if (processIntro) {
    const group = [];
    const rise = [{ opacity:0, translate:'0 42px' }, { opacity:1, translate:'0 0' }];
    queue(processIntro.querySelector('.section-label'), rise, 0, 600, group);
    queue(processIntro.querySelector('p'), rise, 0, 600, group);
    const heading = processIntro.querySelector('h1');
    let delay = 600;
    for (const node of [...heading.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(text => {
        if (!text.trim()) return text;
        const word = document.createElement('span');
        word.className = 'process-word';
        for (const character of text) {
          const letter = document.createElement('span');
          letter.textContent = character;
          queue(letter, [{ opacity:0 }, { opacity:1 }], delay, 170, group);
          delay += 34;
          word.append(letter);
        }
        return word;
      }));
    }
    playOnVisible(processIntro, group, processIntro, { threshold:.05 });

    const overview = document.querySelector('.process-intro');
    const overviewGroup = [];
    const videoLeadIn = 450;
    queue(overview.querySelector('.section-label'), rise, videoLeadIn, 600, overviewGroup);
    queue(overview.querySelector('p'), rise, videoLeadIn, 600, overviewGroup);
    revealWords(overview.querySelector('h2'), videoLeadIn + 600, overviewGroup, rise);
    playOnVisible(overview, overviewGroup, overview, { threshold:.18 });

    const stages = [...document.querySelectorAll('.process-stage')];
    for (const stage of stages) {
      const stageGroup = [];
      stage.classList.add('has-stage-motion');
      const number = stage.querySelector('.stage-number');
      const name = stage.querySelector('.stage-heading > div');
      const description = stage.lastElementChild;
      queue(number, [{ opacity:.35 }, { opacity:1 }], 0, 420, stageGroup);
      queue(name, rise, 70, 650, stageGroup);
      queue(description, rise, 140, 680, stageGroup);
      playOnVisible(stage, stageGroup, stage, { rootMargin:'-90px 0px -14% 0px', threshold:.12 });
    }

    function updateStageLines() {
      const guide = window.innerHeight * .78;
      for (const stage of stages) {
        const { top, height } = stage.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (guide - top) / height));
        stage.style.setProperty('--stage-progress', progress);
      }
    }
    let stageFrame;
    function scheduleStageLines() {
      if (stageFrame) return;
      stageFrame = requestAnimationFrame(() => {
        stageFrame = null;
        updateStageLines();
      });
    }
    updateStageLines();
    addEventListener('scroll', scheduleStageLines, { passive:true });
    addEventListener('resize', scheduleStageLines);
    document.addEventListener('toggle', scheduleStageLines, true);
  }

  const story = document.querySelector('#about-story');
  if (story) {
    const rise = [{ opacity:0, translate:'0 38px' }, { opacity:1, translate:'0 0' }];
    const viewport = { rootMargin:'-80px 0px 0px 0px', threshold:.12 };
    const intro = document.querySelector('.portfolio-page-heading');
    const introGroup = [];
    queue(intro.querySelector('.section-label'), rise, 0, 520, introGroup);
    queue(intro.querySelector('p'), rise, 0, 520, introGroup);
    revealWords(intro.querySelector('h1'), 520, introGroup, rise);
    playOnVisible(intro, introGroup, intro, viewport);

    const storyGroup = [];
    const photo = story.querySelector('.story-main-photo');
    const columns = photo.clientWidth > 700 ? 8 : 4;
    const photoDuration = 1250 + (columns - 1) * 42;
    queue(photo, stripFrames(columns, 42 / photoDuration), 0, photoDuration, storyGroup);
    queue(photo, [{ translate:'0 36px' }, { translate:'0 0' }], 0, 750, storyGroup);
    queue(story.querySelector('.section-label'), rise, 0, 520, storyGroup);
    let next = revealWords(story.querySelector('h2'), 520, storyGroup, rise);
    story.querySelectorAll('p').forEach(paragraph => {
      queue(paragraph, rise, next, 500, storyGroup);
      next += 500;
    });
    playOnVisible(story, storyGroup, story, viewport);

    const workshop = story.querySelector('.story-workshop-photo');
    const workshopFrame = workshop.parentElement;
    const workshopGroup = [];
    queue(workshop, stripFrames(8), 0, 1120, workshopGroup);
    queue(workshop, [{ translate:'0 36px' }, { translate:'0 0' }], 0, 700, workshopGroup);
    playOnVisible(workshopFrame, workshopGroup, story, viewport);

    const stats = document.querySelector('#about-numbers');
    const statsGroup = [];
    const counters = [...stats.querySelectorAll('strong')].map(element => {
      const label = element.textContent;
      return { element, label, total:parseInt(label, 10), suffix:label.endsWith('+') ? '+' : '' };
    });
    stats.classList.add('has-number-rules');
    for (let index = 0; index < 2; index++) {
      const rule = document.createElement('div');
      rule.className = 'about-number-rule';
      rule.setAttribute('aria-hidden', 'true');
      if (index === 0) stats.prepend(rule);
      else stats.append(rule);
      queue(rule, [{ transform:'scaleX(0)' }, { transform:'scaleX(1)' }], 170 + index * 190, 850, statsGroup);
    }
    playOnVisible(stats, statsGroup, stats, viewport, () => {
      const start = performance.now();
      function count(now) {
        const progress = Math.min(1, (now - start) / 1250);
        counters.forEach(({ element, label, total, suffix }) => {
          element.textContent = progress === 1 || motion.matches
            ? label : Math.round(total * (1 - (1 - progress) ** 3)) + suffix;
        });
        if (progress < 1 && !motion.matches) requestAnimationFrame(count);
      }
      requestAnimationFrame(count);
    });

    const team = document.querySelector('#about-team');
    const teamGroup = [];
    queue(team.querySelector('.section-label'), rise, 0, 520, teamGroup);
    queue(team.querySelector('.section-intro'), rise, 0, 520, teamGroup);
    const teamHeadingEnd = revealWords(team.querySelector('h2'), 520, teamGroup, rise);
    playOnVisible(team, teamGroup, team, viewport);

    function revealAfterHeading(trigger, group, section, headingGroup, headingEnd) {
      playOnVisible(trigger, group, section, { ...viewport, threshold:0 }, () => {
        const elapsed = headingGroup[0].currentTime ?? headingEnd;
        const remaining = Math.max(0, headingEnd - elapsed);
        group.forEach(animation => {
          animation.effect.updateTiming({ delay:animation.effect.getTiming().delay + remaining });
        });
      });
    }

    const portraits = [...team.querySelectorAll('.team-grid > article')].map(card => {
      const portrait = card.querySelector('img');
      const group = [];
      queue(card, [{ opacity:0, translate:'0 70px' }, { opacity:1, translate:'0 0' }], 0, 800, group);
      queue(portrait, stripFrames(8, 56 / 1500), 0, 1500, group);
      return { frame:portrait.parentElement, group };
    });
    let nextPortrait = 0;
    let nextStart = 0;
    const portraitObserver = new IntersectionObserver(entries => {
      const lastVisible = Math.max(-1, ...entries.filter(entry => entry.isIntersecting)
        .map(entry => portraits.findIndex(({frame}) => frame === entry.target)));
      const now = performance.now();
      const headingRemaining = Math.max(0, teamHeadingEnd - (teamGroup[0].currentTime ?? teamHeadingEnd));
      nextStart = Math.max(now + headingRemaining, nextStart);
      while (nextPortrait <= lastVisible) {
        const { frame, group } = portraits[nextPortrait++];
        portraitObserver.unobserve(frame);
        for (const animation of group) {
          animation.effect.updateTiming({ delay:nextStart - now });
          animation.play();
        }
        nextStart += 460;
      }
    }, { ...viewport, threshold:.12 });
    portraits.forEach(({frame}) => portraitObserver.observe(frame));
    function showPortraitsImmediately() {
      portraitObserver.disconnect();
      portraits.forEach(({group}) => group.forEach(animation => animation.cancel()));
    }
    team.addEventListener('focusin', showPortraitsImmediately, { once:true });
    motion.addEventListener('change', showPortraitsImmediately, { once:true });
    const values = document.querySelector('#about-values');
    const valuesGroup = [];
    queue(values.querySelector('.section-label'), rise, 0, 520, valuesGroup);
    const valuesHeadingEnd = revealWords(values.querySelector('h2'), 520, valuesGroup, rise);
    playOnVisible(values, valuesGroup, values, viewport);

    const valuesGrid = values.querySelector('.values-grid');
    valuesGrid.classList.add('has-animated-rules');
    const cardsPerRow = matchMedia('(max-width:600px)').matches ? 1 : 2;
    const valueCards = [...valuesGrid.children];
    for (let index = 0; index < valueCards.length; index += cardsPerRow) {
      const group = [];
      const rowDelay = index / cardsPerRow * 560;
      const row = valueCards.slice(index, index + cardsPerRow);
      row.forEach(card => {
        const rule = document.createElement('div');
        rule.className = 'about-value-rule';
        rule.setAttribute('aria-hidden', 'true');
        card.prepend(rule);
        queue(card, rise, rowDelay, 500, group);
        queue(rule, [{ transform:'scaleX(0)' }, { transform:'scaleX(1)' }], rowDelay + 180, 550, group);
      });
      revealAfterHeading(row[0], group, values, valuesGroup, valuesHeadingEnd);
    }
  }
  const contactHeading = document.querySelector('.contact-heading');
  if (contactHeading) {
    const rise = [{ opacity:0, translate:'0 28px' }, { opacity:1, translate:'0 0' }];
    const heading = contactHeading.querySelector('h1');
    const words = [];
    for (const node of [...heading.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).map(part => {
        if (!part.trim()) return document.createTextNode(part);
        const word = document.createElement('span');
        word.textContent = part;
        words.push(word);
        return word;
      }));
    }

    const formBand = document.querySelector('.contact-form-band');
    const intro = [];
    queue(contactHeading.querySelector('.section-label'), rise, 0, 450, intro);
    queue(contactHeading.querySelector('p'), rise, 0, 450, intro);
    words.forEach((word, index) => queue(word, rise, 450 + index * 95, 400, intro));
    queue(formBand, rise, 850 + (words.length - 1) * 95, 520, intro);

    const formCopy = formBand.querySelector('.contact-form-intro');
    const formCopyGroup = [];
    let wordIndex = 0;
    for (const node of [...formCopy.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(text => {
        if (!text.trim()) return text;
        const word = document.createElement('span');
        word.className = 'inner-cta-word';
        word.textContent = text;
        queue(word, rise, wordIndex++ * 75, 420, formCopyGroup);
        return word;
      }));
    }
    playOnVisible(formCopy, formCopyGroup, formBand, { threshold:.2 });
    playOnVisible(contactHeading, intro, document.querySelector('#main-content'), { threshold:.1 });

    const contactPanel = document.querySelector('.contact-panel');
    const details = [];
    contactPanel.querySelectorAll('.contact-details > div').forEach((item, index) => {
      queue(item, rise, index * 220, 480, details);
    });
    playOnVisible(contactPanel, details, contactPanel, { threshold:.12 });
  }

  const footer = document.querySelector('footer');
  if (!footer.parentElement.classList.contains('footer-reveal-region')) {
    const region = document.createElement('div');
    region.className = 'footer-reveal-region';
    footer.before(region);
    region.append(footer);
  }
  const footerEntrance = [];
  const footerHeadings = [];
  queue(footer, stripFrames(8), 0, 1200, footerEntrance);
  playOnVisible(footer.parentElement, footerEntrance, footer, { threshold:.06 });

  const footerLabels = footer.querySelectorAll('.footer-brand > span, .footer-col-title');
  footerLabels.forEach((label, index) => {
    const swap = document.createElement('span');
    swap.className = 'footer-heading-swap';
    const title = document.createElement('span');
    title.append(...label.childNodes);
    const plus = document.createElement('span');
    plus.className = 'footer-heading-plus';
    plus.setAttribute('aria-hidden', 'true');
    plus.textContent = '+';
    swap.append(title, plus);
    label.append(swap);

    const delay = 420 + index * 115;
    queue(title, [
      { opacity:0, translate:'0 28px' },
      { opacity:1, translate:'0 0' }
    ], delay, 590, footerHeadings);
    queue(plus, [
      { opacity:1 },
      { opacity:0 }
    ], delay, 210, footerHeadings);
  });
  playOnVisible(footer.querySelector('.footer-bottom'), footerHeadings, footer, { threshold:.6 });


  function queueClosingLine(cta, delay, group) {
    const line = document.createElement('span');
    line.className = 'inner-cta-motion-line';
    line.setAttribute('aria-hidden', 'true');
    cta.prepend(line);
    cta.classList.add('has-motion-line');
    queue(line, [
      { clipPath:'inset(0 100% 2px 0)' },
      { clipPath:'inset(0 0 2px 0)', offset:.78 },
      { clipPath:'inset(0)' }
    ], delay, 800, group);
  }

  const homeClosing = document.querySelector('.cta-banner');
  if (homeClosing) {
    const lineGroup = [];
    const wordCount = homeClosing.querySelector('.cta-accent').textContent.trim().split(/\s+/).length;
    queueClosingLine(homeClosing, 500 + (wordCount - 1) * 105 + 420 + 1300, lineGroup);
    playOnVisible(homeClosing, lineGroup, homeClosing, { threshold:.2 });
  }
  document.querySelectorAll('.inner-cta').forEach(cta => {
    const group = [];
    const label = cta.querySelector('.section-label');
    const title = cta.querySelector('h2');
    const button = cta.querySelector('.btn-pill-primary');
    if (!title) return;
    const rise = [{ opacity:0, translate:'0 44px' }, { opacity:1, translate:'0 0' }];
    if (label) queue(label, rise, 0, 500, group);
    const words = [];
    for (const node of [...title.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      node.replaceWith(...node.textContent.split(/(\s+)/).filter(Boolean).map(text => {
        if (/^\s+$/.test(text)) return text;
        const word = document.createElement('span');
        word.className = 'inner-cta-word';
        word.textContent = text;
        words.push(word);
        return word;
      }));
    }
    words.forEach((word, index) => queue(word, rise, 500 + index * 105, 420, group));
    const buttonStart = 500 + Math.max(0, words.length - 1) * 105 + 420;
    const closingCopy = cta.querySelector(':scope.contact-closing > p');
    if (closingCopy) {
      queue(closingCopy, [
        { opacity:0, translate:'0 90px' },
        { opacity:1, translate:'0 0' }
      ], buttonStart, 650, group);
      queueClosingLine(cta, buttonStart + 650, group);
      playOnVisible(cta, group, cta, { threshold:.2 });
      return;
    }
    if (!button) return;
    queue(button, [
      { opacity:0, translate:'0 110px', scale:'.16' },
      { opacity:1, translate:'0 20px', scale:'.45', offset:.42 },
      { opacity:1, translate:'0 -38px', scale:'1.03', offset:.67 },
      { opacity:1, translate:'0 0', scale:'1' }
    ], buttonStart, 1300, group);
    queueClosingLine(cta, buttonStart + 1300, group);
    playOnVisible(cta, group, cta, { threshold:.2 });
  });
})();
