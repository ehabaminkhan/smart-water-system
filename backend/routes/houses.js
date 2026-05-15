const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Get all houses
router.get('/', (req, res) => {
    db.all(`SELECT * FROM houses`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get house by meter ID
router.get('/meter/:meter_id', (req, res) => {
    const meter_id = req.params.meter_id;
    db.get(
        `SELECT * FROM houses WHERE meter_id = ?`,
        [meter_id.toUpperCase()],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) res.json(row);
            else res.status(404).json({ message: 'Meter ID not found' });
        }
    );
});

module.exports = router;