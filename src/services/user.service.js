const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    getAll: (req, callback) => {
        logger.info('getAll')
        const {
            id,
            firstName,
            lastName,
            isActive,
            emailAdress,
            password,
            phoneNumber,
            roles,
            street,
            city
        } = req.query
        console.log(`Query params: ${JSON.stringify(req.query)}`)

        // List of valid fields
        const validFields = [
            'id',
            'firstName',
            'lastName',
            'isActive',
            'emailAdress',
            'password',
            'phoneNumber',
            'roles',
            'street',
            'city'
        ]

        // Check for invalid fields
        for (const param in req.query) {
            if (!validFields.includes(param)) {
                logger.warn(`Invalid field: ${param}`)
                callback(null, {
                    message: `No users found.`,
                    data: []
                })
                return
            }
        }

        let queryString =
            'SELECT id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city FROM `user`'
        const queryConditions = []

        // Add conditions based on query parameters
        if (id) queryConditions.push(`id = '${id}'`)
        if (firstName) queryConditions.push(`firstName = '${firstName}'`)
        if (lastName) queryConditions.push(`lastName = '${lastName}'`)
        if (isActive) queryConditions.push(`isActive = '${isActive}'`)
        if (emailAdress) queryConditions.push(`emailAdress = '${emailAdress}'`)
        if (password) queryConditions.push(`password = '${password}'`)
        if (phoneNumber) queryConditions.push(`phoneNumber = '${phoneNumber}'`)
        if (roles) queryConditions.push(`roles = '${roles}'`)
        if (street) queryConditions.push(`street = '${street}'`)
        if (city) queryConditions.push(`city = '${city}'`)

        // If there are any conditions, add them to the query string
        if (queryConditions.length > 0) {
            queryString += ' WHERE ' + queryConditions.join(' AND ')
        }
        queryString += ';'
        console.log(queryString)

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
                        message: `Found ${results.length} users.`,
                        data: results
                    })
                }
            })
        })
    },

    //
    //
    //
    //
    //
    //
    //

    getById: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
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
                'SELECT id, firstName, lastName, isActive, roles, emailAdress, phoneNumber, street, city FROM `user` WHERE id = ?',
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

    isEmailAvailable: (email, callback) => {
        logger.info(`isEmailAvailable: ${email}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'SELECT * FROM `user` WHERE emailAdress = ?',
                [email],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    return callback(null, results.length === 0)
                }
            )
        })
    },

    create: (item, callback) => {
        logger.info('add')
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'INSERT INTO `user` SET ?',
                item,
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    item.id = results.insertId
                    return callback(null, item)
                }
            )
        })
    },

    update: (userId, userData, callback) => {
        logger.info(`update: ${userId}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'UPDATE `user` SET ? WHERE id = ?',
                [userData, userId],
                (error) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    return callback(null, userData)
                }
            )
        })
    },

    searchUsers: (field1, field2, callback) => {
        logger.info(`searchUsers: ${field1}, ${field2}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'SELECT * FROM `user` WHERE ?? = ? AND ?? = ?',
                [field1, field1, field2, field2],
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
    },

    delete: (userId, callback) => {
        logger.info(`delete: ${userId}`)
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
                'DELETE FROM `user` WHERE id = ?',
                [userId],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback({
                            status: 500,
                            message: 'Error deleting user',
                            data: {}
                        })
                    }
                    if (results.affectedRows === 0) {
                        return callback({
                            status: 404,
                            message: 'User not found',
                            data: {}
                        })
                    }
                    return callback(null, {}) // Return only necessary data
                }
            )
        })
    },

    isEmailAvailable: (email, callback) => {
        logger.info(`isEmailAvailable: ${email}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'SELECT * FROM `user` WHERE emailAdress = ?',
                [email],
                (error, results) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    return callback(null, results.length === 0)
                }
            )
        })
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    }
}

module.exports = userService
