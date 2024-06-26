const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2/promise') // Use promise-based mysql2
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/meal/1'
const validToken = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })
const invalidToken = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '1h' })

describe('UC305 Verwijderen van maaltijd', function () {
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
        // console.log('connection ended')
    })

    beforeEach(async () => {
        // console.log('Before each test')
        // // Clean up the database to ensure there are no existing entries
        // await connection.execute('DELETE FROM meal WHERE id = 1')
        // // Insert a meal directly using SQL query for testing
        // await connection.execute(
        //     `INSERT INTO meal (id, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId)
        //      VALUES (1, 'Test Meal', 'A test meal', true, false, false, true, '2024-06-24 18:00:00', 'http://example.com/image.jpg', 'gluten', 5, 6.50, 1)`
        // )
    })

    afterEach(async () => {
        // // Cleanup the database after each test
        // await connection.execute('DELETE FROM meal WHERE id = 1')
    })

    it('TC-305-1 Niet ingelogd', (done) => {
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

    // it('TC-305-2 Niet de eigenaar van de data', (done) => {
    //     chai.request(server)
    //         .delete(endpointToTest)
    //         .set('Authorization', `Bearer ${invalidToken}`)
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(403)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(403)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('You are not the owner of this meal')
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty

    //             done()
    //         })
    // })

    it('TC-305-3 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .delete('/api/meal/999') // Niet-bestaande maaltijd
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

    // it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
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
    //                 .equals('meal deleted successfully')
    //             chai.expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object')

    //             done()
    //         })
    // })
})
