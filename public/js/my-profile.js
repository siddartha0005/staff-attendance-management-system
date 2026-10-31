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

  const fields = [
    { label: 'Employee ID',  value: user.employee_id },
    { label: 'Full Name',    value: user.name },
    { label: 'Email',        value: user.email },
    { label: 'Phone',        value: user.phone || '—' },
    { label: 'Department',   value: user.department },
    { label: 'Designation',  value: user.designation || '—' },
    { label: 'Joining Date', value: user.joining_date || '—' },
    { label: 'Status',       value: user.status }
  ];

  document.getElementById('profile-container').innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      ${fields.map(f => `
        <div>
          <div style="font-size:12px;color:var(--text-light);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${f.label}</div>
          <div style="font-size:15px;font-weight:500;">${f.value}</div>
        </div>`).join('')}
    </div>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);color:var(--text-light);font-size:13px;">
      To update your profile details, please contact your administrator.
    </div>`;
});
