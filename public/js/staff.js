document.addEventListener('DOMContentLoaded', async () => {

  // Auth
  const res = await fetch('/api/me');
  if (!res.ok) { window.location.href = '/login'; return; }
  const user = await res.json();
  if (user.role !== 'STAFF') { window.location.href = '/admin'; return; }

  // Sidebar
  document.getElementById('user-name').textContent    = user.name;
  document.getElementById('user-avatar').textContent  = user.name.charAt(0).toUpperCase();
  document.getElementById('welcome-name').textContent = user.name;
  document.getElementById('today-label').textContent  = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });

  // Button listeners
  document.getElementById('checkin-btn').addEventListener('click',  doCheckIn);
  document.getElementById('checkout-btn').addEventListener('click', doCheckOut);

  // Load
  await loadTodayStatus();
  await loadRecentHistory();
});

async function loadTodayStatus() {
  const res = await fetch('/api/attendance/today-status');
  const record = res.ok ? await res.json() : null;
  updateUI(record);
}

function updateUI(record) {
  const checkinBtn  = document.getElementById('checkin-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const statusEl    = document.getElementById('attendance-status-badge');
  const todayStatus = document.getElementById('stat-checkedin');

  document.getElementById('checkin-time').textContent  = record?.check_in  || '—';
  document.getElementById('checkout-time').textContent = record?.check_out || '—';
  document.getElementById('duration').textContent      = record?.working_duration || '—';

  if (!record) {
    statusEl.innerHTML      = `<span class="attendance-status" style="background:rgba(231,76,60,0.1);color:#c0392b;">Not Checked In</span>`;
    todayStatus.textContent = 'Absent';
    checkinBtn.disabled  = false;
    checkoutBtn.disabled = true;
  } else if (!record.check_out) {
    statusEl.innerHTML      = `<span class="attendance-status" style="background:rgba(52,152,219,0.1);color:#1a6fa8;">Checked In</span>`;
    todayStatus.textContent = 'Checked In';
    checkinBtn.disabled  = true;
    checkoutBtn.disabled = false;
  } else {
    statusEl.innerHTML      = `<span class="attendance-status" style="background:rgba(39,174,96,0.1);color:#1e8449;">Present ✓</span>`;
    todayStatus.textContent = 'Present';
    checkinBtn.disabled  = true;
    checkoutBtn.disabled = true;
  }
}

async function doCheckIn() {
  const btn = document.getElementById('checkin-btn');
  btn.disabled = true; btn.textContent = 'Checking in...';
  clearAlert();
  try {
    const res  = await fetch('/api/attendance/check-in', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { showAlert(data.error, 'error'); btn.disabled = false; btn.innerHTML = '✅ Check In'; return; }
    showToast(data.message, 'success');
    await loadTodayStatus();
    await loadRecentHistory();
  } catch {
    showAlert('Network error.', 'error');
    btn.disabled = false; btn.innerHTML = '✅ Check In';
  }
}

async function doCheckOut() {
  const btn = document.getElementById('checkout-btn');
  btn.disabled = true; btn.textContent = 'Checking out...';
  clearAlert();
  try {
    const res  = await fetch('/api/attendance/check-out', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { showAlert(data.error, 'error'); btn.disabled = false; btn.innerHTML = '🚪 Check Out'; return; }
    showToast(data.message, 'success');
    await loadTodayStatus();
    await loadRecentHistory();
  } catch {
    showAlert('Network error.', 'error');
    btn.disabled = false; btn.innerHTML = '🚪 Check Out';
  }
}

async function loadRecentHistory() {
  const container = document.getElementById('history-container');
  try {
    const res     = await fetch('/api/attendance/my');
    if (!res.ok) throw new Error();
    const records = await res.json();

    // Compute stats
    const present = records.filter(r => r.check_in).length;
    const absent  = 30 - present;
    document.getElementById('stat-present').textContent = present;
    document.getElementById('stat-absent').textContent  = absent < 0 ? 0 : absent;

    // Show only last 5
    const recent = records.slice(0, 5);
    if (!recent.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No records yet.</p></div>`;
      return;
    }
    container.innerHTML = `
      <table>
        <thead><tr><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Duration</th><th>Status</th></tr></thead>
        <tbody>
          ${recent.map(r => `
            <tr>
              <td>${r.attendance_date}</td>
              <td>${r.check_in  || '—'}</td>
              <td>${r.check_out || '—'}</td>
              <td>${r.working_duration || '—'}</td>
              <td>${statusBadge(r.status)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load.</p></div>`;
  }
}
