'use strict'
const { feqBase } = require('./common/.base');
const { __On } = require('./methods/.on');
const { __From } = require('./methods/.from');

class feq extends feqBase {
    constructor(config) {
        console.log(config);
        super(config);
    }

    set SetRoot(value) {
        this.rootPath = value;
        return;
    }

    get OnRoot() {
        return new __On(this.firebaseContext, this.rootPath);
    }

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

module.exports = { feq };