// index.js
const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const authRoutes = require('./src/routes/auth.routes').routes
const mealRoutes = require('./src/routes/meal.routes')
const logger = require('./src/util/logger')
require('dotenv').config()
const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())

const port = process.env.PORT || 3000

// Dit is een voorbeeld van een simpele route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        studentName: 'Ajsel Rguda',
        studentNumber: '2217774',
        name: 'My Nodejs Express server',
        version: '1.0',
        description:
            'This is a simple Nodejs Express server for the share-a-meal assignment '
    }
    res.json(info)
})

// Hier komen alle routes
console.log('Type of userRoutes:', typeof userRoutes) // Should log 'function'
console.log('Type of authRoutes:', typeof authRoutes) // Should log 'function'

app.use(userRoutes)
app.use(mealRoutes)
app.use('/api/auth', authRoutes)

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
