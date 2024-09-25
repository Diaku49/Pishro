const jwt = require('jsonwebtoken');
require('../prisma/prisma');

const IsAuth = async (req, res, next) => {
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
        req.userId = decodedToken.id;
        req.typeId = decodedToken.typeId
        req.type = decodedToken.type;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
module.exports = IsAuth;