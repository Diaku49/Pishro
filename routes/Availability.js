const express = require('express');
const {body} = require('express-validator');
const IsAuth = require('../MiddleWare/IsAuth');
const AvailabilityController = require('../controller/Availability');



const Router = express.Router();

Router.get('/allAvailability',IsAuth,AvailabilityController.getAllAvail);

Router.get('/allAvailability/service/:serviceId',IsAuth,AvailabilityController.getAllAvailByService);

/**
 * @swagger
 * /availability/add/{serviceId}:
 *   post:
 *     summary: Add availability for a service
 *     description: Allows authenticated providers to add available time slots for a specific service they own. The endpoint checks for time conflicts before creating the availability.
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the service to add availability for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: The day of the week (0 for Sunday, 1 for Monday, etc.).
 *               startTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2400 // 24-hour format (e.g., 1430 for 2:30 PM)
 *                 description: The start time in 24-hour format.
 *               endTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2400 // 24-hour format
 *                 description: The end time in 24-hour format.
 *     responses:
 *       201:
 *         description: Availability created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 newAvailability:
 *                   $ref: '#/components/schemas/Availability'
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       403:
 *         description: Forbidden. User is not the owner of the service or time conflicts exist.
 *       422:
 *         description: Unprocessable Entity. Validation errors.
 *       500:
 *         description: Internal Server Error. Unexpected error during availability creation.
 */
Router.post('/add/:serviceId',IsAuth,[
    body('dayOfWeek')
    .trim()
    .isInt({min:0,max:6})
    .withMessage('invalid Day.'),
    body('startTime')
    .trim()
    .isInt({min:0,max:24})
    .withMessage('invalid Stime'),
    body('endTime')
    .trim()
    .isInt({min:0,max:24})
    .withMessage('invalid Etime'),
],AvailabilityController.createAvail);

/**
 * @swagger
 * /availability/edit/{availId}/service/{serviceId}:
 *   put:
 *     summary: Edit availability
 *     description: Allows authenticated providers to edit the time slot for a specific availability of a service they own.
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the availability to update.
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the service the availability belongs to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: The day of the week (0 for Sunday, 1 for Monday, etc.).
 *               startTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2400 // 24-hour format (e.g., 1430 for 2:30 PM)
 *                 description: The start time in 24-hour format.
 *               endTime:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 2400 // 24-hour format
 *                 description: The end time in 24-hour format.
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 updatedAvailability:
 *                   $ref: '#/components/schemas/Availability'
 *       400:
 *         description: Bad Request. Invalid input data.
 *       401:
 *         description: Unauthorized. No valid authentication token provided.
 *       403:
 *         description: Forbidden. User is not the owner of the service or time conflicts exist.
 *       404:
 *         description: Not Found. Availability or service not found.
 *       409:
 *         description: Conflict. The new time slot conflicts with an existing availability for the same provider.
 *       422:
 *         description: Unprocessable Entity. Validation errors.
 *       500:
 *         description: Internal Server Error. Unexpected error during availability update.
 */
Router.put('/edit/:availId/service/:serviceId',IsAuth,[
    body('dayOfWeek')
    .trim()
    .isInt({min:0,max:6})
    .withMessage('invalid Day.'),
    body('startTime')
    .trim()
    .isInt({min:0,max:24})
    .withMessage('invalid Stime'),
    body('endTime')
    .trim()
    .isInt({min:0,max:24})
    .withMessage('invalid Etime'),
],AvailabilityController.editAvail);


/**
 * @swagger
 * /availability/delete/{availId}/service/{serviceId}:
 *   delete:
 *     summary: Delete availability
 *     description: Allows authenticated providers to delete a specific availability for a service they own.
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the availability to delete.
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the service the availability belongs to.
 *     responses:
 *       200:
 *         description: Availability deleted successfully
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
 *         description: Forbidden. User is not the owner of the service.
 *       404:
 *         description: Not Found. Availability or service not found.
 *       500:
 *         description: Internal Server Error. Unexpected error during deletion.
 */
Router.delete('/delete/:availId/service/:serviceId',IsAuth,AvailabilityController.deleteAvail);


module.exports = Router;