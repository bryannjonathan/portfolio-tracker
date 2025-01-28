/* 
./server/route.js
Contains all the routes API of the project including
    - login, registration
*/

require('dotenv').config();

var request = require('request');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const express = require("express");
const app = express();

const pool = require('./db');

const cors = require("cors");

const axios = require("axios")

app.use(cors());

// TODO: generate secrent key, put in dot.env file and get it from there
// const SECRET_KEY = "Hello"
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const POLYGON_KEY = process.env.POLYGON_API;	

// ROUTES

/*
Register API
- Gets username, email, password from user
- Returns if registration is successful or not (check if email/username has already exist/used)
*/
app.post("/register", async(req,res) => {
    try{
        const { username, email, password } = req.body;

        if(!username || !email || !password){
            return res.status(400).json({
                error: "All fields must be filled."
            })
        }
       
        const user_id = uuidv4(); // generate UUID for user_id

        // hash the password 
        const hashedPassword = await bcrypt.hash(password, 10);


        // SQL query: add into the database
        
        const userResult = await pool.query(
            `INSERT INTO users (user_id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *;`, 
            [user_id, username, email, hashedPassword]
        );

        res.status(201).json({
            message: `${user} has successfuly registerd`,
            user: userResult.rows[0]
        })

    } catch (err){
        console.error("Error registering user: ", err);
        
        // special case: Email/username already exists
        if (err.code == "23505"){
            return res.status(409).json({
                error: "Username/email already exists."
            })
        }

        res.status(500).json({
            error: "Registeration failed, Internal Sever error",
        })
    }

})

/* 
Login Rate Limiter
- Limits the login attempt to prevent brute force attack
*/
const loginLimiter = rateLimit({
    windowsMs: 15 * 60 * 1000, // 15 minutes
    max :10, 
    message: "Too many login attempts, please try again later." 
})


/* 
Login API
- Accepts user username and password
- Returns if login successful or not (username exist and password is according to the database)
*/
app.post("/login", loginLimiter, async(req,res) => {
    try{
        const { email, password } = req.body;

        // if username/password is empty
        // if (!email || !password){
        //     return res.status(400).json({
        //         error: "Both username and password are required."
        //     });
        // }

        // get the specific user from the database
        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        // check if user exist
        if (userResult.rows.length == 0){
            return res.status(404).json({
                error: "Invalid email or password."
            });
        }

        const user = userResult.rows[0];

        // check if password matches the one in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        // jwt 
        const token = jwt.sign(
            { user_id: user.user_id },
            SECRET_KEY,
            { expiresIn : "1h" },
        );

        // successful login
        res.status(200).json({
            message: "Successful login",
            token: { token },
            user : {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
            }
        })
    } catch(err){
        res.status(400).json({
            error: "Failed to login. Internal server error"
        });
    }
})

// Just to test
// Get all users (for testing)
app.get("/users", async(req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM users"  // Note: we exclude password for security
        );

        res.status(200).json({
            message: "Users retrieved successfully",
            users: result.rows
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({
            error: "Failed to retrieve users"
        });
    }
});



// DATA API
// news API
app.get("/api/news", async (req, res) => {
    console.log("Trying to fetch news data")
    const url = `https://api.polygon.io/v2/reference/news?limit=100&apiKey=${POLYGON_KEY}`

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;


    try{
        const response = await axios.get(url);
        const allNews = response.data.results;

        const startIdx = (page - 1) * limit;
        const endIdx = startIdx + limit;
        const pageNews = allNews.slice(startIdx, endIdx)
        
        res.status(200).json({
            message:"Succesfully fetched news",
            data: pageNews,
            pagination: {
                page,
                limit,
                totalItems: allNews.length,
                totalPages: Math.ceil(allNews.length / limit),
            },
        });
    } catch (error){
        
        if (error.response){
            // Request made but server responded with non 200 code 
            res.status(error.response.status).json({
                error: "Failed to fetch news",
                message: error.response.data,
            }) 
        } else if (error.request) {
            // Request made but no response was received 
            res.status(500).json({
                error: "No response received from Polygon.io",
            });
        } else {
            // Something went wrong with the request
            res.status(500).json({
                error: "Error setting up the request",
                message: error.message,
            })
        }
    }


    
});

/*
 * Stocks Search API
 * - Accepts query 
 * - Returns the best matches of that query
 * - Uses alpha vantage API
*/
app.get("/api/searchStock", async (req,res) => {
    // 'use strict';
    const keyword = req.query.keyword;
    console.log("keyword:", keyword);
   
    // TODO: hide polygon API key
    url = `https://api.polygon.io/v3/reference/tickers?market=stocks&search=${keyword}&active=true&limit=100&apiKey=${POLYGON_KEY}`

    try{
        const response = await axios.get(url)
        console.log("response:", response.data);

        res.status(200).json({
            message:"Searched Successful",
            data: response.data.results,
        })
    } catch(error) {
        if (error.response){
            // Request made, but server responded with non 200 code
            res.status(error.response.status).json({
                erorr: "Failed to fetch news",
                message: error.response.data,
            })
        } else if (error.request){  
            // Request made but no response was received 
            res.status(500).json({
                error: "No response received from Polygon.io",
            })

        } else {
            res.status(500).json({
                error: "Error setting up the request",
                message: error.message,
            })
        }
    }
});

/* 
Crypto Search API
- Accepts query
- Returns the best match according to the query
- Uses coingecko API
*/
app.get("/api/searchCrypto", async(req,res) => {
    const keyword = req.query.keyword;
    console.log("keyword:", keyword);

    // TODO: Hide API key
    const url = `https://api.coingecko.com/api/v3/search?query=${keyword}`;

    try{
        const response = await axios.get(url)
        // console.log("response:", response.data);


        // filter the coins based on market_cap_rank: top 50
        const filteredCoins = [];

        for (const coin of response.data.coins){
            console.log(coin);
            if (coin.market_cap_rank <= 50 && coin.market_cap_rank != null){
                filteredCoins.push(coin)
            }
        }

        // sort filtered coins based on ascending order of market_cap_rank
        filteredCoins.sort((a,b) => b.market_cap_rank - a.market_cap_rank);

        res.status(200).json({
            message:"Searched Successful",
            data: filteredCoins,
        })
    } catch(error) {
        if (error.response){
            // Request made, but server responded with non 200 code
            res.status(error.response.status).json({
                erorr: "Failed to fetch news",
                message: error.response.data,
            })
        } else if (error.request){  
            // Request made but no response was received 
            res.status(500).json({
                error: "No response received from Polygon.io",
            })

        } else {
            res.status(500).json({
                error: "Error setting up the request",
                message: error.message,
            })
        }
    }



   
});

// Portfolios 

/* 
 * Create Portfolio
*/

app.post("/api/portfolios/", async (req, res) => {
    const { userId, name } = req.body;
    console.log(`Trying to create portfolio ${name} for user ${userId}`)

    try{
        // Check if existing portfolio name exist
        const isExist = await pool.query(
            "SELECT * FROM Portfolios WHERE user_id = $1 AND name = $2",
            [userId, name]
        );
    
        if (isExist.rows.length > 0){
            return res.status(400).json({
                message: "Portfolio with that name already existed."
            }); 
        }

        // Create the new portfolio
        const portfolioId = uuidv4();
        const newPortfolio = await pool.query(
            "INSERT INTO Portfolios (portfolio_id, user_id, name) VALUES ($1, $2, $3) RETURNING *",
            [portfolioId, userId, name]
        );
        
        res.status(201).json({
            message: "Sucessfuly created new portfolio",
            data: newPortfolio.rows[0],
        });

    } catch (error) {

    }
});

/*
    * Get all portfolios
    * Returns list of portfolios for that user_id
*/

app.get("/api/portfolios/:userId", async (req, res) => {
    // console.log(req)
    const { userId } = req.params;

    console.log(`Trying to get portofolios for ${userId}`)

    if (!userId) {
        return res.status(400).json({
            message: 'required user_id',
        })
    }

    try{
        const portfolios = await pool.query(
            'SELECT * FROM Portfolios WHERE user_id = $1 ORDER BY name ASC',
            [userId]
        );

        console.log(`portfolio data for ${userId}: `, portfolios)

        res.status(200).json({
            message: "Successfully retrieve portfolios.",
            data: portfolios.rows,
            total: portfolios.rows.length,
        });

    } catch (error) {
        console.error("Error fetching portfolios for user ", userId)

        res.status(500).json({
            message: "Internal server error",
        });
    }

    
});




module.exports = app;
