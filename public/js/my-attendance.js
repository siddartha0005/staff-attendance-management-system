document.addEventListener('DOMContentLoaded', async () => {

  const res = await fetch('/api/me');
  if (!res.ok) { window.location.href = '/login'; return; }
  const user = await res.json();
  if (user.role !== 'STAFF') { window.location.href = '/admin'; return; }

  document.getElementById('user-name').textContent   = user.name;
  document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });

  document.getElementById('search-btn').addEventListener('click', loadAttendance);
  document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('filter-start').value = '';
    document.getElementById('filter-end').value   = '';
    loadAttendance();
  });

  await loadAttendance();
});

async function loadAttendance() {
  const container = document.getElementById('attendance-container');
  container.innerHTML = `<div class="loading"><div class="spinner"></div><p>Loading...</p></div>`;

  const start = document.getElementById('filter-start').value;
  const end   = document.getElementById('filter-end').value;

  try {
    const res = await fetch('/api/attendance/my');
    if (!res.ok) throw new Error();
    let records = await res.json();

    // Apply client-side date filters
    if (start) records = records.filter(r => r.attendance_date >= start);
    if (end)   records = records.filter(r => r.attendance_date <= end);

    // Stats
    const present = records.filter(r => r.check_in).length;
    document.getElementById('stat-present').textContent = present;
    document.getElementById('stat-absent').textContent  = Math.max(0, 30 - present);

    // Avg hours
    const durations = records
      .filter(r => r.working_duration)
      .map(r => {
        const m = r.working_duration.match(/(\d+)h\s*(\d+)m/);
        return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
      });
    const avgMins = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    document.getElementById('stat-hours').textContent = avgMins ? `${Math.floor(avgMins/60)}h ${avgMins%60}m` : '—';

    document.getElementById('record-count').textContent = `${records.length} record(s)`;

    if (!records.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No attendance records found.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table>
        <thead><tr><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Duration</th><th>Status</th></tr></thead>
        <tbody>
          ${records.map(r => `
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
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load records.</p></div>`;
  }
}
