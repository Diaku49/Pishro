const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const ServiceController = require('../controller/Service');
const { serializeUser } = require('passport');



const Router = express.Router();


Router.get('/services',IsAuth,ServiceController.GetServices);

Router.get('/search/services',IsAuth,ServiceController.searchServices);

Router.get('/servicesP/:providerName',IsAuth,[
    body('name')
    .trim()
    .isString()
    .withMessage('invalid name.')
],)

Router.get('/serviceDetail/:serviceId',IsAuth,ServiceController.ServiceDetail);


/**
 * @swagger
 * /service/add:
 *   post:
 *     summary: Create a new service
 *     description: Allows authenticated providers to create a new service offering.
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []   
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data: 
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - title
 *               - description
 *               - location
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: The name of the service (minimum 2 characters).
 *               title:
 *                 type: string
 *                 enum:  
 *                   - healthcareServices
 *                   - carpetCleaning
 *                   - hairCut
 *                   - electricalWiring
 *                   - gasPiping
 *                   - applianceRepair
 *                   - pipeFitting
 *                   - HeatingSystemInstallation
 *                   - CleaningService
 *                 description: The title/category of the service.
 *               serviceType:
 *                 type: string
 *                 enum: [OneTimeFeeService, HourlyRateService]
 *                 description: The type of service pricing (one-time fee or hourly rate).
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 110
 *                 description: A detailed description of the service (10-110 characters).
 *               location:
 *                 type: string
 *                 description: The location where the service is offered.
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 1 
 *                 description: The price of the service (must be at least 1).
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image representing the service (file upload).
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 service:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created service.
 *                     title:
 *                       type: string
 *                       description: The title of the newly created service.
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       403:
 *         description: Forbidden. Only providers can create services.
 *       422:
 *         description: Unprocessable Entity. Validation errors.
 *       500:
 *         description: Internal Server Error. Unexpected error during service creation.
 */
Router.post('/add',IsAuth,[
    body('name')
    .trim()
    .isLength({min:2})
    .withMessage('Invalid name'),
    body('title')
    .trim()
    .isLength({min:3})
    .withMessage('Invalid title'),
    body('description')
    .trim()
    .isLength({min:10,max:110})
    .withMessage('invalid description'),
    body('location')
    .trim()
    .isString()
    .withMessage('Invalid Location'),
    body('price')
    .trim()
    .isFloat({min:1})
    .withMessage('invalid price.')
],ServiceController.CreateService);


/**
 * @swagger
 * /service/edit/{serviceId}:
 *   put:
 *     summary: Edit an existing service
 *     description: Allows authenticated providers to update the details of a service they own.
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []   
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the service to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data: 
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: The name of the service (minimum 2 characters).
 *               title:
 *                 type: string
 *                 enum:  
 *                   - healthcareServices
 *                   - carpetCleaning
 *                   - hairCut
 *                   - electricalWiring
 *                   - gasPiping
 *                   - applianceRepair
 *                   - pipeFitting
 *                   - HeatingSystemInstallation
 *                   - CleaningService
 *                 description: The title/category of the service.
 *               serviceType:
 *                 type: string
 *                 enum: [OneTimeFeeService, HourlyRateService]
 *                 description: The type of service pricing (one-time fee or hourly rate).
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 110
 *                 description: A detailed description of the service (10-110 characters).
 *               location:
 *                 type: string
 *                 description: The location where the service is offered.
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 1 
 *                 description: The price of the service (must be at least 1).
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: (Optional) New image for the service (file upload). If not provided, the existing image will be retained.
 *     responses:
 *       200:
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming the update.
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       403:
 *         description: Forbidden. User is not authorized to edit this service (not the provider).
 *       404:
 *         description: Not Found. Service not found.
 *       422:
 *         description: Unprocessable Entity. Validation errors.
 *       500:
 *         description: Internal Server Error. Unexpected error during service update.
 */
Router.put('/edit/:serviceId',IsAuth,[
    body('name')
    .trim()
    .isLength({min:2})
    .withMessage('Invalid name'),
    body('title')
    .trim()
    .isLength({min:3})
    .withMessage('Invalid title'),
    body('description')
    .trim()
    .isLength({min:10,max:110})
    .withMessage('invalid description'),
    body('location')
    .isString()
    .withMessage('Invalid Location'),
    body('price')
    .trim()
    .isFloat({min:1})
    .withMessage('invalid price.')
],ServiceController.EditService);


/**
 * @swagger
 * /service/delete/{serviceId}:
 *   delete:
 *     summary: Delete a service
 *     description: Allows authenticated providers to delete a service they own.
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the service to delete.
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming the deletion.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       403:
 *         description: Forbidden. User is not authorized to delete this service (not the provider).
 *       404:
 *         description: Not Found. Service not found.
 *       500:
 *         description: Internal Server Error. Unexpected error during service deletion.
 */
Router.delete('/delete/:serviceId',IsAuth,ServiceController.DeleteService);


module.exports = Router;