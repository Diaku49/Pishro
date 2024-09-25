const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const IsHigh = require('../MiddleWare/isHigh');
const ReportController = require('../controller/Report');   


const Router = express.Router();

Router.get('/getAllReports/:providerId',IsHigh,ReportController.getAllReports);

Router.post('/giveReport/:providerId',IsAuth,[
    body('title')
    .trim()
    .isString().withMessage('not String')
    .isLength({min:3}),
    body('description')
    .isString().withMessage('not String')
    .isLength({min:8})
],ReportController.Report);

Router.put('/editReport/:reportId/:provider',IsAuth,[
    body('title')
    .trim()
    .isString().withMessage('not String')
    .isLength({min:3}),
    body('description')
    .isString().withMessage('not String')
    .isLength({min:8})
],ReportController.EditReport);

Router.delete('/deleteReport/:providerId',IsAuth,ReportController.DeleteReport)

module.exports = Router;