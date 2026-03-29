const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.post('/calculate', (req, res) => {
    const { total_litres, price_per_litre = 0.05 } = req.body;
    const total_bill = parseFloat((total_litres * price_per_litre).toFixed(2));
    db.run(
        `INSERT INTO billing (total_litres, price_per_litre, total_bill) VALUES (?, ?, ?)`,
        [total_litres, price_per_litre, total_bill],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ total_litres, price_per_litre, total_bill, currency: 'PKR' });
        }
    );
});

router.get('/', (req, res) => {
    db.all(`SELECT * FROM billing ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;