const { __From } = require('./.from');

class __On {
    constructor(context, nodePath) {
        if (!nodePath) {
            nodePath = `unset_${Date.now()}`;
        }

        this.nodePath = nodePath;
        this.firebaseContext = context;
    }

    async Create(parentOrPathName = "", _object_) {
        let key;

        if (parentOrPathName && parentOrPathName !== "") {
            this.nodePath = `${this.nodePath}/${parentOrPathName}`;
            this._create(_object_).catch(error => {
                console.error("==>", error);
            });

            return parentOrPathName;
        }
        else {
            key = await this._createAsAnonymous(_object_);
            return key;
        }
    }

    async Append(newValues) {
        let seteableObj = {};
        let parsed;

        if (!newValues) {
            return;
        }

        if (Object.keys(newValues).length === 0) {
            return;
        }

        if (typeof newValues == 'string') {
            parsed = JSON.parse(newValues);
        }

        if (this.nodePath === '/') {
            this._append(newValues);
            return;
        }

        let data;
        data = await new __From(this.firebaseContext, this.nodePath).GetSnapshot();

        let objMembers;
        objMembers = Object.keys(newValues);

        let value = data.val();

        if (Array.isArray(value)) {
            if (typeof newValues === 'object') {
                value.push(newValues);
                return await this._append(value);
            }
        }

        if (typeof value === 'object') {
            seteableObj = data.val();
            objMembers.forEach(member => {
                if (typeof newValues[member] === 'string') {
                    seteableObj[member] = newValues[member].toString();
                }
                else {
                    seteableObj[member] = newValues[member];
                }
            });
        } else {
            seteableObj = newValues;
        }

        return await this._create(seteableObj);
    }

    async Update(_object_) {
        if (typeof _object_ === 'string') {
            await this._update(_object_);
            return;
        }

        await this.firebaseContext.database().ref(this.nodePath).update(_object_);
    }

    async Rename({ oldName, newName }) {
        if (!oldName || !newName) {
            throw ("Both values (old and new) are required to execute this function.");
        }

        await this._rename({ oldName: oldName, newName: newName });
        return;
    }

    async _rename({ oldName, newName }) {
        let oldPath = `${this.nodePath}/${oldName}`;
        let newPath = `${this.nodePath}/${newName}`;

        let original = await new __From(this.firebaseContext, oldPath).GetValue();

        try {
            // remove original node
            await this.firebaseContext.database().ref(oldPath).set(null);
            // re-set node values
            await this.firebaseContext.database().ref(newPath).set(original);

            return;
        } catch (error) {
            console.error("_rename error", error);
        }
    }

    async _create(o) {
        try {
            return await this.firebaseContext.database().ref(this.nodePath).set(o);
        } catch (error) {
            console.error("_create error", error);
        }

        return;
    }

    async _createAsAnonymous(obj) {
        try {
            return await this.firebaseContext.database().ref(this.nodePath).push(obj).key;
        } catch (error) {
            console.error("_createAsAnonymous error", error);
        }

        return;
    }

    async _append(o) {
        let keys = Object.keys(o);

        await keys.forEach(async key => {
            let obj = o[key];
            console.log(o[key]);

            await this.firebaseContext.database().ref(`${this.nodePath}${key}`).set(obj);
        });

        return;
    }

    async _update(value) {
        let splitedPath = this.nodePath.split("/");
        let updateTo = splitedPath[splitedPath.length - 1];
        splitedPath[splitedPath.length - 1] = null;

        let newPath = splitedPath.join('/');
        let newObject = new Object();
        newObject[updateTo] = value;

        await this.firebaseContext.database().ref(newPath).update(newObject);
    }
}

module.exports = { __On }