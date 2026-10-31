function sanitizeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Protect against CSV formula injection
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
  return str;
}

function buildCSV(rows) {
  const headers = [
    'Employee ID', 'Employee Name', 'Department',
    'Attendance Date', 'Check-In Time', 'Check-Out Time',
    'Working Duration', 'Status'
  ];

  const lines = [headers.join(',')];

  for (const row of rows) {
    const cells = [
      row.employee_id,
      row.name,
      row.department,
      row.attendance_date,
      row.check_in || '',
      row.check_out || '',
      row.working_duration || '',
      row.status || ''
    ].map(sanitizeCell);
    lines.push(cells.join(','));
  }

  return lines.join('\r\n');
}

module.exports = { buildCSV };
