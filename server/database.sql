CREATE DATABASE Investory;

CREATE TYPE transaction_type_enum AS ENUM ('buy', 'sell');


CREATE TABLE Users(
    user_id UUID PRIMARY KEY,
    username varchar(255) NOT NULL UNIQUE,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    oauth_id varchar
);

CREATE TABLE Portfolios(
    portfolio_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name varchar NOT NULL UNIQUE,

    FOREIGN KEY(user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Transactions(
    transaction_id UUID PRIMARY KEY,
    portfolio_id UUID NOT NULL,
    ticker VARCHAR NOT NULL,
    ticker_name VARCHAR NOT NULL,
    transaction_type transaction_type_enum NULL,
    quantity INT NOT NULL CHECK (quantity >= 0), 
    total_value FLOAT NOT NULL CHECK(total_value > 0),
    currency CHAR(3) NOT NULL,

    FOREIGN KEY(portfolio_id) REFERENCES Portfolios(portfolio_id) ON DELETE CASCADE
);

-- Add transaction date to table Transactions
ALTER Table Transactions
ADD transaction_date TIMESTAMP default CURRENT_TIMESTAMP;

-- Add base_investment column
ALTER TABLE portfolios
ADD COLUMN base_investment NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Add current_valuation column
ALTER TABLE portfolios
ADD COLUMN current_valuation NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Add profit_loss column
ALTER TABLE portfolios
ADD COLUMN profit_loss NUMERIC(15, 2) GENERATED ALWAYS AS (current_valuation - base_investment) STORED;

-- Add asset list to portfolios
-- Asset list will be in json format
-- { name: 'APPL', type: 'stock',  }
ALTER TABLE portfolios
ADD COLUMN assets_list JSONB DEFAULT '[]'::jsonb;

ALTER TABLE portfolios DROP COLUMN assets_list;

-- Drop Asset list and create a new table Assets
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,         -- Unique identifier for each asset
    name VARCHAR(255) NOT NULL,          -- Asset name (e.g., "Apple", "Bitcoin")
    symbol VARCHAR(50) UNIQUE NOT NULL,  -- Asset symbol (e.g., "AAPL", "BTC")
    asset_type VARCHAR(50) NOT NULL,     -- Type of asset (e.g., "stock", "crypto")
    current_price NUMERIC(15, 2),        -- Latest price (from external API)
    last_updated TIMESTAMP DEFAULT NOW() -- Last time the price was updated
);


-- and the table portfolio_assets to link the 2 tables (many-to-many)
CREATE TABLE portfolio_assets (
    portfolio_id UUID REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
    asset_id INT REFERENCES assets(asset_id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,           -- Amount owned by the portfolio
    average_buy_price NUMERIC(15, 2) NOT NULL, -- Average buy price
    PRIMARY KEY (portfolio_id, asset_id)      -- Composite primary key
);

-- Create attribute % change for portfolio table
ALTER TABLE portfolios
ADD COLUMN percentage_change NUMERIC(15, 2) 
GENERATED ALWAYS AS (
    CASE 
        WHEN base_investment = 0 THEN 0
        ELSE ((current_valuation - base_investment) / base_investment) * 100
    END
) STORED;

-- Fixed missing transaction_id default value by generating random UUID in the psql database
ALTER TABLE transactions 
ALTER COLUMN transaction_id 
SET DEFAULT gen_random_uuid();

-- Add sectors to the table assets
ALTER TABLE assets
ADD COLUMN sector VARCHAR(255);

-- Add crypto_id to suport searching for Coingecko
ALTER TABLE assets
ADD COLUMN crypto_id VARCHAR(50);


