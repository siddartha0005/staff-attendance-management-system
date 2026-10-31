document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('ADMIN');
  if (!user) return;
  loadStaff();
});

async function loadStaff() {
  const container = document.getElementById('staff-table-container');
  try {
    const res = await fetch('/api/staff');
    if (!res.ok) throw new Error();
    const staff = await res.json();

    document.getElementById('staff-count').textContent = `${staff.length} employee(s)`;

    if (!staff.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No staff members found. <a href="/add-staff">Add one now.</a></p></div>`;
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${staff.map(s => `
            <tr>
              <td>${s.employee_id}</td>
              <td><strong>${s.name}</strong></td>
              <td>${s.email}</td>
              <td>${s.department}</td>
              <td>${s.designation || '—'}</td>
              <td>${statusBadge(s.status)}</td>
              <td>
                <a href="/edit-staff?id=${s.id}" class="btn btn-outline btn-sm">✏️ Edit</a>
                ${s.role !== 'ADMIN' ? `
                  <button class="btn btn-sm ${s.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}"
                    onclick="toggleStatus(${s.id}, '${s.name}', '${s.status}')">
                    ${s.status === 'ACTIVE' ? '🔒 Deactivate' : '🔓 Activate'}
                  </button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load staff list.</p></div>`;
  }
}

function toggleStatus(id, name, currentStatus) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const action = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';

  openModal(
    `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
    `Are you sure you want to ${action} ${name}?`,
    async () => {
      try {
        // Fetch current data first
        const getRes = await fetch(`/api/staff/${id}`);
        const staff = await getRes.json();

        const res = await fetch(`/api/staff/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...staff, status: newStatus })
        });

        if (!res.ok) {
          const d = await res.json();
          showToast(d.error || 'Failed to update status', 'error');
          return;
        }

        showToast(`${name} has been ${action}d.`, 'success');
        loadStaff();
      } catch {
        showToast('Network error.', 'error');
      }
    }
  );
}
