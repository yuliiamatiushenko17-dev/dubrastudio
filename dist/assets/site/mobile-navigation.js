(() => {
  const nav = document.querySelector('nav');
  const links = nav?.querySelector('.nav-links');
  if (!links) return;

  const narrow = matchMedia('(max-width: 900px)');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mobile-menu-toggle';
  links.id ||= 'site-navigation';
  button.setAttribute('aria-controls', links.id);
  for (let index = 0; index < 3; index++) {
    const line = document.createElement('span');
    line.setAttribute('aria-hidden', 'true');
    button.append(line);
  }
  nav.append(button);

  function setOpen(open) {
    links.classList.toggle('mobile-menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    const czech = document.documentElement.lang === 'cs';
    button.setAttribute('aria-label', czech
      ? (open ? 'Zavřít navigaci' : 'Otevřít navigaci')
      : (open ? 'Close navigation' : 'Open navigation'));
  }

  setOpen(false);
  button.addEventListener('click', () => setOpen(!links.classList.contains('mobile-menu-open')));
  // Links appear before the toggle in the header's DOM, so enter the opened list directly.
  button.addEventListener('keydown', event => {
    if (event.key === 'Tab' && !event.shiftKey && links.classList.contains('mobile-menu-open')) {
      event.preventDefault();
      links.querySelector('a')?.focus();
    }
  });
  links.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !links.classList.contains('mobile-menu-open')) return;
    setOpen(false);
    button.focus();
  });
  narrow.addEventListener('change', () => setOpen(false));
})();
