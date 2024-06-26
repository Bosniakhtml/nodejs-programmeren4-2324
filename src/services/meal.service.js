const db = require('../dao/mysql-db') // Assuming a database utility module
const logger = require('../util/logger')

const mealService = {
    create: (meal, callback) => {
        logger.info('Creating meal in the database')
        const query = `
            INSERT INTO meal
            (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, allergenes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `

        const values = [
            meal.name,
            meal.description,
            meal.isActive,
            meal.isVega,
            meal.isVegan,
            meal.isToTakeHome,
            new Date(meal.dateTime),
            meal.maxAmountOfParticipants,
            meal.price,
            meal.imageUrl,
            meal.cookId,
            JSON.stringify(meal.allergenes)
        ]

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(query, values, (error, results) => {
                connection.release()
                if (error) {
                    logger.error(error)
                    callback(error, null)
                    return
                }

                const createdMeal = {
                    id: results.insertId,
                    ...meal
                }

                logger.info(
                    'Meal successfully created with id: ',
                    results.insertId
                )
                callback(null, createdMeal)
            })
        })
    },
    getAll: (req, callback) => {
        logger.info('getAll meals')

        let queryString = 'SELECT id, name, description, price FROM `meal`;'

        // Nieuwe manier van werken: met de MySQL database
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(queryString, function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    logger.debug(results)
                    callback(null, {
                        message: `Meals retrieved successfully`,
                        data: results
                    })
                }
            })
        })
    },
    getById: (id, callback) => {
        logger.info(`getById: ${id}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'SELECT * FROM `meal` WHERE id = ?',
                [id],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    if (results.length === 0) {
                        return callback(
                            {
                                status: 404,
                                message: `Error: id ${id} does not exist!`
                            },
                            null
                        )
                    }
                    return callback(null, results[0])
                }
            )
        })
    },
    delete: (mealId, callback) => {
        logger.info(`delete: ${mealId}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback({
                    status: 500,
                    message: 'Database connection error',
                    data: {}
                })
            }
            connection.query(
                'DELETE FROM `meal` WHERE id = ?',
                [mealId],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback({
                            status: 500,
                            message: 'Error deleting meal',
                            data: {}
                        })
                    }
                    if (results.affectedRows === 0) {
                        return callback({
                            status: 404,
                            message: 'meal not found',
                            data: {}
                        })
                    }
                    return callback(null, {}) // Return only necessary data
                }
            )
        })
    },
    update: (mealId, mealData, callback) => {
        logger.info(`update: ${mealId}`)

        // Convert allergens array to a comma-separated string if it exists
        if (mealData.allergenes && Array.isArray(mealData.allergenes)) {
            mealData.allergenes = mealData.allergenes.join(',')
        }

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            const sql = `UPDATE meal SET 
                            name = ?, 
                            description = ?, 
                            isActive = ?, 
                            isVega = ?, 
                            isVegan = ?, 
                            isToTakeHome = ?, 
                            dateTime = ?, 
                            maxAmountOfParticipants = ?, 
                            price = ?, 
                            imageUrl = ?, 
                            allergenes = ? 
                        WHERE id = ?`

            const params = [
                mealData.name,
                mealData.description,
                mealData.isActive,
                mealData.isVega,
                mealData.isVegan,
                mealData.isToTakeHome,
                mealData.dateTime,
                mealData.maxAmountOfParticipants,
                mealData.price,
                mealData.imageUrl,
                mealData.allergenes,
                mealId
            ]

            connection.query(sql, params, (error, results) => {
                connection.release()
                if (error) {
                    logger.error(error)
                    return callback(error, null)
                }
                return callback(null, mealData)
            })
        })
    },
    getMealsByCookId: (cookId, callback) => {
        logger.info(`getMealsByCookId: ${cookId}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'SELECT id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes ' +
                    'FROM `meal` WHERE cookId = ? AND dateTime >= NOW()',
                [cookId],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    return callback(null, results)
                }
            )
        })
    }
}

module.exports = mealService
