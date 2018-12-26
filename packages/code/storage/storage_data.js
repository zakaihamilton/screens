/*
 @author Zakai Hamilton
 @component StorageData
 */

screens.storage.data = function StorageData(me) {
    me.init = async function () {
        me.log("initialising storage data");
        me.datastore = require("@google-cloud/datastore");
        var keys = await me.core.private.keys("google");
        me.projectId = keys.project_id;
    };
    me.getService = function () {
        if (me.service) {
            return me.service;
        }
        if (!me.datastore) {
            me.log_error("Datastore not initialized");
            return null;
        }
        me.service = me.datastore({
            projectId: me.projectId,
            keyFilename: me.core.private.path("google")
        });
        return me.service;
    };
    me.toDataStore = function (json, nonIndexed, user) {
        nonIndexed = nonIndexed || [];
        let results = [];
        Object.keys(json).forEach((key) => {
            if (json[key] === undefined) {
                return;
            }
            if (json[key] === "$userId") {
                json[key] = user;
                me.log("storing with user: " + JSON.stringify(user));
            }
            results.push({
                name: key,
                value: json[key],
                excludeFromIndexes: nonIndexed.indexOf(key) !== -1
            });
        });
        return results;
    };
    me.save = async function (value, type, id, nonIndexed) {
        var user = this.userId;
        var service = me.getService();
        if (service) {
            const key = service.key([type, id]);
            return new Promise((resolve, reject) => {
                service.save({
                    key: key,
                    data: me.toDataStore(value, nonIndexed, user)
                }, function (err) {
                    if (err) {
                        err = "error saving data for type: " + type + " id: " + id + " err:" + err;
                        me.log_error(err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
    };
    me.delete = async function (type, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([type, id]);
            return new Promise((resolve, reject) => {
                service.delete(key, function (err) {
                    if (err) {
                        err = "error deleting data for type: " + type + " id: " + id + " err:" + err;
                        me.log_error(err);
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
    };
    me.load = async function (type, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([type, id]);
            return new Promise((resolve, reject) => {
                service.get(key, function (err, value) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        }
    };
    me.exists = async function (type, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([type, id]);
            return new Promise(resolve => {
                service.get(key, function (err, value) {
                    if (err) {
                        resolve(false);
                    }
                    else {
                        resolve(value ? true : false);
                    }
                });
            });
        }
    };
    me.verify = async function (value, type, id) {
        var compare = await me.load(type, id);
        var result = me.core.json.compare(compare, value);
        if (!result) {
            var err = "verification mismatch between: " + JSON.stringify(value) + " and " + JSON.stringify(compare);
            throw err;
        }
        return result;
    };
    me.saveAndVerify = async function (value, type, id, nonIndexed) {
        await me.save(value, type, id, nonIndexed);
        var result = await me.verify(value, type, id);
        return result;
    };
    me.query = async function (type, select, filters) {
        var user = this.userId;
        var service = me.getService();
        if (service) {
            me.log("query type: " + type);
            var query = service.createQuery(type);
            if (select) {
                me.log("query select: " + JSON.stringify(select));
                query = query.select(select);
            }
            if (filters) {
                filters.map(filter => {
                    if (filter.value === "$userId") {
                        me.log("query with user: " + JSON.stringify(user));
                        filter.value = user;
                    }
                    query = query.filter(filter.name, filter.operator, filter.value);
                });
            }
            try {
                var results = await service.runQuery(query);
                const items = results[0];
                items.forEach(item => {
                    item.key = item[service.KEY];
                });
                me.log("query returning " + items.length + " results");
                return items;
            }
            catch (err) {
                var long_error = "failure to execute query, type: " + type +
                    " select: " + JSON.stringify(select) +
                    " filters: " + JSON.stringify(filters) +
                    " error: " + err.message || err;
                me.log_error(long_error);
                return long_error;
            }
        }
    };
    return "server";
};
