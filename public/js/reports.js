document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('ADMIN');
  if (!user) return;
  await loadEmployeeFilter();
  await loadReport(); // auto-load all records on page open
});

async function loadEmployeeFilter() {
  try {
    const res = await fetch('/api/staff');
    if (!res.ok) return;
    const staff = await res.json();
    const sel = document.getElementById('filter-employee');
    staff.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.employee_id})`;
      sel.appendChild(opt);
    });
  } catch {}
}

function getFilterParams() {
  const params = new URLSearchParams();
  const start = document.getElementById('filter-start').value;
  const end   = document.getElementById('filter-end').value;
  const emp   = document.getElementById('filter-employee').value;
  if (start) params.set('start_date', start);
  if (end)   params.set('end_date', end);
  if (emp)   params.set('user_id', emp);
  return params;
}

async function loadReport() {
  const container = document.getElementById('report-container');
  container.innerHTML = `<div class="loading"><div class="spinner"></div><p>Loading...</p></div>`;

  try {
    const res = await fetch(`/api/attendance?${getFilterParams()}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const records = await res.json();

    document.getElementById('record-count').textContent = `${records.length} record(s)`;

    if (!records.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><p>No records found for the selected filters.</p></div>`;
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td><strong>${r.name}</strong></td>
              <td>${r.employee_id}</td>
              <td>${r.department}</td>
              <td>${r.attendance_date}</td>
              <td>${r.check_in || '—'}</td>
              <td>${r.check_out || '—'}</td>
              <td>${r.working_duration || '—'}</td>
              <td>${statusBadge(r.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load report. Please try again.</p></div>`;
  }
}

function downloadCSV() {
  const params = getFilterParams();
  window.location.href = `/api/attendance/export?${params}`;
  showToast('CSV download started!', 'success');
}

function clearFilters() {
  document.getElementById('filter-start').value = '';
  document.getElementById('filter-end').value = '';
  document.getElementById('filter-employee').value = '';
  loadReport();
}
