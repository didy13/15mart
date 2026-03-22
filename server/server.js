const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database', 'termini.db'));

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
    }),
    secret: 'super_tajni_kljuc_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,  // lokalno false, na HTTPS true
        sameSite: 'lax', // omogućava cross-site cookie za localhost
        maxAge: 1000 * 60 * 60 * 24 // 1 dan
    }
}));

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
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
        password TEXT
)`);
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
app.post('/api/services',(req, res) => {
    const { name, price } = req.body;
    db.run("INSERT INTO services (name, price) VALUES (?, ?)", [name, price], () => res.json({ status: "ok" }));
});
app.delete('/api/services/:id', (req, res) => {
    db.run("DELETE FROM services WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
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
    db.get("SELECT price FROM services WHERE name = ?", [service], (err, row) => {
        const price = row ? row.price : 0;
        db.run("INSERT INTO appointments (customer_name, service, price, date, time) VALUES (?, ?, ?, ?, ?)", 
        [customer_name, service, price, date, time], () => res.json({ status: "ok" }));
    });
});
app.put('/api/appointments/:id/complete', isAuthenticated, (req, res) => {
    db.run("UPDATE appointments SET status = 'Završen' WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});
app.delete('/api/appointments/:id', isAuthenticated, (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});

// API ZA MAJSTORE
app.get('/api/masters', (req, res) => {
    db.all("SELECT * FROM masters ORDER BY name", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/masters', (req, res) => {
    const { name, image_url } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    db.run("INSERT INTO masters (name, image_url) VALUES (?, ?)", [name, image_url || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
app.delete('/api/masters/:id', (req, res) => {
    db.run("DELETE FROM masters WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
});

app.get('/api/checkSession', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        console.log("Found user:", user);
        if (err) return res.status(500).json({ error: err.message });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        req.session.userId = user.id;

        res.json({ success: true });
    });
});
app.post('/logout', (req, res) => {
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

const createAdmin = async () => {
    const username = "admin";
    const password = await bcrypt.hash("123456", 10);

    db.run("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)", [username, password]);
};

createAdmin();

app.listen(3001, () => console.log("Server: http://localhost:3001"));