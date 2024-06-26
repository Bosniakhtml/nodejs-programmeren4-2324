const mealService = require('../services/meal.service')
const logger = require('../util/logger')

let mealController = {
    create: (req, res, next) => {
        const meal = {
            ...req.body,
            cookId: req.userId // Assuming req.userId is set by validateToken middleware
        }
        logger.info('Creating meal', meal.name)
        mealService.create(meal, (error, success) => {
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
                    message: 'Meal created successfully',
                    data: success
                })
            }
        })
    },
    getAll: (req, res, next) => {
        logger.trace('getAll meals')
        mealService.getAll(req, (error, success) => {
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
        const mealId = req.params.mealId
        logger.trace('mealController: getById', mealId)
        mealService.getById(mealId, (error, success) => {
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
                    message: 'meal data retrieved successfully',
                    data: success
                })
            }
        })
    },
    deleteMeal: (req, res, next) => {
        const mealId = req.params.mealId
        logger.info('Deleting meal with id', mealId)
        mealService.delete(mealId, (error, success) => {
            if (error) {
                logger.error('Error deleting meal:', error)
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                logger.info('meal deleted successfully:', success)
                res.status(200).json({
                    status: 200,
                    message: 'meal deleted successfully',
                    data: success
                })
            }
        })
    },
    update: (req, res, next) => {
        const mealId = req.params.mealId
        const mealData = req.body

        logger.info('Updating meal with id', mealId)

        // Convert allergens array to a comma-separated string if it exists
        if (mealData.allergenes && Array.isArray(mealData.allergenes)) {
            mealData.allergenes = mealData.allergenes.join(',')
        }

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

            mealService.update(mealId, mealData, (error, success) => {
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
                        message: 'Meal updated successfully',
                        data: success
                    })
                }
            })
        })
    }
}
module.exports = mealController
