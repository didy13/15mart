const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database', 'termini.db'));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'html')));

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
});

// Routes for pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'index.html')));
app.get('/rezervacija', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'rezervacija.html')));
app.get('/usluge', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'usluge.html')));
app.get('/raspored', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'raspored.html')));
app.get('/majstori', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'majstori.html')));
app.get('/statistika', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'statistika.html')));
app.get('/o-nama', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'about.html')));

// API ZA USLUGE
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", (err, rows) => res.json(rows));
});
app.post('/api/services', (req, res) => {
    const { name, price } = req.body;
    db.run("INSERT INTO services (name, price) VALUES (?, ?)", [name, price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});
app.delete('/api/services/:id', (req, res) => {
    db.run("DELETE FROM services WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
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

// API ZA TERMINE I ANALITIKU
app.get('/api/appointments', (req, res) => {
    const { date } = req.query;
    let query = "SELECT * FROM appointments";
    const params = [];
    if (date) {
        query += " WHERE date = ?";
        params.push(date);
    }
    query += " ORDER BY date ASC, time ASC";
    db.all(query, params, (err, rows) => res.json(rows));
});
app.get('/api/stats', (req, res) => {
    db.get(`SELECT SUM(CASE WHEN status='Završen' THEN price ELSE 0 END) as revenue, 
           COUNT(DISTINCT customer_name) as customers, 
           COUNT(*) as total FROM appointments`, (err, row) => res.json(row));
});
app.post('/api/appointments', (req, res) => {
    const { customer_name, service, master_name, date, time } = req.body;
    db.get("SELECT price FROM services WHERE name = ?", [service], (err, row) => {
        const price = row ? row.price : 0;
        db.run(
            "INSERT INTO appointments (customer_name, service, master_name, price, date, time, status) VALUES (?, ?, ?, ?, ?, ?, 'Na čekanju')",
            [customer_name, service, master_name || null, price, date, time],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID });
            }
        );
    });
});
app.put('/api/appointments/:id/complete', (req, res) => {
    db.run("UPDATE appointments SET status = 'Završen' WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: true });
    });
});
app.put('/api/appointments/:id/accept', (req, res) => {
    db.run("UPDATE appointments SET status = 'Prihvaćen' WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: true });
    });
});
app.put('/api/appointments/:id/cancel', (req, res) => {
    db.run("UPDATE appointments SET status = 'Otkazan' WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: true });
    });
});
app.delete('/api/appointments/:id', (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
});

// API ZA RASPORED
app.get('/api/schedules', (req, res) => {
    const { date } = req.query;
    let query = "SELECT * FROM daily_schedules";
    const params = [];
    if (date) {
        query += " WHERE date = ?";
        params.push(date);
    }
    query += " ORDER BY date DESC";
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/schedules', (req, res) => {
    const { date, start_time, end_time, slot_duration } = req.body;
    db.run(
        "INSERT INTO daily_schedules (date, start_time, end_time, slot_duration) VALUES (?, ?, ?, ?)",
        [date, start_time, end_time, slot_duration],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});
app.delete('/api/schedules/:id', (req, res) => {
    db.run("DELETE FROM daily_schedules WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: true });
    });
});
app.get('/api/schedules/dates', (req, res) => {
    db.all("SELECT DISTINCT date FROM daily_schedules ORDER BY date DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => row.date));
    });
});

app.listen(3000, () => console.log("Server radi na: http://localhost:3000"));