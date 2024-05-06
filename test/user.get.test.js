// niet volledig uitgewerkt!

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC-204 Opvragen van gebruikersgegevens', () => {
    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        // Een niet-bestaand gebruikers-ID
        const nonExistentUserId = 9999
        chai.request(server)
            .get(`${endpointToTest}/${nonExistentUserId}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(`User not found with id ${nonExistentUserId}`)
                chai.expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        // Een bestaand gebruikers-ID, in dit geval nemen we aan dat het eerste gebruikers-ID bestaat
        const existingUserId = 0
        chai.request(server)
            .get(`${endpointToTest}/${existingUserId}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals(`User found with id ${existingUserId}.`)
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object')

                // Assertions om specifieke velden van de gebruiker te controleren
                chai.expect(res.body.data)
                    .to.have.property('id')
                    .equals(existingUserId)
                chai.expect(res.body.data)
                    .to.have.property('firstName')
                    .that.is.a('string')
                chai.expect(res.body.data)
                    .to.have.property('lastName')
                    .that.is.a('string')
                chai.expect(res.body.data)
                    .to.have.property('emailAdress')
                    .that.is.a('string')
                chai.expect(res.body.data)
                    .to.have.property('isActive')
                    .that.is.a('boolean')

                done()
            })
    })
})
