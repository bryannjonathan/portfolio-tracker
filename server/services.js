/* 
 * /server/services.js
 * Contains the services of this APP (automatic updates)
*/

const cron = require('node-cron')
const axios = require('axios')
const pool = require('./db')


// const ALPHA_VANTAGE_KEY = process.env.ALPHAV_API;
const FINHUB_KEY = process.env.FINHUB_API;

/*
 * Price Updater (automatically updates the price of the assets)
*/
async function updateAssetPrices(){
    try{
        const assets = await pool.query('SELECT asset_id, asset_type, symbol, crypto_id FROM assets;')

        for (const asset of assets.rows){
            const { asset_id, asset_type, symbol, crypto_id } = asset

            console.log(`LOG: Trying to UPDATE ${asset_type} ${asset_id}: ${symbol}`)
            
            let url;
            if (asset_type === 'stock'){
                // url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
                url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINHUB_KEY}`
            } else if (asset_type === 'crypto')
                url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto_id}&vs_currencies=USD` 

            try{
                response = await axios.get(url);
                
                let newPrice;

                if (asset_type === 'stock'){
                    newPrice = response.data['c'];
                } else if (asset_type === 'crypto')
                    // console.log(`Crypto ID: ${crypto_id}`)
                    // console.log(`For Crypto: ${response.data}`)
                    newPrice = response.data[crypto_id]['usd']

                if (newPrice){
                    await pool.query(
                        'UPDATE assets SET current_price = $1, last_updated = NOW() WHERE asset_id = $2',
                        [newPrice, asset_id]
                    );

                    console.log(`SUCCESS`)
                } else {
                    console.log(`Failed to retrieve new price for ${symbol}`)
                }

            } catch (err){
                console.error(`Failed to update price for ${symbol}:`, err)
            }            
            
        } 
    } catch (err){
        console.error(`Error fetching asset: ${err}`) 
    }
}

// 3 minute
cron.schedule('*/5 * * * *', async() => {
    console.log('Updating asset prices...')
    await updateAssetPrices();
    console.log('LOG: Finish Updating Prices')

})


