(() => {
  const form = document.querySelector('#enquiry-form');
  if (!form) return;

  const select = form.elements.service;
  const requested = new URLSearchParams(location.search).get('service');
  if ([...select.options].some(option => option.value === requested)) {
    select.value = requested;
  }

  const picker = document.createElement('details');
  picker.className = 'project-picker';
  const summary = document.createElement('summary');
  const value = document.createElement('span');
  value.id = 'project-type-value';
  value.textContent = select.selectedOptions[0].text;
  summary.setAttribute('aria-labelledby', 'project-type-label project-type-value');
  summary.append(value);

  const choices = document.createElement('ul');
  for (const option of select.options) {
    const item = document.createElement('li');
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = option.text;
    choice.setAttribute('aria-pressed', String(option.selected));
    choice.addEventListener('click', () => {
      choices.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
      choice.setAttribute('aria-pressed', 'true');
      select.value = option.value;
      value.textContent = option.text;
      picker.open = false;
      summary.focus();
    });
    item.append(choice);
    choices.append(item);
  }

  picker.append(summary, choices);
  select.after(picker);
  select.hidden = true;
  document.querySelector('#project-type-label').addEventListener('click', event => {
    event.preventDefault();
    summary.focus();
  });
  document.addEventListener('click', event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  picker.addEventListener('focusout', event => {
    if (!picker.contains(event.relatedTarget)) picker.open = false;
  });
  picker.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !picker.open) return;
    event.preventDefault();
    picker.open = false;
    summary.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const status = document.getElementById('enquiry-status');
    const czech = document.documentElement.lang === 'cs';
    const subject = czech ? 'Poptávka — DUBRÁ Studio' : 'Project enquiry — DUBRÁ Studio';
    const body = [
      ...['name', 'email', 'phone', 'city'].map(key => key + ': ' + fields.get(key)),
      'Project: ' + select.selectedOptions[0].text,
      '',
      fields.get('message'),
    ].join('\r\n');
    status.textContent = czech
      ? 'Otevřete a odešlete koncept ve své e-mailové aplikaci.'
      : 'Review and send the draft in your email app.';
    status.hidden = false;
    location.href = form.getAttribute('action')
      + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();

(() => {
  const band = document.querySelector('.contact-form-band');
  if (!band) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  function update() {
    frame = 0;
    const rect = band.getBoundingClientRect();
    const viewport = document.documentElement.clientHeight;
    const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)));
    band.style.setProperty('--contact-photo-offset', motion.matches ? '0%' : (6 - progress * 12) + '%');
    band.style.setProperty('--contact-photo-scale', motion.matches ? 1 : 1.18 - progress * .18);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  schedule();
})();

