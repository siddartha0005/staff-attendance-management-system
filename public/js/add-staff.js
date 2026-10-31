document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('ADMIN');
  if (!user) return;

  document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Adding...';
    clearAlert();

    const form = e.target;
    const data = {
      employee_id:  form.employee_id.value.trim(),
      name:         form.name.value.trim(),
      email:        form.email.value.trim(),
      phone:        form.phone.value.trim(),
      department:   form.department.value.trim(),
      designation:  form.designation.value.trim(),
      password:     form.password.value,
      joining_date: form.joining_date.value
    };

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        showAlert(result.error || 'Failed to add staff', 'error');
        return;
      }

      showAlert('Staff member added successfully! Redirecting...', 'success');
      setTimeout(() => window.location.href = '/staff-management', 1500);
    } catch {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '➕ Add Staff Member';
    }
  });
});
