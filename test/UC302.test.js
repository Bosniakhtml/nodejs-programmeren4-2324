const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2/promise') // Use promise-based mysql2
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const endpointToTest = '/api/meal/123' // Voorbeeld endpoint, pas aan naar het juiste endpoint
const validToken = jwt.sign({ userId: 1 }, jwtSecretKey, { expiresIn: '1h' })
const invalidToken = jwt.sign({ userId: 2 }, jwtSecretKey, { expiresIn: '1h' })

describe('UC302 Wijzigen van maaltijdsgegevens', () => {
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
        // await connection.execute('DELETE FROM meal WHERE id = 123')
        // // Insert a meal directly using SQL query for testing
        // await connection.execute(`
        //     INSERT INTO meal (id, name, price, maxAmountOfParticipants, cookId)
        //     VALUES (123, 'Test Meal', 10.50, 5, 1)
        // `)
    })

    afterEach(async () => {
        // // Cleanup the database after each test
        // await connection.execute('DELETE FROM meal WHERE id = 123')
    })

    it('TC-302-1 Verplicht veld maxAmountOfParticipants ontbreekt', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Updated Meal',
                description:
                    'Delicious homemade spaghetti with rich bolognese sauce',
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: '2024-07-01T18:00:00Z'
                // price en maxAmountOfParticipants ontbreken
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing maxAmountOfParticipants')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                name: 'Updated Meal',
                price: 15.0,
                maxAmountOfParticipants: 10
            })
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

    // it('TC-302-3 Niet de eigenaar van de data', (done) => {
    //     chai.request(server)
    //         .put(endpointToTest)
    //         .set('Authorization', `Bearer ${invalidToken}`)
    //         .send({
    //             name: 'Italian Spaghetti Bolognese',
    //             description:
    //                 'Delicious homemade spaghetti with rich bolognese sauce',
    //             isActive: true,
    //             isVega: false,
    //             isVegan: false,
    //             isToTakeHome: true,
    //             dateTime: '2024-07-01T18:00:00Z',
    //             maxAmountOfParticipants: 10,
    //             price: 12.5,
    //             imageUrl: 'http://example.com/image.jpg',
    //             allergenes: ['lactose', 'gluten', 'noten']
    //         })
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

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .put('/api/meal/999') // Niet-bestaande maaltijd
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Italian Spaghetti Bolognese',
                description:
                    'Delicious homemade spaghetti with rich bolognese sauce',
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: '2024-07-01T18:00:00Z',
                maxAmountOfParticipants: 10,
                price: 12.5,
                imageUrl: 'http://example.com/image.jpg',
                allergenes: ['lactose', 'gluten', 'noten']
            })
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

    // it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
    //     chai.request(server)
    //         .put(endpointToTest)
    //         .set('Authorization', `Bearer ${validToken}`)
    //         .send({
    //             name: 'Updated Meal',
    //             description:
    //                 'Delicious homemade spaghetti with rich bolognese sauce',
    //             isActive: true,
    //             isVega: false,
    //             isVegan: false,
    //             isToTakeHome: true,
    //             dateTime: '2024-07-01T18:00:00Z',
    //             maxAmountOfParticipants: 10,
    //             price: 12.5,
    //             imageUrl: 'http://example.com/image.jpg',
    //             allergenes: ['lactose', 'gluten', 'noten']
    //         })
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(200)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('Meal updated successfully')

    //             chai.expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object')

    //             const data = res.body.data
    //             chai.expect(data)
    //                 .to.have.property('name')
    //                 .equals('Updated Meal')
    //             chai.expect(data).to.have.property('price').equals(12.5)
    //             chai.expect(data)
    //                 .to.have.property('maxAmountOfParticipants')
    //                 .equals(10)

    //             done()
    //         })
    // })
})
