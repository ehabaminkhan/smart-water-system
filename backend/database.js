const Database = require('better-sqlite3');
const path     = require('path');

const DB_PATH = path.join(__dirname, 'database.db');
const db      = new Database(DB_PATH);

db.exec(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
        flow_litres   REAL DEFAULT 0.0,
        total_litres  REAL DEFAULT 0.0,
        pressure_kpa  REAL DEFAULT 0.0,
        valve_open    INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS billing (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_litres    REAL DEFAULT 0.0,
        price_per_litre REAL DEFAULT 0.05,
        total_bill      REAL DEFAULT 0.0,
        paid            INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS valve_commands (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        command   TEXT DEFAULT 'open'
    );
`);

console.log('Database initialized successfully.');
module.exports = db;