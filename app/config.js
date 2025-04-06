require('dotenv').config()

const isProd = process.env.NODE_ENV === 'prod';

export const API_URL = isProd
    ? process.env.ONLINE_URL // Url to online backend
    : process.env.LOCAL_URL; // Url to local 

