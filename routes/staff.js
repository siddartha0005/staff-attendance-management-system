const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/staff
router.post('/', requireAdmin, (req, res) => {
  const { employee_id, name, email, phone, department, designation, password, joining_date } = req.body;

  if (!employee_id || !name || !email || !department || !password) {
    return res.status(400).json({ error: 'Employee ID, name, email, department, and password are required' });
  }

  const existing = db.get(
    'SELECT id FROM users WHERE email = ? OR employee_id = ?',
    [email.trim(), employee_id.trim()]
  );

  if (existing) {
    return res.status(409).json({ error: 'Employee ID or email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    const result = db.runWrite(
      `INSERT INTO users (employee_id, name, email, phone, department, designation, password_hash, role, status, joining_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'STAFF', 'ACTIVE', ?)`,
      [employee_id.trim(), name.trim(), email.trim(), phone || '',
       department.trim(), designation || '', hash,
       joining_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ message: 'Staff added successfully', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add staff' });
  }
});

// GET /api/staff
router.get('/', requireAdmin, (req, res) => {
  const staff = db.all(
    'SELECT id, employee_id, name, email, phone, department, designation, role, status, joining_date FROM users ORDER BY name'
  );
  res.json(staff);
});

// GET /api/staff/:id
router.get('/:id', requireAdmin, (req, res) => {
  const user = db.get(
    'SELECT id, employee_id, name, email, phone, department, designation, role, status, joining_date FROM users WHERE id = ?',
    [req.params.id]
  );
  if (!user) return res.status(404).json({ error: 'Staff member not found' });
  res.json(user);
});

// PUT /api/staff/:id
router.put('/:id', requireAdmin, (req, res) => {
  const { name, phone, department, designation, status } = req.body;

  if (!name || !department) {
    return res.status(400).json({ error: 'Name and department are required' });
  }

  const user = db.get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Staff member not found' });

  db.runWrite(
    'UPDATE users SET name = ?, phone = ?, department = ?, designation = ?, status = ? WHERE id = ?',
    [name.trim(), phone || '', department.trim(), designation || '', status || 'ACTIVE', req.params.id]
  );

  res.json({ message: 'Staff updated successfully' });
});

module.exports = router;
