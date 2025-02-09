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
const FINHUB_KEY = process.env.FINHUB_API;
const ALPHA_KEY = process.env.ALPHAV_API;

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
 * GET /api/porfolios
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
        // Fetch all of user's portfolio
        const portfolios = await pool.query(
            'SELECT * FROM Portfolios WHERE user_id = $1 ORDER BY name ASC',
            [userId]
        );

        console.log(`portfolio data for ${userId}: `, portfolios.rows)
        //
        // // Update assets current price
        // for (const portfolio of portfolio.rows){
        //     const assets = await pool.query(
        //         'SELECT * FROM portfolio_assets WHERE portfolio_id = $1',
        //         [portfolio['portfolio_id']]
        //     );
        //
        //     console.log(`assets of portfolio ${portfolioId}: `, assets)
        //
        // }

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

// API Test to return the sector of a stock
app.get('/api/getSector/', async(req,res) => {
    console.log('Currently getting sector')
    
    // const ticker = 'AAPL'
    // const ticker = ['AAPL', 'MSFT', 'MSTR', 'NVDA', 'META', 'AMZN', 'NFLX']
    const ticker = ['JPM']
    // const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`
    // console.log(`apiKey = ${ALPHA_KEY}`)
    console.log(`symbol=${ticker}`)
    
    try{
        // const response = await axios.get(alphaUrl)
        const sectors = []
        for (const tick of ticker){
            const finhubUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${tick}&token=${FINHUB_KEY}`
            const response2 = await axios.get(finhubUrl)
            console.log(`LOG: response2.data: `, response2.data)
            sectors.push({
                ticker: tick,
                FINHUB_sector: response2.data['finnhubIndustry'],
            })
        }
        res.status(200).json({
            success: true,
            ticker: tick,
            // ALPHAVANTAGE_sector: response.data['Sector'],
            sectors: sectors,
        })
    } catch (error) {
        console.log('error: ', error)
        res.status(404).json({
            success: false,
            message: error.message,
        })
    }

})

// Update the sector of the assets table
app.patch('/api/updateSector/', async(req, res) => {
    const assets = await pool.query('SELECT * FROM assets')    

    for (const asset of assets.rows){
        console.log(`LOG: updating ${asset.asset_id} ${asset.name}`)
        const finhubUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${asset.symbol}&token=${FINHUB_KEY}`
        const response = await axios.get(finhubUrl)
        console.log('New sector: ', response.data['finnhubIndustry'])

        const updateQuery = `UPDATE assets SET sector = '${response.data['finnhubIndustry']}' WHERE asset_id = ${asset.asset_id}`
        await pool.query(updateQuery)
    }
})

/*
 * POST /api/purchase_asset
 * When user select an asset to buy
 * Adds to their transaction table and portfolio table
*/
app.post('/api/purchase_asset', async(req, res) => {
    const { portfolioId, type, quantity, price, ticker, name, cryptoId } = req.body;

    console.log(`Purchasing ${quantity} ${name} for $${price} each for portfolio ${portfolioId}`)

    if (!portfolioId || !type || !quantity || !price || !ticker){
        return res.status(400).json({
            success: false,
            message: 'Missing required fields.'
        })
    }

    try{
        // Start transaction
        await pool.query('BEGIN')

        // Check portfolio exist
        const portfolioCheck = await pool.query('SELECT * FROM portfolios WHERE portfolio_id = $1;', [portfolioId]);
        if (portfolioCheck.rows.length === 0){
            await pool.query('ROLLBACK') // rollback when portfolio don't exist
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found',
            })
        }

        // Check if asset exist
        let asset_id;
        let sector;
        
        const assetCheck = await pool.query('SELECT * FROM assets WHERE symbol = $1', [ticker])

        if (assetCheck.rows.length === 0){
            console.log(`${ticker} does not exist in assets`)

            // get the sector of that asset
            if (type === 'crypto'){
                sector = 'Crypto'



            } else {
                // Using alpha vantage
                // const alphaUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_KEY}`
                // const alphaRes = await axios.get(alphaUrl)
                // sector = alphaRes.data['Sector'] || 'Unknown'
                // console.log(`sector for ${name} is ${sector}`)
                
                // Using finhub
                const finUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINHUB_KEY}`
                const finRes = await axios.get(finUrl)
                sector = finRes.data['finnhubIndustry'];
            }

            // insert into assets table
            const newAsset = await pool.query(
                'INSERT INTO assets (name, symbol, asset_type, sector, crypto_id) VALUES ($1, $2, $3, $4, $5) RETURNING asset_id;', [name, ticker, type, sector, cryptoId]
            ) 

            asset_id = newAsset.rows[0].asset_id;
        } else {
            // Asset exist in the table
            console.log(`LOG: ${ticker} has already exist in assets table`)
            asset_id = assetCheck.rows[0].asset_id;
        }

        const totalVal = quantity * price;
        console.log(`LOG: totalVal = ${totalVal}`)

        // Check if asset already in portfolio
        const existingAsset = await pool.query('SELECT * FROM portfolio_assets WHERE portfolio_id = $1 AND asset_id = $2', [portfolioId, asset_id])
    
        if (existingAsset.rows.length > 0) {
            // Asset exist in the portfolio
            await pool.query(
                'UPDATE portfolio_assets SET amount = amount + $1, average_buy_price = ((average_buy_price * amount) + ($2)) / (amount + $1) WHERE portfolio_id = $3 AND asset_id = $4', [quantity, totalVal, portfolioId, asset_id]
            );
        } else {
            // Asset does not exist in the portfolio
            await pool.query('INSERT INTO portfolio_assets (portfolio_id, asset_id, amount, average_buy_price) VALUES ($1, $2, $3, $4)', [portfolioId, asset_id, quantity, price])
        }

        // Log the transaction
        const transactionRes = await pool.query('INSERT INTO transactions (portfolio_id, ticker, ticker_name, transaction_type, quantity, total_value, currency, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING transaction_id;', [portfolioId, ticker, name, 'buy', quantity, totalVal, 'USD'])

        // Update the portfolios' base investment
        await pool.query(
            'UPDATE portfolios SET base_investment = base_investment + $1 WHERE portfolio_id = $2', [totalVal, portfolioId]
        );



        await pool.query('COMMIT')
        console.log(`Success adding ${name} to ${portfolioId}`)

        res.status(200).json({
            success: true,
            message: 'Asset purchased successfully',
            transcation_id: transactionRes.rows[0].transaction_id,
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error purchasing asset: ', error)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        })
    } 
})

/*
 *  GET /api/assets
 *  Returns all the assets (list) owned by that by specific portfolio and user
*/
app.get('/api/assets', async(req, res) => {
    const { portfolioId } = req.query
    // testing 
    // const portfolioId = 'd3dc5f7e-47b3-492d-a97d-72087c3f17b8'
    console.log(`LOG: Tryign to get assets for portfolio ${portfolioId}`)

    const assets = await pool.query(`
        SELECT a.asset_id, a.name, a.symbol, a.asset_type, a.current_price, a.sector, pa.amount, pa.average_buy_price 
        FROM portfolio_assets pa
        JOIN assets a ON pa.asset_id = a.asset_id
        WHERE pa.portfolio_id = $1
    `, [portfolioId]);

    if (assets.rows.length === 0){
        res.status(404).json({
            success: false,
            message: 'No assets found in this portfolio'
        })
    } else {
        res.status(200).json({
            success: true,
            message: 'Assets found',
            data: assets.rows
        })
    } 
})

// Testing API to test CoinGecko get Price
app.get('/api/getCryptoPrice', async(req, res) => {
    const cryptoId = 'bitcoin'
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=USD`

    try{
        const response = await axios.get(url)
        console.log(response.data)

        res.status(200).json({
            message: response.data,
        })

        console.log(`Crypto Price for BTC: ${response.data[cryptoId]['usd']}`)

    } catch(err){
        console.log('Error Fetching data from CoinGecko: ', err)

    }
    
})


module.exports = app;
