// const { Client } = require("pg");
// const client = new Client({
//     user: "24bry",
//     password: "241203", // have to hide later
//     host: "localhost",
//     database: "Investory",
//     port: 5432,
// })

// module.exports = client;
require('dotenv').config({ path: './server/.env' });

// Fetch from .env
// Local DB login
// const DB_USER = process.env.DB_USER;
// const DB_PASSWORD = process.env.DB_PASSWORD;
// const DB_NAME = process.env.DB_NAME;
// const DB_PORT = process.env.DB_PORT;
// Cloud DB login
const DB_URL = process.env.DATABASE_URL;

const Pool = require("pg").Pool;
const pool = new Pool({
    // Local DB login
    // user: DB_USER,
    // password: DB_PASSWORD,
    // database: DB_NAME,
    // port: DB_PORT,
    
    // Cloud DB login
    connectionString: DB_URL,
    ssl: {
        rejectUnauthorized: false, // Required by Render for SSL
    },
    
    
});

module.exports = pool;

