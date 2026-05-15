const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Pi sends sensor data
router.post('/', (req, res) => {
    const {
        house_id,
        flow_litres,
        total_litres,
        pressure_kpa,
        valve_open,
        leakage,
        main_flow
    } = req.body;

    db.run(
        `INSERT INTO sensor_readings
         (house_id, flow_litres, total_litres, pressure_kpa, valve_open, leakage, main_flow)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            house_id     || 1,
            flow_litres  || 0.0,
            total_litres || 0.0,
            pressure_kpa || 0.0,
            valve_open   ? 1 : 0,
            leakage      ? 1 : 0,
            main_flow    || 0.0
        ],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'ok', message: 'Data saved' });
        }
    );
});

// Get last 50 readings for all houses
router.get('/', (req, res) => {
    db.all(
        `SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 50`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Get latest reading for all houses
router.get('/latest', (req, res) => {
    db.get(
        `SELECT * FROM sensor_readings ORDER BY timestamp DESC LIMIT 1`,
        [],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) res.json(row);
            else res.status(404).json({ message: 'No data yet' });
        }
    );
});

// Get latest reading for specific house
router.get('/house/:house_id/latest', (req, res) => {
    const house_id = req.params.house_id;
    db.get(
        `SELECT * FROM sensor_readings WHERE house_id = ?
         ORDER BY timestamp DESC LIMIT 1`,
        [house_id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) res.json(row);
            else res.status(404).json({ message: 'No data yet' });
        }
    );
});

// Get last 50 readings for specific house
router.get('/house/:house_id', (req, res) => {
    const house_id = req.params.house_id;
    db.all(
        `SELECT * FROM sensor_readings WHERE house_id = ?
         ORDER BY timestamp DESC LIMIT 50`,
        [house_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;