const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'attendance.db');

let db = null;

// Save database to disk
function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Auto-save wrapper: run a write operation then persist
function run(sql, params = []) {
  db.run(sql, params);
  save();
}

// Execute multiple statements (schema init)
function exec(sql) {
  db.run(sql);
  save();
}

// Return all rows as array of objects
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Return single row or undefined
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0];
}

// Run insert/update/delete and return lastInsertRowid and changes
function runWrite(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0];
  const rowid = lastId ? lastId.values[0][0] : null;
  save();
  return { lastInsertRowid: rowid };
}

async function initialize() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      department TEXT NOT NULL,
      designation TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STAFF',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      joining_date TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      attendance_date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      UNIQUE(user_id, attendance_date),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  save();
  console.log('✅ Database initialized');
}

module.exports = { initialize, run, exec, all, get, runWrite, save };
