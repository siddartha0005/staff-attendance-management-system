CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT NOT NULL,
  designation TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STAFF' CHECK(role IN ('ADMIN','STAFF')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')),
  joining_date TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  attendance_date TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  UNIQUE(user_id, attendance_date),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
