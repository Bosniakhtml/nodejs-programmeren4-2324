// user.service.js
const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const userService = {
    create: (user, callback) => {
        // Check if email address already exists
        // database.getByEmail(user.emailAddress, (err, existingUser) => {
        //     if (err) {
        //         logger.error(
        //             'Error checking for existing user:',
        //             err.message || 'unknown error'
        //         )
        //         return callback(err, null)
        //     }

        //     if (existingUser !== null) {
        //         // User with the same email address already exists
        //         logger.error(
        //             'Error creating user: Email address already exists'
        //         )
        //         return callback(
        //             { status: 400, message: 'Email address already exists' },
        //             null
        //         )
        //     }
        // })

        // Email address is unique, proceed with creating the user
        logger.info('Creating user:', user)
        database.add(user, (err, data) => {
            if (err) {
                logger.error(
                    'Error creating user:',
                    err.message || 'unknown error'
                )
                return callback(err, null)
            }
            logger.trace('User created with id', data.id)
            callback(null, {
                message: `User created with id ${data.id}.`,
                data: data
            })
        })
    },
    getAll: (callback) => {
        logger.info('getAll')
        database.getAll((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found ${data.length} users.`,
                    data: data
                })
            }
        })
    },

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
    },
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
    }
}

module.exports = userService
