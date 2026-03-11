const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./termini.db');

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Kreiranje tabela
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        service TEXT,
        time TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER
    )`);
});

// RUTE ZA USLUGE
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", (err, rows) => res.json(rows));
});
app.post('/api/services', (req, res) => {
    const { name, price } = req.body;
    db.run("INSERT INTO services (name, price) VALUES (?, ?)", [name, price], function() {
        res.json({ id: this.lastID, name, price });
    });
});
app.delete('/api/services/:id', (req, res) => {
    db.run("DELETE FROM services WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});

// RUTE ZA TERMINE
app.get('/api/appointments', (req, res) => {
    db.all("SELECT * FROM appointments ORDER BY time ASC", (err, rows) => res.json(rows));
});
app.post('/api/appointments', (req, res) => {
    const { customer_name, service, time } = req.body;
    db.run("INSERT INTO appointments (customer_name, service, time) VALUES (?, ?, ?)", 
    [customer_name, service, time], function() {
        res.json({ id: this.lastID, ...req.body });
    });
});
app.delete('/api/appointments/:id', (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, () => res.json({ status: "ok" }));
});

app.listen(3000, () => console.log("Admin Panel: http://localhost:3000"));