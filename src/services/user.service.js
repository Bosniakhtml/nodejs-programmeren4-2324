// user.service.js
const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    getAll: (callback) => {
        logger.info('getAll')

        // Deprecated: de 'oude' manier van werken, met de inmemory database
        // database.getAll((err, data) => {
        //     if (err) {
        //         callback(err, null)
        //     } else {
        //         callback(null, {
        //             message: `Found ${data.length} users.`,
        //             data: data
        //         })
        //     }
        // })

        // Nieuwe manier van werken: met de MySQL database
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user`',
                function (error, results, fields) {
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
                }
            )
        })
    },
    /*
    getById: (userId, callback) => {
        logger.info('getById', userId)
        database.getById(userId, (err, data) => {
            if (err) {
                logger.info(
                    'error fetching user:',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User found with id ${data.id}.`)
                callback(null, {
                    message: `User found with id ${data.id}.`,
                    data: data
                })
            }
        })
    } /*
    getIsActive: (callback) => {
        logger.info('getIsActive')
        database.getAll((err, users) => {
            if (err) {
                logger.error(
                    'Error getting users:',
                    err.message || 'unknown error'
                )
                return callback(err, null)
            }
            const activeUsers = users.filter((user) => user.isActive)
            callback(null, {
                message: `Found ${activeUsers.length} active users.`,
                data: activeUsers
            })
        })
    },

    update: (userId, userData, callback) => {
        logger.info('Updating user with id', userId)
        database.getById(userId, (err, existingUser) => {
            if (err) {
                logger.error(
                    'Error fetching user:',
                    err.message || 'unknown error'
                )
                return callback(err, null)
            }
            if (!existingUser) {
                return callback(
                    { status: 404, message: 'User not found' },
                    null
                )
            }
            // Check if the logged-in user is the owner of the data
            //  if (existingUser.id !== userData.id) {
            //    return callback({ status: 403, message: 'Unauthorized' }, null)
            // }
            // Update user data
            Object.assign(existingUser, userData)
            database.update(existingUser, (err, updatedUser) => {
                if (err) {
                    logger.error(
                        'Error updating user:',
                        err.message || 'unknown error'
                    )
                    return callback(err, null)
                }
                logger.trace('User updated with id', updatedUser.id)
                callback(null, {
                    status: 200,
                    message: `User with id ${updatedUser.id} updated successfully`,
                    data: updatedUser
                })
            })
        })
    },

    searchUsers: (field1, field2, callback) => {
        // Roep de database aan om gebruikers op te halen op basis van de opgegeven criteria
        database.searchUsers(field1, field2, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found ${data.length} users matching the criteria.`,
                    data: data
                })
            }
        })
    },

    delete: (userId, callback) => {
        logger.info('Deleting user with id', userId)
        database.getById(userId, (err, existingUser) => {
            if (err) {
                logger.error(
                    'Error fetching user:',
                    err.message || 'unknown error'
                )
                return callback(err, null)
            }
            if (!existingUser) {
                return callback(
                    { status: 404, message: 'User not found' },
                    null
                )
            }
            database.delete(userId, (err) => {
                if (err) {
                    logger.error(
                        'Error deleting user:',
                        err.message || 'unknown error'
                    )
                    return callback(err, null)
                }
                logger.trace('User deleted with id', userId)
                callback(null, {
                    status: 200,
                    message: `User with id ${userId} deleted successfully`
                })
            })
        })
    },*/

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
                'SELECT * FROM `user` WHERE id = ?',
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

    update: (user, callback) => {
        logger.info(`update: ${user.id}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(err, null)
            }
            connection.query(
                'UPDATE `user` SET ? WHERE id = ?',
                [user, user.id],
                (error) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error, null)
                    }
                    return callback(null, user)
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
                return callback(err)
            }
            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                [userId],
                (error) => {
                    connection.release()
                    if (error) {
                        logger.error(error)
                        return callback(error)
                    }
                    return callback(null)
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
    }
}

module.exports = userService
