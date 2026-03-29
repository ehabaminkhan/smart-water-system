const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.post('/', (req, res) => {
    const { flow_litres, total_litres, pressure_kpa, valve_open } = req.body;
    db.run(
        `INSERT INTO sensor_readings (flow_litres, total_litres, pressure_kpa, valve_open) VALUES (?, ?, ?, ?)`,
        [flow_litres || 0.0, total_litres || 0.0, pressure_kpa || 0.0, valve_open ? 1 : 0],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'ok', message: 'Data saved' });
        }
    );
});

router.get('/', (req, res) => {
    db.all(`SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 50`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.get('/latest', (req, res) => {
    db.get(`SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) res.json(row);
        else res.status(404).json({ message: 'No data yet' });
    });
});

module.exports = router;