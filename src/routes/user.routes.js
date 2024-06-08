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
        assert(/@/.test(req.body.emailAdress), 'incorrect email')

        // Validate isActive
        assert(req.body.hasOwnProperty('isActive'), 'Missing isActive property')
        assert(
            typeof req.body.isActive === 'boolean',
            'isActive must be a boolean'
        )
        // Validate password
        assert(req.body.password, 'Missing password')
        assert(
            typeof req.body.password === 'string',
            'password must be a string'
        )
        assert(req.body.password.trim() !== '', 'password cannot be empty')
        assert(
            req.body.password.length >= 8,
            'password must be at least 8 characters long'
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
            /^[0-9]+$/.test(req.body.phoneNumber),
            'phoneNumber must contain only digits'
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

// Userroutes
router.post(
    '/api/user',
    checkUserExists,
    validateUserCreateChaiExpect,
    userController.create
)
// router.get(
//    '/api/user?field1=:value1&field2=:value2',
//    userController.searchUsers
// )

router.get('/api/user', userController.getAll)
router.get('/api/user/:userId', userController.getById)
router.get('/api/isActive', userController.getByIsActive)

// router.get('/api/user/isNotActive', userController.getByIsNotActive)

// Tijdelijke routes om niet bestaande routes op te vangen
router.put(
    '/api/user/:userId',
    validateUserCreateChaiExpect,
    userController.update
)
router.delete('/api/user/:userId', userController.deleteUser)

router.put('/api/user/:userId', notFound)
router.delete('/api/user/:userId', notFound)

module.exports = router
