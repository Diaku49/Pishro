const express = require('express');
const {body} = require('express-validator');
const SecurityController = require('../controller/Security');
const IsHigh = require('../MiddleWare/isHigh');



const Router = express.Router();

Router.put('/Ban/:userId',IsHigh,SecurityController.BanUser);

Router.put('/setModerator/:userId',IsHigh,SecurityController.SetModerator);

Router.get('/getAllUserByEmail/',IsHigh,[
    body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email')
],SecurityController.getUser);

module.exports = Router;