const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2/promise') // Use promise-based mysql2
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/user/55'
const validToken = jwt.sign({ userId: 55 }, jwtSecretKey, { expiresIn: '1h' })
const invalidToken = jwt.sign({ userId: 56 }, jwtSecretKey, { expiresIn: '1h' })

describe('UC206 Verwijderen van user', function () {
    this.timeout(5000) // Verhoog de timeout naar 5000ms

    // let connection

    before(async () => {
        // connection = await mysql.createConnection({
        //     host: process.env.DB_HOST,
        //     user: process.env.DB_USER,
        //     password: process.env.DB_PASS,
        //     database: 'share-a-meal-testdb'
        // })
        // console.log('connected as id ' + connection.threadId)
    })

    after(async () => {
        // await connection.end()
        console.log('connection ended')
    })

    beforeEach(async () => {
        // console.log('Before each test')
        // // Clean up the database to ensure there are no existing entries
        // await connection.execute(
        //     'DELETE FROM user WHERE emailAdress = "v.a@server.nl"'
        // )
        // // Insert a user directly using SQL query for testing
        // await connection.execute(
        //     `INSERT INTO user (id, firstName, lastName, emailAdress, isActive, password, phoneNumber, street, city)
        //      VALUES (55, 'Voornaam', 'Achternaam', 'v.a@server.nl', true, 'geldigWachtwoord123!', '0612345678', 'OeioeiStreet', 'Breda')`
        // )
    })

    afterEach(async () => {
        // // Cleanup the database after each test
        // await connection.execute('DELETE FROM user WHERE id = 55')
    })

    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .delete('/api/user/999') // Niet-bestaande gebruiker
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Error: id 999 does not exist!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
        chai.request(server)
            .delete(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Authorization header missing!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
    //     chai.request(server)
    //         .delete(endpointToTest)
    //         .set('Authorization', `Bearer ${invalidToken}`)
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(403)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(403)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals("You are not allowed to alter this user's data")
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty

    //             done()
    //         })
    // })

    // it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
    //     chai.request(server)
    //         .delete(endpointToTest)
    //         .set('Authorization', `Bearer ${validToken}`)
    //         .end((err, res) => {
    //             if (err) return done(err)

    //             chai.expect(res).to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(200)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('User deleted successfully')
    //             chai.expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object') // Controleer dat 'data' een object is

    //             done()
    //         })
    // })
})
