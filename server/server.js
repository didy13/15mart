const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database', 'termini.db'));
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const sessionSecret = process.env.SESSION_SECRET || 'dev_only_change_this_secret';

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 1 dan
    }
}));

app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10
});

app.use(express.static(path.join(__dirname, '..', 'public')));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS masters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_url TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        service TEXT,
        master_name TEXT,
        price INTEGER,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'Na čekanju'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS daily_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        slot_duration INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
)`);
    db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, () => {});
});

//Routes for pages
/*app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Route for the appointments page
app.get('/rezervacija', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'rezervacija.html'));
});

// Route for the services page
app.get('/usluge', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'usluge.html'));
});

// Route for statistics/analytics page
app.get('/statistika', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'statistika.html'));
});

// Route for about page
app.get('/o-nama', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'about.html'));
});*/


// API ZA USLUGE
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", (err, rows) => res.json(rows));
});
app.post('/api/services', requireTrustedOrigin, isAdmin, (req, res) => {
    const { name, price } = req.body;
    const parsedPrice = Number(price);
    if (!name || Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "Invalid service payload" });
    }
    db.run("INSERT INTO services (name, price) VALUES (?, ?)", [name.trim(), parsedPrice], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "ok" });
    });
});
app.delete('/api/services/:id', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("DELETE FROM services WHERE id = ?", req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "ok" });
    });
});

// API ZA TERMINE I ANALITIKU
app.get('/api/appointments', (req, res) => {
    db.all("SELECT * FROM appointments ORDER BY date ASC, time ASC", (err, rows) => res.json(rows));
});
app.get('/api/stats', isAuthenticated, (req, res) => {
    db.get(`SELECT SUM(CASE WHEN status='Završen' THEN price ELSE 0 END) as revenue, 
           COUNT(DISTINCT customer_name) as customers, 
           COUNT(*) as total FROM appointments`, (err, row) => res.json(row));
});
app.post('/api/appointments', (req, res) => {
    const { customer_name, service, date, time } = req.body;
    if (!customer_name || !service || !date || !time) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    db.get("SELECT price FROM services WHERE name = ?", [service], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: "Service not found" });
        const price = row ? row.price : 0;
        db.get("SELECT id FROM appointments WHERE date = ? AND time = ? AND status IN ('Na čekanju', 'Prihvaćen')", [date, time], (checkErr, existing) => {
            if (checkErr) return res.status(500).json({ error: checkErr.message });
            if (existing) return res.status(409).json({ error: "Termin u ovom terminu vec postoji" });
            db.run(
                "INSERT INTO appointments (customer_name, service, price, date, time) VALUES (?, ?, ?, ?, ?)",
                [customer_name.trim(), service, price, date, time],
                (insertErr) => {
                    if (insertErr) return res.status(500).json({ error: insertErr.message });
                    res.json({ status: "ok" });
                }
            );
        });
    });
});
app.put('/api/appointments/:id/accept', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("UPDATE appointments SET status = 'Prihvaćen' WHERE id = ? AND status = 'Na čekanju'", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(400).json({ error: "Termin nije u statusu Na čekanju" });
        res.json({ status: "ok" });
    });
});
app.put('/api/appointments/:id/reject', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("UPDATE appointments SET status = 'Odbijen' WHERE id = ? AND status = 'Na čekanju'", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(400).json({ error: "Termin nije u statusu Na čekanju" });
        res.json({ status: "ok" });
    });
});
app.put('/api/appointments/:id/complete', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("UPDATE appointments SET status = 'Završen' WHERE id = ? AND status = 'Prihvaćen'", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(400).json({ error: "Samo prihvaćen termin može biti završen" });
        res.json({ status: "ok" });
    });
});
app.delete('/api/appointments/:id', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});

// API ZA MAJSTORE
app.get('/api/masters', (req, res) => {
    db.all("SELECT * FROM masters ORDER BY name", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/masters', requireTrustedOrigin, isAdmin, (req, res) => {
    const { name, image_url } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    db.run("INSERT INTO masters (name, image_url) VALUES (?, ?)", [name, image_url || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
app.delete('/api/masters/:id', requireTrustedOrigin, isAdmin, (req, res) => {
    db.run("DELETE FROM masters WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
});

app.get('/api/checkSession', (req, res) => {
  if (!req.session || !req.session.userId) return res.json({ loggedIn: false, isAdmin: false });
  db.get("SELECT role FROM users WHERE id = ?", [req.session.userId], (err, user) => {
    if (err || !user) return res.json({ loggedIn: false, isAdmin: false });
    res.json({ loggedIn: true, isAdmin: user.role === "admin" });
  });
});

app.post('/login', requireTrustedOrigin, loginLimiter, (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        req.session.userId = user.id;
        req.session.role = user.role || "user";
        res.json({ success: true, role: req.session.role });
    });
});
app.post('/signup', requireTrustedOrigin, authLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    if (!isStrongPassword(password, username)) {
        return res.status(400).json({
            error: "Password must be at least 10 chars and include uppercase, lowercase, number, and special character."
        });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'user')", [username.trim(), hash], function(err) {
            if (err) {
                if (String(err.message).includes("UNIQUE")) return res.status(409).json({ error: "Username already exists" });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ success: true, userId: this.lastID });
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/logout', requireTrustedOrigin, authLimiter, (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

function isAdmin(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
    db.get("SELECT role FROM users WHERE id = ?", [req.session.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
        next();
    });
}

function requireTrustedOrigin(req, res, next) {
    const origin = req.headers.origin;
    if (!origin) return next();
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: "Blocked by origin policy" });
    }
    next();
}

function isStrongPassword(password, username = '') {
    if (password.length < 10) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(password)) return false;
    if (username && password.toLowerCase().includes(String(username).toLowerCase())) return false;
    return true;
}

const createAdmin = async () => {
    const username = "admin";
    const password = await bcrypt.hash("123456", 10);

    db.run("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, 'admin')", [username, password]);
    db.run("UPDATE users SET role = 'admin' WHERE username = ?", [username]);
};

createAdmin();

app.listen(3001, () => console.log("Server: http://localhost:3001"));