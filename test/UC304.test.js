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
const testMealId = 9999 // A constant meal ID for testing

describe('UC-304 Opvragen van maaltijd bij ID', () => {
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
        // const meal = {
        //     // id: testMealId,
        //     // isActive: 1,
        //     // isVega: 0,
        //     // isVegan: 0,
        //     // isToTakeHome: 1,
        //     // dateTime: '2024-07-01 20:00:00',
        //     // maxAmountOfParticipants: 10,
        //     // price: 12.5,
        //     // imageUrl: 'http://example.com/image.jpg',
        //     // cookId: 1,
        //     // createDate: new Date(),
        //     // updateDate: new Date(),
        //     // name: 'Italian Spaghetti Bolognese',
        //     // description:
        //     //     'Delicious homemade spaghetti with rich bolognese sauce',
        //     // allergenes: 'gluten'
        // }
        // connection.query('INSERT INTO meal SET ?', meal, (err, results) => {
        //     if (err) {
        //         console.error('Error inserting test meal:', err)
        //         return done(err)
        //     }
        done()
        // })
    })

    afterEach((done) => {
        // connection.query(
        //     'DELETE FROM meal WHERE id = ?',
        //     [testMealId],
        //     (err, results) => {
        //         if (err) {
        //             console.error('Error deleting test meal:', err)
        //             return done(err)
        //         }
        done()
        //     }
        // )
    })

    it('TC-304-1 Maaltijd bestaat niet', (done) => {
        const nonExistentMealId = 99999 // Assumed non-existent meal ID
        chai.request(server)
            .get(`${endpointToTest}/${nonExistentMealId}`)
            .set(
                'Authorization',
                'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
            )
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(`Error: id ${nonExistentMealId} does not exist!`)
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    // it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
    //     chai.request(server)
    //         .get(`${endpointToTest}/${testMealId}`)
    //         .set(
    //             'Authorization',
    //             'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
    //         )
    //         .end((err, res) => {
    //             if (err) {
    //                 console.error('Request error:', err)
    //                 done(err)
    //             } else {
    //                 chai.expect(res).to.have.status(200)
    //                 chai.expect(res.body).to.be.a('object')
    //                 chai.expect(res.body).to.have.property('status').equals(200)
    //                 chai.expect(res.body)
    //                     .to.have.property('message')
    //                     .equals('meal data retrieved successfully')
    //                 chai.expect(res.body)
    //                     .to.have.property('data')
    //                     .that.is.a('object')

    //                 const data = res.body.data
    //                 chai.expect(data).to.have.property('id').equals(testMealId)
    //                 chai.expect(data)
    //                     .to.have.property('name')
    //                     .equals('Italian Spaghetti Bolognese')
    //                 chai.expect(data)
    //                     .to.have.property('description')
    //                     .equals(
    //                         'Delicious homemade spaghetti with rich bolognese sauce'
    //                     )
    //                 chai.expect(data).to.have.property('isActive').equals(1)
    //                 chai.expect(data).to.have.property('isVega').equals(0)
    //                 chai.expect(data).to.have.property('isVegan').equals(0)
    //                 chai.expect(data).to.have.property('isToTakeHome').equals(1)
    //                 chai.expect(data)
    //                     .to.have.property('dateTime')
    //                     .equals('2024-07-01T18:00:00.000Z')
    //                 chai.expect(data)
    //                     .to.have.property('maxAmountOfParticipants')
    //                     .equals(10)
    //                 chai.expect(data).to.have.property('price').equals('12.50')
    //                 chai.expect(data)
    //                     .to.have.property('imageUrl')
    //                     .equals('http://example.com/image.jpg')
    //                 chai.expect(data).to.have.property('cookId').equals(1)
    //                 chai.expect(data).to.have.property('createDate')
    //                 chai.expect(data).to.have.property('updateDate')
    //                 chai.expect(data)
    //                     .to.have.property('allergenes')
    //                     .equals('gluten')

    //                 done()
    //             }
    //         })
    // })
})
