const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Pi sends sensor data here every second
router.post('/', (req, res) => {
    const { flow_litres, total_litres, pressure_kpa, valve_open } = req.body;

    try {
        db.prepare(`
            INSERT INTO sensor_readings (flow_litres, total_litres, pressure_kpa, valve_open)
            VALUES (?, ?, ?, ?)
        `).run(
            flow_litres  || 0.0,
            total_litres || 0.0,
            pressure_kpa || 0.0,
            valve_open   ? 1 : 0
        );

        res.json({ status: 'ok', message: 'Data saved' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard fetches last 50 readings
router.get('/', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM sensor_readings
            ORDER BY timestamp DESC
            LIMIT 50
        `).all();

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard fetches only the latest single reading
router.get('/latest', (req, res) => {
    try {
        const row = db.prepare(`
            SELECT * FROM sensor_readings
            ORDER BY timestamp DESC
            LIMIT 1
        `).get();

        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'No data yet' });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;