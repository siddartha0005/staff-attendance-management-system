document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('ADMIN');
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/staff-management'; return; }

  try {
    const res = await fetch(`/api/staff/${id}`);
    if (!res.ok) throw new Error('Staff not found');
    const staff = await res.json();

    document.getElementById('emp-id-display').textContent = `ID: ${staff.employee_id}`;

    document.getElementById('form-container').innerHTML = `
      <form id="edit-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Employee ID</label>
            <input type="text" value="${staff.employee_id}" disabled style="background:#f8f9fa; color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" value="${staff.name}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${staff.email}" disabled style="background:#f8f9fa; color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value="${staff.phone || ''}">
          </div>
          <div class="form-group">
            <label>Department *</label>
            <input type="text" name="department" value="${staff.department}" required>
          </div>
          <div class="form-group">
            <label>Designation</label>
            <input type="text" name="designation" value="${staff.designation || ''}">
          </div>
          <div class="form-group">
            <label>Account Status</label>
            <select name="status">
              <option value="ACTIVE" ${staff.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
              <option value="INACTIVE" ${staff.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:8px;">
          <button type="submit" class="btn btn-primary" id="save-btn">💾 Save Changes</button>
          <a href="/staff-management" class="btn btn-outline">Cancel</a>
        </div>
      </form>`;

    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      clearAlert();

      const form = e.target;
      const payload = {
        name:        form.name.value.trim(),
        phone:       form.phone.value.trim(),
        department:  form.department.value.trim(),
        designation: form.designation.value.trim(),
        status:      form.status.value
      };

      try {
        const res = await fetch(`/api/staff/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (!res.ok) {
          showAlert(result.error || 'Failed to update', 'error');
          return;
        }

        showAlert('Staff updated successfully! Redirecting...', 'success');
        setTimeout(() => window.location.href = '/staff-management', 1500);
      } catch {
        showAlert('Network error.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '💾 Save Changes';
      }
    });

  } catch (err) {
    document.getElementById('form-container').innerHTML =
      `<div class="alert alert-error">❌ ${err.message}</div>`;
  }
});
