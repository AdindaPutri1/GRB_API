const { Pool } = require('pg');

// Konfigurasi koneksi PostgreSQL
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "MapresTETI1",
    port: 5432,
    database: "BookStore_Online",
});

module.exports = pool;