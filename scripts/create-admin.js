require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

async function main() {
  await db.initialize();

  const admin = {
    employee_id:  'ADMIN001',
    name:         'System Administrator',
    email:        'admin@company.com',
    phone:        '9999999999',
    department:   'Administration',
    designation:  'System Admin',
    password:     'Admin@123',
    joining_date: new Date().toISOString().split('T')[0]
  };

  const existing = db.get(
    'SELECT id FROM users WHERE email = ? OR employee_id = ?',
    [admin.email, admin.employee_id]
  );

  if (existing) {
    console.log('ℹ️  Admin account already exists.');
    process.exit(0);
  }

  const hash = bcrypt.hashSync(admin.password, 10);

  db.runWrite(
    `INSERT INTO users (employee_id, name, email, phone, department, designation, password_hash, role, status, joining_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE', ?)`,
    [admin.employee_id, admin.name, admin.email, admin.phone,
     admin.department, admin.designation, hash, admin.joining_date]
  );

  console.log('✅ Admin account created!');
  console.log('   Email:    admin@company.com');
  console.log('   Password: Admin@123');
  console.log('   ⚠️  Change this password after first login!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
