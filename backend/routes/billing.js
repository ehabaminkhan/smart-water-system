const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Calculate and save a bill
router.post('/calculate', (req, res) => {
    const { total_litres, price_per_litre = 0.05 } = req.body;

    try {
        const total_bill = parseFloat((total_litres * price_per_litre).toFixed(2));

        db.prepare(`
            INSERT INTO billing (total_litres, price_per_litre, total_bill)
            VALUES (?, ?, ?)
        `).run(total_litres, price_per_litre, total_bill);

        res.json({
            total_litres,
            price_per_litre,
            total_bill,
            currency: 'PKR'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard fetches all bills
router.get('/', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM billing
            ORDER BY timestamp DESC
        `).all();

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;