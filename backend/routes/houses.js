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
    const meter_id = req.params.meter_id.toUpperCase().trim();
    console.log('Looking for meter ID:', meter_id);

    db.get(
        `SELECT * FROM houses WHERE UPPER(meter_id) = ?`,
        [meter_id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                console.log('Found house:', row);
                res.json(row);
            } else {
                console.log('No house found for meter ID:', meter_id);
                res.status(404).json({ message: 'Meter ID not found' });
            }
        }
    );
});

module.exports = router;