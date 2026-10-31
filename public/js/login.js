document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      window.location.href = user.role === 'ADMIN' ? '/admin' : '/staff';
      return;
    }
  } catch {}

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    btn.disabled = true;
    btn.textContent = 'Signing in...';
    clearAlert();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Login failed', 'error');
        return;
      }

      window.location.href = data.role === 'ADMIN' ? '/admin' : '/staff';
    } catch {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
});

function showAlert(msg, type) {
  const box = document.getElementById('alert-box');
  const icons = { error: '❌', success: '✅' };
  box.innerHTML = `<div class="alert alert-${type === 'error' ? 'error' : 'success'}">${icons[type] || ''} ${msg}</div>`;
}

function clearAlert() {
  document.getElementById('alert-box').innerHTML = '';
}
