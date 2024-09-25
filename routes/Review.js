const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const ReviewController = require('../controller/Review');   



const Router = express.Router();

Router.get('/getAllReview/:providerId/:serviceId',IsAuth,ReviewController.GetReviews);

Router.post('/submitReview/:providerId/:serviceId',IsAuth,[
    body('rating')
    .trim()
    .isInt({min:0,max:10})
    .withMessage('invalid rate.'),
    body('comment')
    .trim()
    .isString()
    .withMessage('invalid Comment')
],ReviewController.submitReview);

Router.put('/editReview/:providerId/:reviewId',IsAuth,[
    body('rating')
    .trim()
    .isInt({min:0,max:10})
    .withMessage('invalid rate.'),
    body('comment')
    .trim()
    .isString()
    .withMessage('invalid Comment')
],ReviewController.EditReview);

Router.delete('/deleteReview/:providerId/:reviewId',IsAuth,ReviewController.deleteReview);


module.exports = Router;