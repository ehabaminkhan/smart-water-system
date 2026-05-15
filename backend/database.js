const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join('/tmp', 'database.db');
const db      = new sqlite3.Database(DB_PATH);

db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS sensor_readings (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
        house_id      INTEGER DEFAULT 1,
        flow_litres   REAL    DEFAULT 0.0,
        total_litres  REAL    DEFAULT 0.0,
        pressure_kpa  REAL    DEFAULT 0.0,
        valve_open    INTEGER DEFAULT 1,
        leakage       INTEGER DEFAULT 0,
        main_flow     REAL    DEFAULT 0.0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS billing (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
        house_id        INTEGER DEFAULT 1,
        total_litres    REAL    DEFAULT 0.0,
        price_per_litre REAL    DEFAULT 50.0,
        total_bill      REAL    DEFAULT 0.0,
        paid            INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS valve_commands (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        house_id  INTEGER DEFAULT 1,
        command   TEXT    DEFAULT 'open'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS houses (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        meter_id  TEXT    UNIQUE,
        name      TEXT,
        address   TEXT
    )`);

    // Insert default houses
    db.run(`INSERT OR IGNORE INTO houses (id, meter_id, name, address)
            VALUES (1, 'MTR-001', 'House 1', 'Address 1')`);
    db.run(`INSERT OR IGNORE INTO houses (id, meter_id, name, address)
            VALUES (2, 'MTR-002', 'House 2', 'Address 2')`);

});

console.log('Database initialized successfully.');
module.exports = db;