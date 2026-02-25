document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const data = {
      nombre: document.getElementById('nombre').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      negocio: document.getElementById('negocio').value.trim(),
      mensaje: document.getElementById('mensaje').value.trim()
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
      } else {
        const err = await res.json();
        alert(err.error || 'Error al enviar. Intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Quiero mi demo gratis';
      }
    } catch {
      alert('Error de conexión. Intenta de nuevo.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Quiero mi demo gratis';
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Navbar shadow on scroll
  window.addEventListener('scroll', function () {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });
});
