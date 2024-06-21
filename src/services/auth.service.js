const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authService = {
    login: (userCredentials, callback) => {
        logger.debug('login')

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return callback(
                    { status: 500, message: 'Database connection error' },
                    null
                )
            }
            if (connection) {
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [userCredentials.emailAdress],
                    (err, rows) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            return callback(
                                {
                                    status: 500,
                                    message: 'Database query error'
                                },
                                null
                            )
                        }
                        if (rows && rows.length === 1) {
                            if (rows[0].password == userCredentials.password) {
                                logger.debug(
                                    'Passwords match, sending userinfo and valid token'
                                )
                                const { password, ...userinfo } = rows[0]
                                const payload = { userId: userinfo.id }

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '12d' },
                                    (err, token) => {
                                        if (err) {
                                            return callback(
                                                {
                                                    status: 500,
                                                    message:
                                                        'Token generation error'
                                                },
                                                null
                                            )
                                        }
                                        callback(null, {
                                            status: 200,
                                            message: 'User logged in',
                                            data: { ...userinfo, token }
                                        })
                                    }
                                )
                            } else {
                                logger.debug('Invalid password')
                                callback(
                                    {
                                        status: 400,
                                        message: 'Invalid password',
                                        data: {}
                                    },
                                    null
                                )
                            }
                        } else {
                            logger.debug('User not found')
                            callback(
                                {
                                    status: 404,
                                    message: 'User not found',
                                    data: {}
                                },
                                null
                            )
                        }
                    }
                )
            }
        })
    }
}

module.exports = authService
