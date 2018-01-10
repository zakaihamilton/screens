/*
 @author Zakai Hamilton
 @component StorageData
 */

package.require("storage.data", "server");
package.storage.data = function StorageData(me) {
    me.init = function (task) {
        me.core.console.log("initialising storage data");
        me.lock(task, task => {
            me.core.server.run(() => {
                me.datastore = require('@google-cloud/datastore');
                me.core.console.log("retrieving version information");
                me.core.util.version(version => {
                    var date = new Date();
                    var id = date.getTime();
                    var data = {
                        date: date.toString(),
                        version: version,
                        port: me.core.http.port
                    };
                    me.core.console.log("startup: " + JSON.stringify(data) + " id: " + id);
                    me.saveAndVerify(err => {
                        if (err) {
                            me.core.console.log("failed to save startup to cloud: " + err.message);
                            me.unlock(task);
                        } else {
                            me.core.console.log("startup verification complete");
                        }
                        me.unlock(task);
                    }, data, "startup", id);
                });
            }, "npm rebuild");
        });
    };
    me.getService = function (callback) {
        if (me.service) {
            callback(me.service);
            return;
        }
        me.service = me.datastore({
            keyFilename: me.core.private.path("google")
        });
        callback(me.service);
    };
    me.toDataStore = function(json, nonIndexed) {
        nonIndexed = nonIndexed || [];
        let results = [];
        Object.keys(json).forEach((key) => {
            if (json[key] === undefined) {
                return;
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
        me.getService((service) => {
            const key = service.key([type, id]);
            service.save({
                key: key,
                data: me.toDataStore(value, nonIndexed)
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
            callback(err, JSON.stringify(compare) === JSON.stringify(value), value);
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
    me.query = function (callback, type, order) {
        me.getService((service) => {
            const query = service.createQuery(type).order(order);
            service
                    .runQuery(query)
                    .then(results => {
                        const items = results[0];
                        items.forEach(task => {
                            task.key = task[service.KEY];
                        });
                        callback(null, items);
                    })
                    .catch(err => {
                        callback(err, null);
                    });
        });
    };
};
