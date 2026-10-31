const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Employee ID and password are required' });
  }

  const user = db.get(
    'SELECT * FROM users WHERE email = ? OR employee_id = ?',
    [identifier.trim(), identifier.trim()]
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status === 'INACTIVE') {
    return res.status(403).json({ error: 'Your account has been deactivated. Contact admin.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.name = user.name;

  res.json({ role: user.role, name: user.name, employee_id: user.employee_id });
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/me
router.get('/me', requireAuth, (req, res) => {
  const user = db.get(
    'SELECT id, employee_id, name, email, phone, department, designation, role, status, joining_date FROM users WHERE id = ?',
    [req.session.userId]
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
