const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: 'share-a-meal-testdb'
// })

const endpointToTest = '/api/meal'

describe('UC-301 Toevoegen van maaltijd', () => {
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

    it('TC-301-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set(
                'Authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
            ) // Assuming the user is logged in
            .send({
                // name: 'Maaltijdnaam', ontbreekt
                description: 'Heerlijke maaltijd',
                dateTime: '2023-06-23T18:00:00',
                maxAmountOfParticipants: 4,
                price: 12.5
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing name')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-301-2 Niet ingelogd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                name: 'Maaltijdnaam',
                description: 'Heerlijke maaltijd',
                dateTime: '2023-06-23T18:00:00',
                maxAmountOfParticipants: 4,
                price: 12.5
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

    it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set(
                'Authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
            ) // Assuming the user is logged in
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
                allergenes: 'dairy, mem'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(201)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(201)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Meal created successfully')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')

                const data = res.body.data
                chai.expect(data)
                    .to.have.property('name')
                    .equals('Italian Spaghetti Bolognese')
                chai.expect(data)
                    .to.have.property('description')
                    .equals(
                        'Delicious homemade spaghetti with rich bolognese sauce'
                    )
                chai.expect(data).to.have.property('isActive').equals(true)
                chai.expect(data).to.have.property('isVega').equals(false)
                chai.expect(data).to.have.property('isVegan').equals(false)
                chai.expect(data).to.have.property('isToTakeHome').equals(true)
                chai.expect(data)
                    .to.have.property('dateTime')
                    .equals('2024-07-01T18:00:00Z')
                chai.expect(data)
                    .to.have.property('maxAmountOfParticipants')
                    .equals(10)
                chai.expect(data).to.have.property('price').equals(12.5)
                chai.expect(data)
                    .to.have.property('imageUrl')
                    .equals('http://example.com/image.jpg')
                chai.expect(data)
                    .to.have.property('allergenes')
                    .equals('dairy, mem')

                done()
            })
    })
})
