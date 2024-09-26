const dotenv = require('dotenv');
dotenv.config();

const cloud = require('./cloud.config');
const googleOAuth = require('./googleOAuth.config');

module.exports = {
    port:process.env.PORT,
    jwtSecret:process.env.JWT_SECRET,
    jwtRefreshSecret:process.env.JWT_RSECRET,
    cloud:cloud,
    googleOAuth:googleOAuth,
};