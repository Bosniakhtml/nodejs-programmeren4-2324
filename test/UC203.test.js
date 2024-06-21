const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'share-a-meal-testdb'
})

const endpointToTest = '/api/user/profile'

describe('UC203 Opvragen van gebruikersprofiel', () => {
    before((done) => {
        connection.connect((err) => {
            if (err) {
                console.error('error connecting: ' + err.stack)
                return done(err)
            }
            console.log('connected as id ' + connection.threadId)
            done()
        })
    })

    after((done) => {
        connection.end((err) => {
            if (err) {
                console.error('error ending the connection: ' + err.stack)
                return done(err)
            }
            console.log('connection ended')
            done()
        })
    })

    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    it('TC-203-1 Ongeldig token', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .set('Authorization', 'Bearer ongeldigeToken')
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Not authorized!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-203-2 Gebruiker is ingelogd met geldig token', (done) => {
        // Create a valid token
        const validToken = jwt.sign({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })

        // Directly insert a test user into the database for testing
        const testUser = {
            id: 1,
            firstName: 'Test',
            lastName: 'User'
        }

        connection.query(
            'INSERT INTO `user` (id, firstName, lastName) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE firstName=?, lastName=?',
            [
                testUser.id,
                testUser.firstName,
                testUser.lastName,
                testUser.firstName,
                testUser.lastName
            ],
            (err, results) => {
                if (err) throw err

                chai.request(server)
                    .get(endpointToTest)
                    .set('Authorization', `Bearer ${validToken}`)
                    .end((err, res) => {
                        chai.expect(res).to.have.status(200)
                        chai.expect(res.body).to.be.a('object')
                        chai.expect(res.body)
                            .to.have.property('status')
                            .equals(200)
                        chai.expect(res.body)
                            .to.have.property('message')
                            .equals('User profile retrieved successfully')
                        chai.expect(res.body)
                            .to.have.property('data')
                            .that.is.a('array')
                            .with.lengthOf(1)

                        const user = res.body.data[0]
                        chai.expect(user)
                            .to.have.property('id')
                            .that.equals(testUser.id)
                        chai.expect(user)
                            .to.have.property('firstName')
                            .that.equals(testUser.firstName)
                        chai.expect(user)
                            .to.have.property('lastName')
                            .that.equals(testUser.lastName)

                        done()
                    })
            }
        )
    })
})
