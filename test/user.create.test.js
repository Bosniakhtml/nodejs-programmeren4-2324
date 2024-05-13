// niet volledig uitgewerkt!

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                /**
                 * Voorbeeld uitwerking met chai.expect
                 */
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'ongeldig-email-adres' // Dit moet een ongeldig e-mailadres zijn
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect email')
                done()
            })
    })

    // it.skip('TC-201-3 Niet-valide password', (done) => {
    //
    // Hier schrijf je jouw testcase.
    //
    //     done()
    // })

    it('TC-201-4 Gebruiker bestaat al', (done) => {
        // Simuleer het toevoegen van een gebruiker met hetzelfde e-mailadres aan de database
        database.add(
            {
                firstName: 'Bestaande',
                lastName: 'Gebruiker',
                emailAdress: 'bestaande@server.nl',
                isActive: true
            },
            (err, newUser) => {
                chai.expect(err).to.be.null
                chai.expect(newUser).to.be.a('object')

                // Voer de registratiepoging uit voor een gebruiker met hetzelfde e-mailadres
                chai.request(server)
                    .post(endpointToTest)
                    .send({
                        firstName: 'Nieuwe',
                        lastName: 'Gebruiker',
                        emailAdress: 'bestaande@server.nl',
                        isActive: true
                    })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(400)
                        chai.expect(res.body).to.be.a('object')
                        chai.expect(res.body)
                            .to.have.property('status')
                            .equals(400)
                        chai.expect(res.body)
                            .to.have.property('message')
                            .equals(
                                'User with this email address already exists'
                            )
                        done()
                    })
            }
        )
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl',
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                const data = res.body.data
                data.should.have.property('firstName').equals('Voornaam')
                data.should.have.property('lastName').equals('Achternaam')
                data.should.have.property('emailAdress')
                data.should.have.property('isActive')
                data.should.have.property('id').that.is.a('number')

                done()
            })
    })
})
