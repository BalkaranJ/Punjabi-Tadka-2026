(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var statusEl = document.getElementById('contactStatus');
  var submitBtn = form.querySelector('button[type="submit"]');

  function encode(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      })
      .join('&');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: a real visitor never fills this in. If it's filled,
    // silently pretend success so a bot doesn't learn anything.
    var honeypot = form.querySelector('input[name="bot-field"]');
    if (honeypot && honeypot.value) {
      form.reset();
      if (statusEl) statusEl.textContent = "Thanks! We'll get back to you soon.";
      return;
    }

    var formData = new FormData(form);
    var data = {};
    formData.forEach(function (value, key) { data[key] = value; });

    submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = 'Sending…';

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Submission failed');
        form.reset();
        if (statusEl) statusEl.textContent = "Thanks! We'll get back to you soon.";
      })
      .catch(function () {
        if (statusEl) {
          statusEl.textContent = "Something went wrong. Please call us instead: (403) 708-2899.";
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
