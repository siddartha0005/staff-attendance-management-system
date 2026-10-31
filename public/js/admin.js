document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('ADMIN');
  if (!user) return;
  loadDashboard();
});

async function loadDashboard() {
  await Promise.all([loadStats(), loadTodayAttendance()]);
}

async function loadStats() {
  try {
    const res = await fetch('/api/attendance/stats');
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('stat-total').textContent = data.totalStaff;
    document.getElementById('stat-present').textContent = data.presentToday;
    document.getElementById('stat-absent').textContent = data.absentToday;
    document.getElementById('stat-checkedin').textContent = data.checkedIn;
  } catch {}
}

async function loadTodayAttendance() {
  const container = document.getElementById('today-table-container');
  try {
    const res = await fetch('/api/attendance/today');
    if (!res.ok) throw new Error();
    const records = await res.json();

    if (!records.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No attendance records for today.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td><strong>${r.name}</strong></td>
              <td>${r.employee_id}</td>
              <td>${r.department}</td>
              <td>${r.check_in || '—'}</td>
              <td>${r.check_out || '—'}</td>
              <td>${statusBadge(r.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load attendance data.</p></div>`;
  }
}
