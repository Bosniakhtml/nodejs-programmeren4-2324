const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const mysql = require('mysql2')
require('dotenv').config()

chai.should()
chai.use(chaiHttp)

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'share-a-meal-testdb'
})

const endpointToTest = '/api/meal'

describe('UC-303 Opvragen van alle maaltijden', () => {
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

    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Meals retrieved successfully')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('array').that.is.not.empty

                const meals = res.body.data
                meals.forEach((meal) => {
                    chai.expect(meal).to.have.property('id').that.is.a('number')
                    chai.expect(meal)
                        .to.have.property('name')
                        .that.is.a('string')
                    chai.expect(meal)
                        .to.have.property('description')
                        .that.is.a('string')
                })

                done()
            })
    })
})
