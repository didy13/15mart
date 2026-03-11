const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./termini.db');

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        service TEXT,
        price INTEGER,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'Na čekanju'
    )`);
});

// API ZA USLUGE
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", (err, rows) => res.json(rows));
});
app.post('/api/services', (req, res) => {
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
app.get('/api/stats', (req, res) => {
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
app.put('/api/appointments/:id/complete', (req, res) => {
    db.run("UPDATE appointments SET status = 'Završen' WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});
app.delete('/api/appointments/:id', (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});

app.listen(3000, () => console.log("Server: http://localhost:3000"));