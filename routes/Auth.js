const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const AuthController = require('../controller/Auth');



const Router = express.Router();




/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates a new user as either a customer or provider.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - lastName
 *               - password
 *               - confirmPassword
 *               - NIDN
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: The first name of the user (minimum 3 characters).
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 description: The last name of the user (minimum 3 characters).
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 7
 *                 description: The user's password (minimum 7 characters).
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match the `password` field.
 *               NIDN:
 *                 type: integer
 *                 minimum: 10000000 // Assuming 8 digits minimum
 *                 maximum: 999999999 // Assuming 10 digits maximum
 *                 description: National Identification Number (8-10 digits).
 *               phoneNumber:
 *                 type: string
 *                 minLength: 11
 *                 description: The phone number of the user (minimum 11 digits).
 *               location:
 *                 type: string
 *                 description: (Optional) The location of the provider (required if signing up as a provider).
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request. Invalid input data or user/provider already exists.
 *       422:
 *         description: Unprocessable Entity. Validation errors (e.g., mismatched passwords, invalid input).
 */
Router.post('/signup',[
    body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email')
    ,
    body('name')
    .trim()
    .isLength({min:3})
    .withMessage('Not enough character')
    ,
    body('lastName')
    .trim()
    .isLength({min:3})
    .withMessage('Not enough character')
    ,
    body('password')
    .trim()
    .isLength({min:7})
    .withMessage('Not enough character')
    ,
    body('confirmPassword')
    .custom((value,{req})=>{
        if(value !== req.body.password){
            const error = new Error('Mismatched password')
            error.statusCode = 422;
            throw error;
        }
        return true
    }),
    body('NIDN')
    .trim()
    .isInt()
    .withMessage('invalid NIDN')
    .isLength({min:8,max:10})
    .withMessage('invalid NIDN'),
    body('phoneNumber')
    .isInt()
    .withMessage('Not a number.')
    .isLength({min:11})
    .withMessage('invalid phoneNumber'),
    body('image').optional()
    .trim()
    .isURL().withMessage('invalid image url'),
    body('uniqueImageId').optional()
    .isString().withMessage('invalid uniqueImageId')
],AuthController.Signup);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user (either a customer or provider) with their email and password. Returns an access token upon successful login.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 7
 *                 description: The user's password (minimum 7 characters).
 *     responses:
 *       200:
 *         description: Login successful. Returns an access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token for authentication.
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. Invalid credentials (wrong email or password).
 *       404:
 *         description: Not Found. User with the given email not found.
 *       500:
 *         description: Internal Server Error. Unexpected error during login.
 */
Router.post('/login',[
    body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email'),
    body('password')
    .trim()
    .isLength({min:7})
    .withMessage('Not enough character'),
],AuthController.Login);


/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Log out a user
 *     description: Logs the currently authenticated user out by setting `isLoggedIn` to false.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []   
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming logout.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       500:
 *         description: Internal Server Error. Unexpected error during logout.
 */
Router.delete('/logout',IsAuth,AuthController.Logout);


module.exports = Router;

