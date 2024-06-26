const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2/promise') // Use promise-based mysql2
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const loginEndpoint = '/api/auth/login'

describe('UC-101 Inloggen', () => {
    // let connection

    // before(async () => {
    //     connection = await mysql.createConnection({
    //         host: process.env.DB_HOST,
    //         user: process.env.DB_USER,
    //         password: process.env.DB_PASS,
    //         database: 'share-a-meal-testdb'
    //     })

    //     console.log('connected as id ' + connection.threadId)
    // })

    // after(async () => {
    //     await connection.end()
    //     console.log('connection ended')
    // })

    beforeEach(async () => {
        console.log('Before each test')
        // Clean up the database to ensure there are no existing entries
        // await connection.execute(
        //     'DELETE FROM user WHERE emailAdress = "test.user@server.nl" OR id = 1'
        // )

        // // Insert a user directly using SQL query for testing
        // await connection.execute(
        //     `INSERT INTO user (id, firstName, lastName, emailAdress, isActive, password, phoneNumber, street, city)
        //      VALUES (1, 'Test', 'User', 'test.user@server.nl', true, 'ValidPassword123!', '0612345678', 'TestStreet', 'TestCity')`
        // )
    })

    // afterEach(async () => {
    //     // Cleanup the database after each test
    //     await connection.execute(
    //         'DELETE FROM user WHERE emailAdress = "test.user@server.nl" OR id = 1'
    //     )
    // })

    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(loginEndpoint)
            .send({
                // Email ontbreekt
                password: 'ValidPassword123!'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing email address')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // it('TC-101-2 Niet-valide wachtwoord', (done) => {
    //     chai.request(server)
    //         .post(loginEndpoint)
    //         .send({
    //             emailAdress: 'test.user@server.nl',
    //             password: '1'
    //         })
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(400)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(400)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('Invalid password')
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty

    //             done()
    //         })
    // })

    it('TC-101-3 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .post(loginEndpoint)
            .send({
                emailAdress: 'r@server.nl',
                password: 'ValidPassword'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User not found')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
    //     chai.request(server)
    //         .post(loginEndpoint)
    //         .send({
    //             emailAdress: 'test.user@server.nl',
    //             password: 'ValidPassword123!'
    //         })
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(200)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('User logged in')
    //             chai.expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object')

    //             /* const data = res.body.data
    //             chai.expect(data).to.have.property('user').that.is.a('object')
    //             chai.expect(data.user).to.have.property('id').equals(1)
    //             chai.expect(data.user)
    //                 .to.have.property('emailAdress')
    //                 .equals('test.user@server.nl')
    //             chai.expect(data).to.have.property('token').that.is.a('string')
    //             */
    //             done()
    //         })
    // })
})
