const express = require('express');
const db = require('../database/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { buildCSV } = require('../utils/csv');

const router = express.Router();

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function calcDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const diff = Math.floor((new Date(checkOut) - new Date(checkIn)) / 1000);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// POST /api/attendance/check-in
router.post('/check-in', requireAuth, (req, res) => {
  const today = getToday();
  const now = new Date().toISOString();

  const existing = db.get(
    'SELECT id FROM attendance WHERE user_id = ? AND attendance_date = ?',
    [req.session.userId, today]
  );

  if (existing) {
    return res.status(409).json({ error: 'Attendance already marked for today.' });
  }

  db.runWrite(
    'INSERT INTO attendance (user_id, attendance_date, check_in) VALUES (?, ?, ?)',
    [req.session.userId, today, now]
  );

  res.json({ message: 'Check-in recorded successfully', check_in: formatTime(now) });
});

// POST /api/attendance/check-out
router.post('/check-out', requireAuth, (req, res) => {
  const today = getToday();
  const now = new Date().toISOString();

  const record = db.get(
    'SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?',
    [req.session.userId, today]
  );

  if (!record) {
    return res.status(400).json({ error: 'No check-in found for today. Please check in first.' });
  }
  if (record.check_out) {
    return res.status(409).json({ error: 'Check-out already recorded for today.' });
  }

  db.runWrite(
    'UPDATE attendance SET check_out = ? WHERE id = ?',
    [now, record.id]
  );

  res.json({
    message: 'Check-out recorded successfully',
    check_out: formatTime(now),
    working_duration: calcDuration(record.check_in, now)
  });
});

// GET /api/attendance/today-status — Staff: today's own record
router.get('/today-status', requireAuth, (req, res) => {
  const today = getToday();
  const record = db.get(
    'SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?',
    [req.session.userId, today]
  );

  if (!record) return res.json(null);

  res.json({
    attendance_date: record.attendance_date,
    check_in:  record.check_in  ? formatTime(record.check_in)  : '',
    check_out: record.check_out ? formatTime(record.check_out) : '',
    working_duration: calcDuration(record.check_in, record.check_out),
    status: record.check_in ? (record.check_out ? 'Present' : 'Checked In') : 'Absent'
  });
});

// GET /api/attendance/my
router.get('/my', requireAuth, (req, res) => {
  const records = db.all(
    `SELECT attendance_date, check_in, check_out
     FROM attendance WHERE user_id = ?
     ORDER BY attendance_date DESC LIMIT 30`,
    [req.session.userId]
  );

  const result = records.map(r => ({
    attendance_date: r.attendance_date,
    check_in:  r.check_in  ? formatTime(r.check_in)  : '',
    check_out: r.check_out ? formatTime(r.check_out) : '',
    working_duration: calcDuration(r.check_in, r.check_out),
    status: r.check_in ? (r.check_out ? 'Present' : 'Checked In') : 'Absent'
  }));

  res.json(result);
});

// GET /api/attendance/today — Admin
router.get('/today', requireAdmin, (req, res) => {
  const today = getToday();

  const records = db.all(
    `SELECT u.employee_id, u.name, u.department, a.check_in, a.check_out
     FROM users u
     LEFT JOIN attendance a ON u.id = a.user_id AND a.attendance_date = ?
     WHERE u.status = 'ACTIVE' AND u.role = 'STAFF'
     ORDER BY u.name`,
    [today]
  );

  const result = records.map(r => ({
    employee_id: r.employee_id,
    name: r.name,
    department: r.department,
    check_in:  r.check_in  ? formatTime(r.check_in)  : '',
    check_out: r.check_out ? formatTime(r.check_out) : '',
    status: r.check_in ? (r.check_out ? 'Present' : 'Checked In') : 'Absent'
  }));

  res.json(result);
});

// GET /api/attendance/stats — Admin dashboard
router.get('/stats', requireAdmin, (req, res) => {
  const today = getToday();

  const totalStaff  = (db.get("SELECT COUNT(*) as c FROM users WHERE status='ACTIVE' AND role='STAFF'") || {}).c || 0;
  const presentToday = (db.get("SELECT COUNT(*) as c FROM attendance WHERE attendance_date=? AND check_in IS NOT NULL", [today]) || {}).c || 0;
  const checkedIn   = (db.get("SELECT COUNT(*) as c FROM attendance WHERE attendance_date=? AND check_in IS NOT NULL AND check_out IS NULL", [today]) || {}).c || 0;
  const absentToday = Math.max(0, totalStaff - presentToday);

  res.json({ totalStaff, presentToday, absentToday, checkedIn });
});

// GET /api/attendance/export — CSV
router.get('/export', requireAdmin, (req, res) => {
  const { start_date, end_date, user_id } = req.query;

  let query = `
    SELECT u.employee_id, u.name, u.department, a.attendance_date, a.check_in, a.check_out
    FROM attendance a JOIN users u ON a.user_id = u.id WHERE 1=1`;
  const params = [];

  if (start_date) { query += ' AND a.attendance_date >= ?'; params.push(start_date); }
  if (end_date)   { query += ' AND a.attendance_date <= ?'; params.push(end_date); }
  if (user_id)    { query += ' AND a.user_id = ?'; params.push(user_id); }
  query += ' ORDER BY a.attendance_date DESC, u.name';

  const records = db.all(query, params);

  const rows = records.map(r => ({
    employee_id: r.employee_id,
    name: r.name,
    department: r.department,
    attendance_date: r.attendance_date,
    check_in:  r.check_in  ? formatTime(r.check_in)  : '',
    check_out: r.check_out ? formatTime(r.check_out) : '',
    working_duration: calcDuration(r.check_in, r.check_out),
    status: r.check_in ? (r.check_out ? 'Present' : 'Checked In') : 'Absent'
  }));

  const csv = buildCSV(rows);
  const filename = `attendance_report_${getToday()}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv);
});

// GET /api/attendance — Admin filtered list
router.get('/', requireAdmin, (req, res) => {
  const { start_date, end_date, user_id } = req.query;

  let query = `
    SELECT u.employee_id, u.name, u.department, a.attendance_date, a.check_in, a.check_out
    FROM attendance a JOIN users u ON a.user_id = u.id WHERE 1=1`;
  const params = [];

  if (start_date) { query += ' AND a.attendance_date >= ?'; params.push(start_date); }
  if (end_date)   { query += ' AND a.attendance_date <= ?'; params.push(end_date); }
  if (user_id)    { query += ' AND a.user_id = ?'; params.push(user_id); }
  query += ' ORDER BY a.attendance_date DESC, u.name';

  const records = db.all(query, params);

  const result = records.map(r => ({
    employee_id: r.employee_id,
    name: r.name,
    department: r.department,
    attendance_date: r.attendance_date,
    check_in:  r.check_in  ? formatTime(r.check_in)  : '',
    check_out: r.check_out ? formatTime(r.check_out) : '',
    working_duration: calcDuration(r.check_in, r.check_out),
    status: r.check_in ? (r.check_out ? 'Present' : 'Checked In') : 'Absent'
  }));

  res.json(result);
});

module.exports = router;
