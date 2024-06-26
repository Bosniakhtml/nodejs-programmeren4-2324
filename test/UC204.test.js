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

const endpointToTest = '/api/user'

describe('UC204 Opvragen van usergegevens bij ID', () => {
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

    it('TC-204-1 Ongeldig token', (done) => {
        chai.request(server)
            .get(`${endpointToTest}/1`)
            .set('Authorization', 'Bearer invalidtoken')
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

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })

        chai.request(server)
            .get(`${endpointToTest}/99999`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(`Error: id 99999 does not exist!`)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        const testUser = {
            firstName: 'Voornaam',
            lastName: 'Achternaam',
            emailAdress: 'testuser@server.nl',
            password: 'geldigWachtwoord123!',
            isActive: true,
            phoneNumber: '0612345678',
            street: 'Straatnaam',
            city: 'Stad'
        }

        connection.query(
            `INSERT INTO user (firstName, lastName, emailAdress, password, isActive, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testUser.firstName,
                testUser.lastName,
                testUser.emailAdress,
                testUser.password,
                testUser.isActive,
                testUser.phoneNumber,
                testUser.street,
                testUser.city
            ],
            (err, results) => {
                if (err) throw err

                const userId = results.insertId
                const token = jwt.sign({ userId: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })

                chai.request(server)
                    .get(`${endpointToTest}/${userId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.an('object')

                        res.body.should.be
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')
                        res.body.status.should.be.a('number')

                        const data = res.body.data

                        // Assuming data is an object with 'user' and 'meals'
                        data.should.be.an('object')
                        data.should.have.all.keys('user', 'meals')

                        const meals = data.meals
                        meals.should.be.an('array')

                        done()
                    })
            }
        )
    })
})
