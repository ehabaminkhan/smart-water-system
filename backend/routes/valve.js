const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.post('/', (req, res) => {
    const { command } = req.body;
    if (!['open', 'close'].includes(command)) {
        return res.status(400).json({ error: 'Command must be open or close' });
    }
    db.run(`INSERT INTO valve_commands (command) VALUES (?)`, [command], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'ok', command });
    });
});

router.get('/latest', (req, res) => {
    db.get(`SELECT * FROM valve_commands ORDER BY timestamp DESC LIMIT 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { command: 'open' });
    });
});

module.exports = router;