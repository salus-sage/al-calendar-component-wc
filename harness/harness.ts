// Minimal harness interactions for dev/testing
const datePickers = document.querySelectorAll('albert-date-picker, albert-datetime-picker');

datePickers.forEach((picker) => {
  picker.addEventListener('albert-change', (e: Event) => {
    const event = e as CustomEvent;
    console.log('Change event:', {
      tag: picker.tagName.toLowerCase(),
      value: event.detail.value,
    });
  });
});

console.log('Harness ready. Found', datePickers.length, 'pickers.');
