const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
const logger = require('../src/util/logger')
require('dotenv').config()

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'share-a-meal-testdb'
})

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
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

    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing firstName')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'ongeldig-email-adres' // Ongeldig e-mailadres
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('incorrect email')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-3 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.ab@server.nl',
                isActive: false,
                password: 'kort' // Niet-valide wachtwoord
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(
                        'password must be at least 8 characters long, contain at least one uppercase letter, and contain at least one digit'
                    )
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        // Insert a user directly using SQL query
        connection.query(
            `INSERT INTO user (firstName, lastName, emailAdress, isActive) VALUES (?, ?, ?, ?)`,
            ['Bestaande', 'Gebruiker', 'bestaande@server.nl', true],
            (err, results) => {
                if (err) throw err

                // Attempt to register a user with the same email
                chai.request(server)
                    .post(endpointToTest)
                    .send({
                        firstName: 'Nieuwe',
                        lastName: 'Gebruiker',
                        emailAdress: 'bestaande@server.nl',
                        isActive: true
                    })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(403)
                        chai.expect(res.body).to.be.a('object')
                        chai.expect(res.body)
                            .to.have.property('status')
                            .equals(403)
                        chai.expect(res.body)
                            .to.have.property('message')
                            .equals(
                                'User with this email address already exists'
                            )
                        chai
                            .expect(res.body)
                            .to.have.property('data')
                            .that.is.a('object').that.is.empty

                        done()
                    })
            }
        )
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.ab@server.nl',
                password: 'geldigWachtwoord123!', // Een geldig wachtwoord
                isActive: true,
                phoneNumber: '0612345678',
                street: 'OeioeiStreet',
                city: 'Breda'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(201)
                chai.expect(res.body).to.be.a('object')

                chai.expect(res.body).to.have.property('status').equals(201)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User created successfully')

                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')

                const data = res.body.data
                chai.expect(data)
                    .to.have.property('firstName')
                    .equals('Voornaam')
                chai.expect(data)
                    .to.have.property('lastName')
                    .equals('Achternaam')
                chai.expect(data).to.have.property('emailAdress')
                chai.expect(data).to.have.property('isActive')
                chai.expect(data).to.have.property('id').that.is.a('number')

                done()
            })
    })
})
