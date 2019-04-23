'use strict'
const fa = require('firebase-admin');
const uuid = require('uuid/v4');
const { __On } = require('./methods/.on');
const { __From } = require('./methods/.from');

/**Class that exposes methods to access common operations. */
class feq {
    constructor(config) {
        console.log("**************", config);
        if (config && !config.credential) {
            this._(config.databaseUrl);
        } else {
            this.rootPath = '/';
            this.firebaseContext = fa.initializeApp({
                credential: fa.credential.cert(config.credential),
                databaseURL: config.databaseUrl
            });
        }
    }

    _($databaseUrl) {
        console.log(".....................", $databaseUrl);

        this.rootPath = '/';
        this.firebaseContext = fa.initializeApp({ databaseURL: $databaseUrl }, uuid());
    }

    /**Sets a value that will use as database root */
    set SetRoot(value) {
        this.rootPath = value;
        return;
    }

    /**Returns the value used as root path. */
    get OnRoot() {
        return new __On(this.firebaseContext, this.rootPath);
    }

    /**
     * Method that returns an object that contains methods to create and update individual nodes.
     * @param {string} path A string value used as path to access to the data.
     */
    On(path) {
        if (!path) {
            return;
        }

        if (!this.rootPath) {
            this.rootPath = '/';
        }

        if (!path.startsWith("/")) {
            path = `/${path}`;
        }

        let fullPath = `${this.rootPath}${path}`;
        let on = new __On(this.firebaseContext, fullPath);
        return on;
    }

    /**
     * Method that returns an object that contains methods to delete, copy, move or update datasets.
     * @param {string} path A string value used as path to access to the data.
     */
    From(path) {
        if (!path) {
            return;
        }

        if (!this.rootPath) {
            this.rootPath = '/';
        }

        if (!path.startsWith("/")) {
            path = `/${path}`;
        }

        let fullPath = `${this.rootPath}${path}`;
        let method = new __From(this.firebaseContext, fullPath);
        return method;
    }
}

/**Operator for queries */
const operator = {
    $eq: "eq",
    $gt: "gt",
    $lt: "lt",
    $ge: "ge",
    $le: "le"
};

Object.freeze(operator)

module.exports = { feq, operator };