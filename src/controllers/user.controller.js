const userService = require('../services/user.service')
const logger = require('../util/logger')
const mealService = require('../services/meal.service')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(201).json({
                    status: 201,
                    message: 'User created successfully',
                    data: success
                })
            }
        })
    },

    getAll: (req, res, next) => {
        logger.trace('getAll')
        userService.getAll(req, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getById: (req, res, next) => {
        const userId = req.params.userId
        logger.trace('userController: getById', userId)
        userService.getById(userId, (error, user) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (user) {
                mealService.getMealsByCookId(userId, (mealError, meals) => {
                    if (mealError) {
                        return next({
                            status: mealError.status,
                            message: mealError.message,
                            data: {}
                        })
                    }
                    res.status(200).json({
                        status: 200,
                        message: 'User data retrieved successfully',
                        data: {
                            user,
                            meals
                        }
                    })
                })
            }
        })
    },

    getByIsActive: (req, res, next) => {
        userService.getIsActive((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    // user.controller.js
    update: (req, res, next) => {
        const userId = req.params.userId
        const userData = req.body

        logger.info('Updating user with id', userId)

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

            userService.update(userId, userData, (error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }

                if (success) {
                    res.status(200).json({
                        status: 200,
                        message: 'User updated successfully',
                        data: success
                    })
                }
            })
        })
    },

    deleteUser: (req, res, next) => {
        const userId = req.params.userId
        logger.info('Deleting user with id', userId)
        userService.delete(userId, (error, success) => {
            if (error) {
                logger.error('Error deleting user:', error)
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                logger.info('User deleted successfully:', success)
                res.status(200).json({
                    status: 200,
                    message: 'User deleted successfully',
                    data: success
                })
            }
        })
    },

    searchUsers: (req, res, next) => {
        const { field1, field2 } = req.query
        userService.searchUsers(field1, field2, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getProfile: (req, res, next) => {
        const userId = req.userId
        logger.trace('getProfile for userId', userId)
        userService.getProfile(userId, (error, user) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (user) {
                mealService.getMealsByCookId(userId, (mealError, meals) => {
                    if (mealError) {
                        return next({
                            status: mealError.status,
                            message: mealError.message,
                            data: {}
                        })
                    }
                    res.status(200).json({
                        status: 200,
                        message: 'User profile retrieved successfully',
                        data: {
                            user,
                            meals
                        }
                    })
                })
            }
        })
    }
}

module.exports = userController
