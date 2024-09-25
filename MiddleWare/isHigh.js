const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient({
    errorFormat:'pretty'
});
require('../prisma/prisma');

const IsHigh = async (req, res, next) => {
    try {
        //checking header
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        const accessToken = authHeader.split(' ')[1];
        // checking accessToken
        let decodedToken;
        try {
            decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        }catch (error) {
            // Handle specific error types (e.g., token expired)
            console.log('Access token expired');
            return res.status(401).json({
                message: 'Access token expired.'
            });
        }
        const user = await prisma.user.findFirst({
            where:{id:decodedToken.id},
            select:{
                isBan,
                isAdmin,
                isLoggedIn,
                isModerator
            }
        });
        if(user.isBan === true){
            const error = new Error('user is banned.');
            error.statusCode = 403;
            throw error;
        }
        if(!(user.isAdmin === true || user.isModerator === true)){
            const error = new Error('Not authorized.');
            error.statusCode = 403;
            throw error;
        }
        req.userId = decodedToken.id;
        req.type = decodedToken.type;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const IsAuthPlus = async (req, res, next) => {
    try {
        //checking header
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        const accessToken = authHeader.split(' ')[1];
        // checking accessToken
        let decodedToken;
        try {
            decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        }catch (error) {
            // Handle specific error types (e.g., token expired)
            console.log('Access token expired');
            return res.status(401).json({
                message: 'Access token expired.'
            });
        }
        const user = await prisma.user.findFirst({
            where:{id:decodedToken.id},
            select:{
                isBan,
                isAdmin,
                isLoggedIn
            }
        });
        if(user.isBan === true){
            const error = new Error('user is banned.');
            error.statusCode = 403;
            throw error;
        }
        if(user.isLoggedIn == false){
            const error = new Error('user is not Logged in.');
            error.statusCode = 403;
            throw error;
        }
        req.userId = decodedToken.id;
        req.type = decodedToken.type;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports = IsHigh,IsAuthPlus;