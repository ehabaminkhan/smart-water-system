const express = require('express');
const router  = express.Router();
const db      = require('../database');

// Dashboard sends open/close command
router.post('/', (req, res) => {
    const { command } = req.body;

    if (!['open', 'close'].includes(command)) {
        return res.status(400).json({ error: 'Command must be open or close' });
    }

    try {
        db.prepare(`
            INSERT INTO valve_commands (command) VALUES (?)
        `).run(command);

        res.json({ status: 'ok', command });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pi polls this to get the latest valve command
router.get('/latest', (req, res) => {
    try {
        const row = db.prepare(`
            SELECT * FROM valve_commands
            ORDER BY timestamp DESC
            LIMIT 1
        `).get();

        res.json(row || { command: 'open' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;