require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  }
};

if (process.env.NODE_ENV !== 'production') {
  const FileStore = require('session-file-store')(session);
  const sessionsDir = path.join(__dirname, 'database', 'sessions');
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
  sessionConfig.store = new FileStore({ path: sessionsDir, ttl: 28800, retries: 1 });
}

app.use(session(sessionConfig));

// Static files — disable cache in development
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

// API Routes
app.use('/api', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/attendance', require('./routes/attendance'));

// HTML Pages — no cache
const views  = path.join(__dirname, 'views');
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};
app.get('/',                noCache, (req, res) => res.sendFile(path.join(views, 'login.html')));
app.get('/login',           noCache, (req, res) => res.sendFile(path.join(views, 'login.html')));
app.get('/admin',           noCache, (req, res) => res.sendFile(path.join(views, 'admin.html')));
app.get('/staff',           noCache, (req, res) => res.sendFile(path.join(views, 'staff.html')));
app.get('/staff-management',noCache, (req, res) => res.sendFile(path.join(views, 'staff-management.html')));
app.get('/add-staff',       noCache, (req, res) => res.sendFile(path.join(views, 'add-staff.html')));
app.get('/edit-staff',      noCache, (req, res) => res.sendFile(path.join(views, 'edit-staff.html')));
app.get('/attendance',      noCache, (req, res) => res.sendFile(path.join(views, 'attendance.html')));
app.get('/reports',         noCache, (req, res) => res.sendFile(path.join(views, 'reports.html')));
app.get('/my-attendance',   noCache, (req, res) => res.sendFile(path.join(views, 'my-attendance.html')));
app.get('/my-profile',      noCache, (req, res) => res.sendFile(path.join(views, 'my-profile.html')));

// Start server after DB is ready
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`   Run "npm run setup" to create the admin account.`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});
