const dotenv = require('dotenv').config();

module.exports = {
    name:process.env.Cloud_Name,
    apiKey:process.env.Cloud_ApiKey,
    apiSecret:process.env.Cloud_ApiSecret,
};