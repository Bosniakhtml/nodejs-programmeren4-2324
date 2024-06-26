// meal.routes.js

const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const mealService = require('../services/meal.service')
const userService = require('../services/user.service')
const logger = require('../util/logger')
const authController = require('../services/auth.service')
const validateToken = require('./auth.routes').validateToken
const userRoutes = require('../routes/user.routes')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

const validateMealCreateChaiExpect = (req, res, next) => {
    try {
        // Validate name
        assert(req.body.name, 'Missing name')
        assert(typeof req.body.name === 'string', 'name must be a string')
        assert(req.body.name.trim() !== '', 'name cannot be empty')

        // Validate description
        assert(req.body.description, 'Missing description')
        assert(
            typeof req.body.description === 'string',
            'description must be a string'
        )
        assert(
            req.body.description.trim() !== '',
            'description cannot be empty'
        )

        // Validate isActive
        assert(
            typeof req.body.isActive === 'boolean',
            'isActive must be a boolean'
        )

        // Validate isVega
        assert(typeof req.body.isVega === 'boolean', 'isVega must be a boolean')

        // Validate isVegan
        assert(
            typeof req.body.isVegan === 'boolean',
            'isVegan must be a boolean'
        )

        // Validate isToTakeHome
        assert(
            typeof req.body.isToTakeHome === 'boolean',
            'isToTakeHome must be a boolean'
        )

        // Validate dateTime
        assert(req.body.dateTime, 'Missing dateTime')
        assert(
            !isNaN(Date.parse(req.body.dateTime)),
            'dateTime must be a valid date-time string'
        )

        // Validate maxAmountOfParticipants
        assert(
            req.body.maxAmountOfParticipants,
            'Missing maxAmountOfParticipants'
        )
        assert(
            typeof req.body.maxAmountOfParticipants === 'number',
            'maxAmountOfParticipants must be a number'
        )
        assert(
            Number.isInteger(req.body.maxAmountOfParticipants),
            'maxAmountOfParticipants must be an integer'
        )
        assert(
            req.body.maxAmountOfParticipants > 0,
            'maxAmountOfParticipants must be greater than 0'
        )

        // Validate price
        assert(req.body.price, 'Missing price')
        assert(typeof req.body.price === 'number', 'price must be a number')
        assert(req.body.price > 0, 'price must be greater than 0')

        // Validate imageUrl
        assert(req.body.imageUrl, 'Missing imageUrl')
        assert(
            typeof req.body.imageUrl === 'string',
            'imageUrl must be a string'
        )
        assert(req.body.imageUrl.trim() !== '', 'imageUrl cannot be empty')
        assert(
            /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(req.body.imageUrl),
            'imageUrl must be a valid URL pointing to an image'
        )

        // Validate allergenes
        //        assert(
        //            typeof req.body.allergenes === 'string',
        //            'allergenes must be a string'
        //        )

        // Validate participants
        // assert(
        //     Array.isArray(req.body.participants),
        //     'participants must be an array'
        // )
        // Add the userId from the validated token to the request body
        req.body.cookId = req.userId

        logger.trace('Meal successfully validated')
        next()
    } catch (ex) {
        logger.trace('Meal validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const checkUserExists = async (req, res, next) => {
    try {
        const emailAvailable = await userService.isEmailAvailable(
            req.body.emailAdress,
            (err, isAvailable) => {
                if (err) {
                    return next({
                        status: 500,
                        message: err.message,
                        data: {}
                    })
                }
                if (!isAvailable) {
                    return res.status(403).json({
                        status: 403,
                        message: 'User with this email address already exists',
                        data: {}
                    })
                }
                next()
            }
        )
    } catch (err) {
        next({
            status: 500,
            message: err.message,
            data: {}
        })
    }
}

const validateMealOwner = (req, res, next) => {
    const { mealId } = req.params
    const loggedInUserId = req.userId

    mealService.getById(mealId, (error, meal) => {
        if (error) {
            return next({
                status: error.status,
                message: error.message,
                data: {}
            })
        }

        if (!meal) {
            return res.status(404).json({
                status: 404,
                message: 'Meal not found',
                data: {}
            })
        }

        if (meal.cookId !== loggedInUserId) {
            return res.status(403).json({
                status: 403,
                message: 'You are not the owner of this meal',
                data: {}
            })
        }

        // Attach meal to request object for further processing if needed
        req.meal = meal
        next()
    })
}

const validateMealExists = (req, res, next) => {
    const { mealId } = req.params

    // Roep de mealService aan om te controleren of de meal bestaat
    mealService.getById(mealId, (error, meal) => {
        if (error) {
            return next({
                status: error.status,
                message: error.message,
                data: {}
            })
        }

        if (!meal) {
            return res.status(404).json({
                status: 404,
                message: 'meal not found',
                data: {}
            })
        }

        // Als de gebruiker bestaat, ga dan door naar de volgende middleware/controller
        next()
    })
}
// mealroutes
router.post(
    '/api/meal',
    //     checkUserExists,
    validateToken,
    validateMealCreateChaiExpect,
    mealController.create
)
router.get('/api/meal', mealController.getAll)

router.get('/api/meal/:mealId', mealController.getById)

router.put(
    '/api/meal/:mealId',
    validateToken,
    validateMealCreateChaiExpect,
    validateMealExists,
    validateMealOwner,
    mealController.update
)

router.delete(
    '/api/meal/:mealId',
    validateToken,
    validateMealExists,
    validateMealOwner,
    mealController.deleteMeal
)

module.exports = router
