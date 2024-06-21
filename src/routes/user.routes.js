// user.routes.js

const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const userService = require('../services/user.service')
const logger = require('../util/logger')
const authController = require('../services/auth.service')
const validateToken = require('./auth.routes').validateToken

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        // Validate firstName
        assert(req.body.firstName, 'Missing firstName')
        assert(
            typeof req.body.firstName === 'string',
            'firstName must be a string'
        )
        assert(req.body.firstName.trim() !== '', 'firstName cannot be empty')
        assert(
            /^[a-zA-Z]+$/.test(req.body.firstName),
            'firstName must contain only letters'
        )

        // Validate lastName
        assert(req.body.lastName, 'Missing lastName')
        assert(
            typeof req.body.lastName === 'string',
            'lastName must be a string'
        )
        assert(req.body.lastName.trim() !== '', 'lastName cannot be empty')
        assert(
            /^[a-zA-Z]+$/.test(req.body.lastName),
            'lastName must contain only letters'
        )

        // Validate emailAdress
        assert(req.body.emailAdress, 'Missing emailAdress')
        assert(
            typeof req.body.emailAdress === 'string',
            'emailAdress must be a string'
        )
        assert(
            req.body.emailAdress.trim() !== '',
            'emailAdress cannot be empty'
        )
        assert(
            /^[a-zA-Z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(
                req.body.emailAdress
            ),
            'incorrect email'
        )

        // Validate password
        assert(req.body.password, 'Missing password')
        assert(
            typeof req.body.password === 'string',
            'password must be a string'
        )
        assert(req.body.password.trim() !== '', 'password cannot be empty')
        assert(
            /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(
                req.body.password
            ),
            'password must be at least 8 characters long, contain at least one uppercase letter, and contain at least one digit'
        )

        // Validate phoneNumber
        assert(req.body.phoneNumber, 'Missing phone number')
        assert(
            typeof req.body.phoneNumber === 'string',
            'phoneNumber must be a string'
        )
        assert(
            req.body.phoneNumber.trim() !== '',
            'phoneNumber cannot be empty'
        )
        assert(
            /^06[-\s]?\d{8}$/.test(req.body.phoneNumber),
            'phoneNumber must be in the format 06-12345678, 06 12345678 or 0612345678'
        )

        // Validate street
        assert(req.body.street, 'Missing street')
        assert(typeof req.body.street === 'string', 'street must be a string')
        assert(req.body.street.trim() !== '', 'street cannot be empty')

        // Validate city
        assert(req.body.city, 'Missing city')
        assert(typeof req.body.city === 'string', 'city must be a string')
        assert(req.body.city.trim() !== '', 'city cannot be empty')

        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
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
const validateUpdateUser = (req, res, next) => {
    const { userId } = req.params
    const loggedInUserId = req.userId // Gebruik req.userId zoals ingesteld door validateToken

    if (userId !== loggedInUserId.toString()) {
        return res.status(403).json({
            status: 403,
            message: "You are not allowed to alter this user's data",
            data: {}
        })
    }

    next()
}
const validateUserExists = (req, res, next) => {
    const { userId } = req.params

    // Roep de userService aan om te controleren of de gebruiker bestaat
    userService.getById(userId, (error, user) => {
        if (error) {
            return next({
                status: error.status,
                message: error.message,
                data: {}
            })
        }

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
                data: {}
            })
        }

        // Als de gebruiker bestaat, ga dan door naar de volgende middleware/controller
        next()
    })
}

// Userroutes
router.post(
    '/api/user',
    checkUserExists,
    validateUserCreateChaiExpect,
    userController.create
)

router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateToken, userController.getById)

// Tijdelijke routes om niet bestaande routes op te vangen
router.put(
    '/api/user/:userId',
    validateToken,
    validateUserCreateChaiExpect,
    validateUserExists,
    validateUpdateUser,
    userController.update
)
router.delete(
    '/api/user/:userId',
    validateToken,
    validateUserExists,
    validateUpdateUser,
    userController.deleteUser
)

module.exports = router
