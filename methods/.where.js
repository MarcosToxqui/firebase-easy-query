class where {
    constructor(context, nodePath, keys) {
        if (!nodePath) {
            nodePath = `unset_${Date.now()}`;
        }

        this.nodePath = nodePath;
        this.firebaseContext = context;
        this.keys = keys;
    }

    async _getDataSnapshot() {
        let snapshot = await this.firebaseContext.database().ref(this.nodePath).once('value');
        return snapshot;
    }

    async Where(conditions) {
        return await this._where(conditions);
    }

    async _where(conditions) {
        let returnDataset = [];
        let returnDataItem = null;

        let snapshot = await this._getDataSnapshot();
        let _snapshotValue = snapshot.val();

        if (!_snapshotValue) {
            return returnDataset;
        }

        let i = 0;
        while (typeof _snapshotValue[Object.keys(_snapshotValue)[i]] === 'object') {
            let __object = _snapshotValue[Object.keys(_snapshotValue)[i]];
            returnDataItem = this.evaluate(conditions, __object);

            if (returnDataItem !== null) {
                returnDataset.push(returnDataItem);
            }

            i++;
        }

        let j = 0;
        while (j < Object.keys(_snapshotValue).length - 1) {
            if (typeof _snapshotValue[Object.keys(_snapshotValue)[j]] !== 'object') {
                returnDataset = await this.iterateOnKeys(conditions, snapshot);
            }
            j++;
        }

        return await returnDataset;
    }

    evaluate(conditions, snapshotValue) {
        let dynamicObject = null;

        let value = snapshotValue[conditions.key];
        if (value !== undefined) {
            let isOperable = this.switchOperator(conditions.value, conditions.operator, value)
            if (isOperable) {
                dynamicObject = new Object();
                if (this.keys.length !== 0) {
                    for (const key of this.keys) {
                        let value = snapshotValue[key];

                        if (value === undefined) {
                            value = "";
                        }

                        dynamicObject[key] = value;
                    }
                } else {
                    return snapshotValue;
                }
            }
        }

        return dynamicObject;
    }

    async iterateOnKeys(conditions, snapshot) {
        let returnDataset = [];
        let dynamicObject = {};

        let snapshotValue = snapshot.val();

        let value = snapshotValue[conditions.key];
        if (value !== undefined) {
            let isOperable = this.switchOperator(conditions.value, conditions.operator, value)
            if (isOperable) {
                if (this.keys.length !== 0) {
                    dynamicObject = new Object();
                    for (const key of this.keys) {
                        let value = snapshotValue[key];

                        if (value === undefined) {
                            value = "";
                        }

                        dynamicObject[key] = value;
                    }

                    returnDataset.push(dynamicObject);
                } else {
                    returnDataset.push(_snapshotValue);
                }
            }
        }

        return returnDataset;
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

    hasSubobjects(_object) {
        let args = Array.prototype.slice.call(arguments, 1);

        for (let i = 0; i < args.length; i++) {

            if (!_object || !_object.hasOwnProperty(args[i])) {
                return false;
            }

            _object = _object[args[i]];
        }

        return true;
    }

}

module.exports = { where }