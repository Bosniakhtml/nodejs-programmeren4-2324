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

describe('UC205 Updaten van usergegevens', () => {
    let connection

    before(async () => {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'share-a-meal-testdb'
        })

        console.log('connected as id ' + connection.threadId)
    })

    after(async () => {
        await connection.end()
        console.log('connection ended')
    })

    beforeEach(async () => {
        console.log('Before each test')
        // Clean up the database to ensure there are no existing entries
        await connection.execute(
            'DELETE FROM user WHERE emailAdress = "v.ab@server.nl"'
        )

        // Insert a user directly using SQL query for testing
        await connection.execute(
            `INSERT INTO user (id, firstName, lastName, emailAdress, isActive, password, phoneNumber, street, city) 
             VALUES (55, 'Voornaam', 'Achternaam', 'v.ab@server.nl', true, 'geldigWachtwoord123!', '0612345678', 'OeioeiStreet', 'Breda')`
        )
    })

    afterEach(async () => {
        // Cleanup the database after each test
        await connection.execute('DELETE FROM user WHERE id = 55')
    })

    it('TC-205-1 Verplicht veld “emailAdress” ontbreekt', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam'
                // emailAdress ontbreekt
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing emailAdress')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam',
                emailAdress: 'v.ab@server.nl',
                password: 'geldigWachtwoord123!',
                isActive: true,
                phoneNumber: '0612345678',
                street: 'Straatnaam',
                city: 'Stad'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals("You are not allowed to alter this user's data")
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam',
                emailAdress: 'v.ab@server.nl',
                password: 'geldigWachtwoord123!',
                isActive: true,
                phoneNumber: 'invalidPhoneNumber'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(
                        'phoneNumber must be in the format 06-12345678, 06 12345678 or 0612345678'
                    )
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .put('/api/user/999') // Niet-bestaande gebruiker
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam',
                emailAdress: 'v.ab@server.nl',
                password: 'geldigWachtwoord123!',
                isActive: true,
                phoneNumber: '0612345678',
                street: 'Straatnaam',
                city: 'Stad'
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

    it('TC-205-5 Niet ingelogd', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam',
                emailAdress: 'v.ab@server.nl'
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

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'NieuweVoornaam',
                lastName: 'NieuweAchternaam',
                emailAdress: 'v.ab@server.nl',
                password: 'geldigWachtwoord123!',
                isActive: true,
                phoneNumber: '0612345678',
                street: 'NieuweStraat',
                city: 'NieuweStad'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('User updated successfully')

                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')

                const data = res.body.data
                chai.expect(data)
                    .to.have.property('firstName')
                    .equals('NieuweVoornaam')
                chai.expect(data)
                    .to.have.property('lastName')
                    .equals('NieuweAchternaam')
                chai.expect(data)
                    .to.have.property('emailAdress')
                    .equals('v.ab@server.nl')
                chai.expect(data)
                    .to.have.property('phoneNumber')
                    .equals('0612345678')
                chai.expect(data)
                    .to.have.property('street')
                    .equals('NieuweStraat')
                chai.expect(data).to.have.property('city').equals('NieuweStad')

                done()
            })
    })
})
