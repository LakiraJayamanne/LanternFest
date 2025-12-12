// Client-side validation for the tickets form
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ticketForm');
  if (!form) return; // not on tickets page

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const ticketInput = document.getElementById('tickets');
  const typeSelect = document.getElementById('type');
  const terms = document.getElementById('terms');
  const message = document.getElementById('formMessage');

  const setMessage = (text, ok = false) => {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('form-message--error', !ok);
    message.classList.toggle('form-message--success', ok);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errors = [];
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();
    const tickets = Number(ticketInput?.value || '0');
    const type = (typeSelect?.value || '').trim();

    if (!name) errors.push('Name is required.');
    if (!emailRegex.test(email)) errors.push('Enter a valid email.');
    if (!/^[0-9]{7,15}$/.test(phone)) errors.push('Phone must be digits only (7-15 digits).');
    if (!Number.isInteger(tickets) || tickets < 1 || tickets > 10) errors.push('Tickets must be between 1 and 10.');
    if (!type) errors.push('Choose a ticket type.');
    if (!terms?.checked) errors.push('You must accept the terms.');

    return errors;
  };

  // Keep phone numeric
  phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D+/g, '');
  });

  form.addEventListener('submit', (e) => {
    const errors = validate();
    if (errors.length) {
      e.preventDefault();
      setMessage(errors.join(' '), false);
      return;
    }
    e.preventDefault();
    setMessage('Success! Your tickets are reserved.', true);
    form.reset();
  });

  form.addEventListener('reset', () => setMessage(''));
});
