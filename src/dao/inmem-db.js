// inmen-db.js

// Onze lokale 'in memory database'.
// We simuleren een asynchrone database met een array van objecten.
// De array bevat een aantal dummy records.
// De database heeft twee methoden: get en add.
// Opdracht: Voeg de overige methoden toe.
//
const database = {
    // het array met dummy records. Dit is de 'database'.
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAdress: 'hvd@server.nl',
            isActive: true
            // Hier de overige velden uit het functioneel ontwerp
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm@server.nl',
            isActive: false
            // Hier de overige velden uit het functioneel ontwerp
        }
    ],

    // Ieder nieuw item in db krijgt 'autoincrement' index.
    // Je moet die wel zelf toevoegen aan ieder nieuw item.
    _index: 2,
    _delayTime: 500,

    getAll(callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Roep de callback aan, en retourneer de data
            callback(null, this._data)
        }, this._delayTime)
    },

    getById(id, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null)
            } else {
                callback(null, this._data[id])
            }
        }, this._delayTime)
    },
    // getByEmail(email, callback) {
    //     // Zoek naar een gebruiker met het opgegeven e-mailadres
    //     for (const user of this._data) {
    //         if (user.emailAdress === email) {
    //             callback(null, user)
    //         }
    //     }
    //     // const user = this._data.find((u) => u.emailAdress === email)
    //     callback({ message: 'user not found' }, null)
    // },
    isEmailAvailable(email, callback) {
        for (const user of this._data) {
            console.log(email + ' ' + user.emailAdress)

            if (user.emailAdress === email || user.emailAddress === email) {
                return false
            }
        }
        return true
    },

    add(item, callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            if (!this.isEmailAvailable(item.emailAddress)) {
                callback({ message: 'Email is already is in use' }, null)
            }
            // Voeg een id toe en voeg het item toe aan de database
            item.id = this._index++
            // Voeg item toe aan de array
            this._data.push(item)

            // Roep de callback aan het einde van de operatie
            // met het toegevoegde item als argument, of null als er een fout is opgetreden
            callback(null, item)
        }, this._delayTime)
    },

    update: (user, callback) => {
        // Zoek de gebruiker op basis van het id en werk de gegevens bij
        const index = database._data.findIndex((u) => u.id === user.id)
        if (index === -1) {
            return callback(
                { message: `User with id ${user.id} not found` },
                null
            )
        }
        database._data[index] = user
        callback(null, user)
    },

    searchUsers: (field1, field2, callback) => {
        // Voer hier de logica uit om gebruikers te filteren op basis van de opgegeven criteria
        const filteredUsers = database._data.filter(
            (user) => user[field1] === field1 && user[field2] === field2
        )
        console.log('Field 1:', field1)
        console.log('Field 2:', field2)

        callback(null, filteredUsers)
    },
    delete: (userId, callback) => {
        database._data.splice(userId, 1)
        callback(null)
    }

    // Voeg zelf de overige database functionaliteit toe
}

module.exports = database
// module.exports = database.index;
