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

// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: 'share-a-meal-testdb'
// })

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
    before((done) => {
        // connection.connect((err) => {
        //     if (err) {
        //         console.error('error connecting: ' + err.stack)
        //         return done(err)
        //     }
        //     console.log('connected as id ' + connection.threadId)
        done()
        // })
    })

    after((done) => {
        // connection.end((err) => {
        //     if (err) {
        //         console.error('error ending the connection: ' + err.stack)
        //         return done(err)
        //     }
        //     console.log('connection ended')
        done()
        // })
    })

    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    it.skip('TC-201-1 Verplicht veld ontbreekt', (done) => {
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

    it.skip('TC-201-2 Niet-valide email adres', (done) => {
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
})
