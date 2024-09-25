const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const UserProfileController = require('../controller/UserProfile');



const Router = express.Router();


/**
 * @swagger
 * /profile/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile information of the currently authenticated user, including details based on their role (customer or provider).
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []   
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 type:
 *                   type: string
 *                   enum: [Customer, Provider]
 *                   description: The type of user ("Customer" or "Provider").
 *                 user:
 *                   oneOf:  
 *                     - $ref: '#/components/schemas/CustomerWithDetails'
 *                     - $ref: '#/components/schemas/ProviderWithDetails'
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       404:
 *         description: Not Found. User not found.
 *       500:
 *         description: Internal Server Error. Unexpected error.
 */
Router.get('/Profile',IsAuth,UserProfileController.GetProfile);

/**
 * @swagger
 * /profile/PProfile/edit: 
 *   put:
 *     summary: Edit provider profile
 *     description: Updates the profile information of the currently authenticated provider.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the provider.
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: The first name of the provider (minimum 3 characters).
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 description: The last name of the provider (minimum 3 characters).
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 7
 *                 description: The provider's password (minimum 7 characters).
 *               NIDN:
 *                 type: integer
 *                 minimum: 10000000 
 *                 maximum: 999999999 
 *                 description: National Identification Number (8-10 digits).
 *               phoneNumber:
 *                 type: string
 *                 minLength: 11
 *                 description: The phone number of the provider (minimum 11 digits).
 *               location:
 *                 type: string
 *                 description: The location of the provider.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The provider's profile image (file upload).
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request. Invalid input data or provider with the email already exists.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       422:
 *         description: Unprocessable Entity. Validation errors (e.g., invalid email format, insufficient characters in fields).
 *       500:
 *         description: Internal Server Error. Unexpected error during profile update.
 */
Router.put('/PProfile/edit',IsAuth,[
    body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email'),
    body('name')
    .trim()
    .isLength({min:3})
    .withMessage('Not enough character'),
    body('lastName')
    .trim()
    .isLength({min:3})
    .withMessage('Not enough character')
    ,
    body('password')
    .trim()
    .isLength({min:7})
    .withMessage('Not enough character'),
    body('location')
    .isString()
    .withMessage('Invalid Location'),
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
    .withMessage('invalid phoneNumber')
],UserProfileController.EditPProfile);


/**
 * @swagger
 * /profile/CProfile/edit: 
 *   put:
 *     summary: Edit customer profile
 *     description: Updates the profile information of the currently authenticated customer.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
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
 *               - NIDN
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the customer.
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: The first name of the customer (minimum 3 characters).
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 description: The last name of the customer (minimum 3 characters).
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 7
 *                 description: The customer's password (minimum 7 characters).
 *               NIDN:
 *                 type: integer
 *                 minimum: 10000000 
 *                 maximum: 999999999 
 *                 description: National Identification Number (8-10 digits).
 *               phoneNumber:
 *                 type: string
 *                 minLength: 11
 *                 description: The phone number of the customer (minimum 11 digits).
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request. Invalid input data or customer with the email already exists.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       422:
 *         description: Unprocessable Entity. Validation errors (e.g., invalid email format, insufficient characters in fields).
 *       500:
 *         description: Internal Server Error. Unexpected error during profile update.
 */
Router.put('/CProfile/edit',IsAuth,[
    body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email'),
    body('name')
    .trim()
    .isLength({min:3})
    .withMessage('Not enough character'),
    body('password')
    .trim()
    .isLength({min:7})
    .withMessage('Not enough character'),
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
    .withMessage('invalid phoneNumber')
],UserProfileController.EditCProfile);



module.exports = Router;