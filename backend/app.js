const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/sensor-data', require('./routes/sensors'));
app.use('/api/billing',     require('./routes/billing'));
app.use('/api/valve',       require('./routes/valve'));
app.use('/api/houses',      require('./routes/houses'));

app.get('/', (req, res) => {
    res.json({ status: 'running', message: 'Smart Water System API is live' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});