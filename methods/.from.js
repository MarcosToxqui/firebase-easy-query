const { where } = require('./.where');

class __From {
    constructor(context, nodePath) {
        if (!nodePath) {
            nodePath = `unset_${Date.now()}`;
        }

        this.nodePath = nodePath;
        this.firebaseContext = context;
    }

    async GetSnapshot() {
        return await this._getDataSnapshot().then(value => {
            return (value || new Object());
        }).catch(error => {
            console.log("==>", error);
        });
    }

    async GetValue() {
        return await this._getDataSnapshot().then(value => {
            if (typeof value !== 'undefined') {
                return value.val();
            }

            return "";
        }).catch(error => {
            console.log("==>", error);
            return null;
        });
    }

    async GetKey() {
        return await this._getDataSnapshot().then(value => {
            if (typeof value !== 'undefined') {
                return value.key;
            }
        }).catch(error => {
            console.log("==>", error);
            return null;
        });
    }

    Select(...keys) {
        if (!keys) {
            return;
        }

        let method = new where(this.firebaseContext, this.nodePath, keys);
        return method;
    }

    async SelectFor(...keys) {
        if (!keys) {
            return;
        }

        if (keys.length === 0) {
            return await this.GetValue();
        }

        let dynamicItem = new Object();
        let dynamicCollection = new Array();

        let snapshotValue = await this.GetValue();
        for (const item of Object.keys(snapshotValue)) {
            for (const key of keys) {
                let dbItem = snapshotValue[item];
                if (key) {
                    let value = dbItem[key];
                    if (value === undefined) {
                        value = "";
                    }
                    dynamicItem[key] = value;
                }
            }

            if (Object.keys(dynamicItem) > 0) {
                dynamicCollection.push(dynamicItem);
            }
        }

        return dynamicCollection;
    }

    async _getDataSnapshot() {
        let snapshot = await this.firebaseContext.database().ref(this.nodePath).once('value');
        return snapshot;
    }

    async Remove(key, w) {
        if (key !== '*') {
            return await this.__simpleRemove(key);
        } else if (key === '*' && typeof w === 'object') {
            let snapshot = await new __From(this.firebaseContext, this.nodePath).GetSnapshot();
            let operator = w.where.operator;
            let conditionalValue = w.where.value;
            let _snapshotValue = snapshot.val();

            if (snapshot !== undefined) {
                if (typeof _snapshotValue === 'object') {
                    snapshot.forEach(async snap => {
                        let snapshotValue = snap.val();
                        if (typeof snapshotValue !== 'object') {
                            let result = this.switchOperator(conditionalValue, operator, snapshotValue);
                            if (result) {
                                await this.firebaseContext.database().ref(`${this.nodePath}/${snap.key}`).set(null);
                            }
                        }
                    });
                } else {
                    let result = this.switchOperator(conditionalValue, operator, _snapshotValue);
                    if (result) {
                        await this.firebaseContext.database().ref(`${this.nodePath}`).set(null);
                    }
                }
            }
        }
    }

    switchOperator(conditionalValue, operator, snapshotValue) {
        switch (operator) {
            case "eq": {
                return (snapshotValue === conditionalValue);
            }
            case "gt": {
                return (snapshotValue > conditionalValue);
            }
            case "lt": {
                return (snapshotValue < conditionalValue);
            }
            case "ge": {
                return (snapshotValue >= conditionalValue);
            }
            case "le": {
                return (snapshotValue <= conditionalValue);
            }
        }
    }

    async __simpleRemove(key) {
        if (!key) {
            return;
        }

        if (this.nodePath === key) {
            await this.firebaseContext.database().ref(this.nodePath).set(null);
            return;
        }

        await this.firebaseContext.database().ref(this.nodePath).child(key).set(null);
        return;
    }

    async Delete() {
        await this.firebaseContext.database().ref(this.nodePath).set(null);
    }

    async MoveTo(path) {
        if (!path) {
            return;
        }

        let data = await new __From(this.firebaseContext, this.nodePath).GetSnapshot();
        await this.__simpleRemove(this.nodePath);

        let { __On } = require('./.on');
        await new __On(this.firebaseContext, path).Create(data.key, data.val());
    }

    async CopyTo(path) {
        if (!path) {
            return;
        }

        if (path === this.nodePath) {
            return;
        }

        let data = await new __From(this.firebaseContext, this.nodePath).GetSnapshot();

        let { __On } = require('./.on');
        let dataKey = data.key;
        let dataValue = data.val();

        if (!dataKey) {
            let keys = Object.keys(dataValue);
            dataKey = keys[0];
            await new __On(this.firebaseContext, path).Create(dataKey, dataValue[dataKey]);
            return;
        }

        await new __On(this.firebaseContext, path).Create(dataKey, dataValue);
        return;
    }
}

module.exports = { __From };