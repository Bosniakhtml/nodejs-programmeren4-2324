const jwt = require('jsonwebtoken')

const privateKey = 'secretstring'

jwt.sign({ foo: 'bar' }, privateKey, function (err, token) {
    console.log(token)
})
