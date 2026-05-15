const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Send valve command for specific house
router.post('/', (req, res) => {
    const { command, house_id } = req.body;
    if (!['open', 'close'].includes(command)) {
        return res.status(400).json({ error: 'Command must be open or close' });
    }
    db.run(
        `INSERT INTO valve_commands (house_id, command) VALUES (?, ?)`,
        [house_id || 1, command],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'ok', command, house_id: house_id || 1 });
        }
    );
});

// Get latest valve command for specific house
router.get('/house/:house_id/latest', (req, res) => {
    const house_id = req.params.house_id;
    db.get(
        `SELECT * FROM valve_commands WHERE house_id = ?
         ORDER BY timestamp DESC LIMIT 1`,
        [house_id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || { command: 'open', house_id });
        }
    );
});

// Get latest command (backwards compatible)
router.get('/latest', (req, res) => {
    db.get(
        `SELECT * FROM valve_commands ORDER BY timestamp DESC LIMIT 1`,
        [],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row || { command: 'open' });
        }
    );
});

module.exports = router;