(() => {
  const buttons = [...document.querySelectorAll('.lang-toggle button')];
  if (buttons.length !== 2) return;

  const shared = new Map([
    ['Portfolio', 'Realizace'], ['Services', 'Služby'], ['Process', 'Jak to funguje'],
    ['About', 'O nás'], ['About us', 'O nás'], ['Contact', 'Kontakt'],
    ['Navigation', 'Navigace'], ['Hours', 'Otevírací doba'],
    ['Mon–Fri 8:00–17:00', 'Po–Pá 8:00–17:00'],
    ['Sat by appointment', 'So po domluvě']
  ]);
  const translations = [...document.querySelectorAll('[data-cs]')].map(element => ({
    element, en: element.innerHTML, cs: element.dataset.cs
  }));
  for (const element of document.querySelectorAll('.nav-links a, .footer-links a, .footer-col-title')) {
    const en = element.textContent.trim();
    if (shared.has(en)) translations.push({ element, en, cs: shared.get(en) });
  }

  const switcher = buttons[0].closest('.lang-toggle');
  const copy = new Map([...shared, ...Object.entries(window.dubraCzechCopy || {})]);
  function translate(text) {
    const key = text.trim().replace(/\s+/g, ' ');
    if (copy.has(key)) return text.replace(text.trim(), copy.get(key));
    for (const separator of [' / ', ' ↘', ' — DUBRÁ Studio']) {
      const index = key.indexOf(separator);
      if (index < 0) continue;
      const prefix = copy.get(key.slice(0, index));
      if (prefix) return text.replace(text.trim(), prefix + key.slice(index));
    }
    return text.replace(/^(\s*0\d\s*\/\s*)Made to measure(\s*)$/, '$1Na míru$2');
  }
  function apply(language) {
    const czech = language === 'cs';
    document.documentElement.lang = language;
    document.querySelector('nav')?.setAttribute('aria-label', czech ? 'Hlavní navigace' : 'Main navigation');
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', czech ? 'Jazyk' : 'Language');
    buttons.forEach((button, index) => {
      const selected = index === Number(czech);
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    for (const { element, en, cs } of translations) {
      const markup = czech ? cs : en;
      const target = element.querySelector('.footer-heading-swap > span:first-child') ?? element;
      if (target.innerHTML !== markup) target.innerHTML = markup;
    }
    if (czech) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.parentElement.closest('script, style, svg, [data-cs], .lang-toggle')
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      while (walker.nextNode()) walker.currentNode.data = translate(walker.currentNode.data);
      document.title = document.body.classList.contains('process-page')
        ? 'Jak to funguje — DUBRÁ Studio' : translate(document.title);
      const labels = {
        'View image': 'Zobrazit fotografii', 'Close image': 'Zavřít fotografii',
        'Full-size project photograph': 'Fotografie projektu v plné velikosti',
        'Contact details': 'Kontaktní údaje',
        'Reveal furnished room. Move right for furniture, left for empty room': 'Posuňte doprava pro zařízenou místnost, doleva pro prázdnou',
        'Compare furnished and empty room': 'Porovnat zařízenou a prázdnou místnost',
        'See more': 'Zobrazit více'
      };
      for (const element of document.querySelectorAll('[aria-label]')) {
        const label = element.getAttribute('aria-label');
        const fullImage = label.match(/^View (.+) image full size$/);
        const translated = labels[label] ?? (fullImage
          ? `Zobrazit fotografii v plné velikosti: ${translate(fullImage[1])}`
          : translate(label));
        if (label !== translated) element.setAttribute('aria-label', translated);
      }
    }
  }

  let language = 'en';
  try {
    if (localStorage.getItem('dubra-language') === 'cs') language = 'cs';
  } catch {}
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  if (requestedLanguage === 'en' || requestedLanguage === 'cs') language = requestedLanguage;
  apply(language);
  buttons.forEach((button, index) => {
    button.type = 'button';
    button.lang = index === 0 ? 'en' : 'cs';
    button.setAttribute('aria-label', index === 0 ? 'English' : 'Čeština');
    button.addEventListener('click', () => {
      const selected = index === 0 ? 'en' : 'cs';
      if (selected === language) return;
      try { localStorage.setItem('dubra-language', selected); } catch {}
      const url = new URL(location.href);
      url.searchParams.set('lang', selected);
      history.replaceState(history.state, '', url);
      location.reload();
    });
  });

  // File previews may give each page its own localStorage.
  if (location.protocol === 'file:') {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || !/^(?:\.\.\/)?[\w/-]+\.html(?:[?#]|$)/.test(link.getAttribute('href'))) return;
      const url = new URL(link.href);
      url.searchParams.set('lang', language);
      link.href = url.href;
    });
  }
})();
