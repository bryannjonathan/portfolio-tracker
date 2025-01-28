// const { Client } = require("pg");
// const client = new Client({
//     user: "24bry",
//     password: "241203", // have to hide later
//     host: "localhost",
//     database: "Investory",
//     port: 5432,
// })

// module.exports = client;
require('dotenv').config();

// fetch from .env
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;


const Pool = require("pg").Pool;
const pool = new Pool({
    user: DB_USER,
    // TODO: Implement dot.env, hide this password, and fetch it 
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
});

module.exports = pool;

