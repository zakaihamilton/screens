/*
 @author Zakai Hamilton
 @component StorageData
 */

screens.storage.data = function StorageData(me) {
    me.init = function (task) {
        me.log("initialising storage data");
        me.datastore = null;
        try {
            me.datastore = require('@google-cloud/datastore');
        } catch (e) {
            me.lock(task, task => {
                me.core.server.run(() => {
                    me.datastore = require('@google-cloud/datastore');
                    me.log("me.datastore:" + me.datastore);
                    me.unlock(task);
                }, "npm rebuild");
            });
        }
    };
    me.getService = function (callback) {
        if (me.service) {
            callback(me.service);
            return;
        }
        if(!me.datastore) {
            me.error("Datastore not initialized");
            callback(null);
        }
        me.service = me.datastore({
            keyFilename: me.core.private.path("google")
        });
        callback(me.service);
    };
    me.toDataStore = function (json, nonIndexed, user) {
        nonIndexed = nonIndexed || [];
        let results = [];
        Object.keys(json).forEach((key) => {
            if (json[key] === undefined) {
                return;
            }
            if(json[key] === "$user") {
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
    me.save = function (callback, value, type, id, nonIndexed) {
        var user = this.user;
        me.getService((service) => {
            const key = service.key([type, id]);
            service.save({
                key: key,
                data: me.toDataStore(value, nonIndexed, user)
            }, function (err) {
                callback(err);
            });
        });
    };
    me.load = function (callback, type, id) {
        me.getService((service) => {
            const key = service.key([type, id]);
            service.get(key, function (err, value) {
                callback(err, value);
            });
        });
    };
    me.verify = function (callback, value, type, id) {
        me.load((err, compare) => {
            callback(err, me.core.json.compare(compare, value), compare);
        }, type, id);
    };
    me.saveAndVerify = function (callback, value, type, id, nonIndexed) {
        me.save(err => {
            if (err) {
                callback(err);
            }
            me.verify((err, result, compare) => {
                if (err) {
                    callback(err);
                } else if (!result) {
                    var message = "verification mismatch between: " + JSON.stringify(value) + " and " + JSON.stringify(compare);
                    var error = new Error(message);
                    callback(error);
                } else {
                    callback(null);
                }
            }, value, type, id);
        }, value, type, id, nonIndexed);
    };
    me.query = function (callback, type, select, filters) {
        var user = this.user;
        me.getService((service) => {
            me.log("query type: " + type);
            var query = service.createQuery(type);
            if(select) {
                me.log("query select: " + JSON.stringify(select));
                query = query.select(select);
            }
            if(filters) {
                filters.map(filter => {
                    if(filter.value === "$user") {
                        me.log("query with user: " + JSON.stringify(user));
                        filter.value = user;
                    }
                    query = query.filter(filter.name, filter.operator, filter.value);
                });
            }
            service.runQuery(query)
                    .then(results => {
                        const items = results[0];
                        items.forEach(item => {
                            item.key = item[service.KEY];
                        });
                        callback(null, items);
                    })
                    .catch(err => {
                        me.error("failure to execute query, type: " + type + 
                            " select: " + JSON.stringify(select) +
                            " filters: " + JSON.stringify(filters) +
                            " error: " + err.message);
                        callback(err, null);
                    });
        });
    };
    return "server";
};
