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

describe('UC-202 Opvragen van overzicht van users', () => {
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

    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(endpointToTest)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .to.be.a('string')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('array')

                const users = res.body.data
                chai.expect(users.length).to.be.at.least(2)

                done()
            })
    })

    it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(`${endpointToTest}?nonexistentfield=value`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .to.be.a('string')
                chai.expect(res.body).to.have.property('data').that.is.empty

                done()
            })
    })

    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(`${endpointToTest}?isActive=false`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .to.be.a('string')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('array')

                const users = res.body.data
                users.forEach((user) => {
                    chai.expect(user).to.have.property('isActive').equals(false)
                })

                done()
            })
    })

    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(`${endpointToTest}?isActive=true`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .to.be.a('string')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('array')

                const users = res.body.data
                users.forEach((user) => {
                    chai.expect(user).to.have.property('isActive').equals(true)
                })

                done()
            })
    })

    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
        const token = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(`${endpointToTest}?firstName=John&lastName=Doe`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .to.be.a('string')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.an('array')

                const users = res.body.data
                users.forEach((user) => {
                    chai.expect(user)
                        .to.have.property('firstName')
                        .that.equals('John')
                    chai.expect(user)
                        .to.have.property('lastName')
                        .that.equals('Doe')
                })

                done()
            })
    })
})
