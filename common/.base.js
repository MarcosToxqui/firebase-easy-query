const fa = require('firebase-admin');
const uuid = require('uuid/v4');

class feqBase {
    constructor(config = {}) {
        if (config && config.databaseURL && !config.credential) {
            this.firebaseContext = fa.initializeApp(config, uuid());
        } else if (config && config.credential !== null && config.databaseUrl !== null) {
            this.rootPath = '/';
            this.firebaseContext = fa.initializeApp({
                credential: fa.credential.cert(config.credential),
                databaseURL: config.databaseUrl
            });
        }
    }
}

module.exports = { feqBase }