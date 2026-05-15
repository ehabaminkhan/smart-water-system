const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Calculate bill for specific house
router.post('/calculate', (req, res) => {
    const { total_litres, price_per_litre = 50, house_id = 1 } = req.body;
    const total_bill = parseFloat((total_litres * price_per_litre).toFixed(2));

    db.run(
        `INSERT INTO billing (house_id, total_litres, price_per_litre, total_bill)
         VALUES (?, ?, ?, ?)`,
        [house_id, total_litres, price_per_litre, total_bill],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ house_id, total_litres, price_per_litre, total_bill, currency: 'PKR' });
        }
    );
});

// Get all bills
router.get('/', (req, res) => {
    db.all(
        `SELECT * FROM billing ORDER BY timestamp DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Get bills for specific house
router.get('/house/:house_id', (req, res) => {
    const house_id = req.params.house_id;
    db.all(
        `SELECT * FROM billing WHERE house_id = ?
         ORDER BY timestamp DESC`,
        [house_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;