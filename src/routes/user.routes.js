// user.routes.js

const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const userService = require('../services/user.service')
const logger = require('../util/logger')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}
// Validation function to check if email address is unique
const validateUniqueEmail = (req, res, next) => {
    const email = req.body.emailAdress
    userService.getByEmail(email, (err, existingUser) => {
        if (err) {
            logger.error(
                'Error checking for existing user:',
                err.message || 'unknown error'
            )
            return next(err)
        }

        if (existingUser) {
            return next({
                status: 400,
                message: 'Email address already exists'
            })
        }

        next()
    })
}
// Input validation functions for user routes
const validateUserCreate = (req, res, next) => {
    if (!req.body.emailAdress || !req.body.firstName || !req.body.lastName) {
        next({
            status: 400,
            message: 'Missing email or password',
            data: {}
        })
    }
    next()
}

// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
    try {
        assert(req.body.emailAdress, 'Missing email')
        assert(req.body.firstName, 'Missing or incorrect first name')
        assert(req.body.lastName, 'Missing last name')
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Input validation function 2 met gebruik van assert
const validateUserCreateChaiShould = (req, res, next) => {
    try {
        req.body.firstName.should.not.be.empty.and.a('string')
        req.body.lastName.should.not.be.empty.and.a('string')
        req.body.emailAdress.should.not.be.empty.and.a('string').and.match(/@/)
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.not.be.empty
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        )
        assert(req.body.lastName, 'Missing or incorrect lastName field')
        chai.expect(req.body.lastName).to.not.be.empty
        chai.expect(req.body.lastName).to.be.a('string')
        chai.expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'lastName must be a string'
        )
        assert(req.body.emailAddress, 'Missing or incorrect email')
        chai.expect(req.body.emailAddress).to.not.be.empty
        chai.expect(req.body.emailAddress).to.be.a('string')
        chai.expect(req.body.emailAddress).to.match(/@/)

        assert(req.body.hasOwnProperty('isActive'), 'Missing isActive property')
        assert(
            typeof req.body.isActive === 'boolean',
            'isActive must be a boolean'
        )

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

// Userroutes
router.post(
    '/api/user',

    validateUserCreateChaiExpect,
    userController.create
)
router.get(
    '/api/user?field1=:value1&field2=:value2',
    userController.searchUsers
)

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
