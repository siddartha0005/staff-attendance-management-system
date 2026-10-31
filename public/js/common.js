// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ===== ALERT BOX =====
function showAlert(message, type = 'error') {
  const box = document.getElementById('alert-box');
  if (!box) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  box.innerHTML = `<div class="alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}">
    ${icons[type] || ''} ${message}
  </div>`;
}

function clearAlert() {
  const box = document.getElementById('alert-box');
  if (box) box.innerHTML = '';
}

// ===== DATE DISPLAY =====
function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}

// ===== AUTH GUARD =====
async function requireAuth(expectedRole) {
  try {
    const res = await fetch('/api/me');
    if (!res.ok) { window.location.href = '/login'; return null; }
    const user = await res.json();
    if (expectedRole && user.role !== expectedRole) {
      window.location.href = user.role === 'ADMIN' ? '/admin' : '/staff';
      return null;
    }
    // Set sidebar user info
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
    return user;
  } catch {
    window.location.href = '/login';
    return null;
  }
}

// ===== LOGOUT =====
function setupLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });
}

// ===== BADGE HELPER =====
function statusBadge(status) {
  const map = {
    'Present':    'badge-success',
    'Checked In': 'badge-info',
    'Absent':     'badge-danger',
    'ACTIVE':     'badge-success',
    'INACTIVE':   'badge-danger'
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
}

// ===== MODAL =====
function openModal(title, message, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  document.getElementById('confirm-modal').style.display = 'flex';
  document.getElementById('modal-confirm-btn').onclick = () => {
    closeModal();
    onConfirm();
  };
}

function closeModal() {
  const m = document.getElementById('confirm-modal');
  if (m) m.style.display = 'none';
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  setupLogout();
});
