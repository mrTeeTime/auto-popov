(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Otevřít menu');
      nav.classList.remove('is-open');
    };

    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Otevřít menu' : 'Zavřít menu');
      nav.classList.toggle('is-open', !open);
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (!form || !status) return;

  const requiredFields = [...form.querySelectorAll('[required]')];

  function markValidity(field) {
    const valid = field.checkValidity() && field.value.trim() !== '';
    field.classList.toggle('is-invalid', !valid);
    return valid;
  }

  requiredFields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) markValidity(field);
    });
    field.addEventListener('blur', () => markValidity(field));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const valid = requiredFields.map(markValidity).every(Boolean);
    if (!valid) {
      status.classList.add('error');
      status.textContent = 'Prosím doplňte všechna povinná pole.';
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (window.location.protocol === 'file:') {
      status.classList.add('success');
      status.textContent = 'Formulář je správně vyplněn. Odesílání e-mailem se aktivuje po nasazení na PHP hosting.';
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const data = await response.json();

      if (!response.ok || !data.ok) throw new Error(data.message || 'Odeslání se nepodařilo.');

      status.classList.add('success');
      status.textContent = data.message || 'Formulář odeslán.';
      form.reset();
    } catch (error) {
      status.classList.add('error');
      status.textContent = error.message || 'Odeslání se nepodařilo. Zkuste to prosím znovu.';
    } finally {
      submitButton.disabled = false;
    }
  });
})();
