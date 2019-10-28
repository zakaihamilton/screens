/*
 @author Zakai Hamilton
 @component StorageData
 */

screens.storage.data = function StorageData(me, { core }) {
    me.init = async function () {
        me.log("initialising storage data");
        me.datastore = require("@google-cloud/datastore");
        var keys = await core.private.keys("google");
        me.projectId = keys.project_id;
    };
    me.getService = function () {
        if (me.handle) {
            return me.handle;
        }
        if (!me.datastore) {
            me.log_error("Datastore not initialized");
            return null;
        }
        me.handle = me.datastore({
            projectId: me.projectId,
            keyFilename: core.private.path("google")
        });
        return me.handle;
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
    me.save = async function (value, kind, id, nonIndexed) {
        var user = this.userId;
        var service = me.getService();
        if (service) {
            const key = service.key([kind, id]);
            return new Promise((resolve, reject) => {
                service.save({
                    key: key,
                    data: me.toDataStore(value, nonIndexed, user)
                }, function (err) {
                    if (err) {
                        err = "error saving data for kind: " + kind + " id: " + id + " err:" + err;
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
    me.delete = async function (kind, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([kind, id]);
            return new Promise((resolve, reject) => {
                service.delete(key, function (err) {
                    if (err) {
                        err = "error deleting data for kind: " + kind + " id: " + id + " err:" + err;
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
    me.load = async function (kind, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([kind, id]);
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
    me.exists = async function (kind, id) {
        var service = me.getService();
        if (service) {
            const key = service.key([kind, id]);
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
    me.query = async function (kind, select) {
        var service = me.getService();
        if (service) {
            var query = service.createQuery(kind);
            if (select) {
                query = query.select(select);
            }
            try {
                var results = await service.runQuery(query);
                const items = results[0];
                items.forEach(item => {
                    item.key = item[service.KEY];
                });
                return items;
            }
            catch (err) {
                var long_error = "failure to execute query, kind: " + kind +
                    " select: " + JSON.stringify(select) +
                    " error: " + err.message || err;
                me.log_error(long_error);
                return long_error;
            }
        }
    };
    me.kinds = async function () {
        var service = me.getService();
        if (service) {
            const query = service.createQuery("__kind__").select("__key__");

            const [entities] = await service.runQuery(query);
            var kinds = entities.map(entity => entity[service.KEY].name);
            kinds = kinds.filter(kind => !kind.startsWith("__"));

            return kinds;
        }
    };
    me.migrate = async function (prefix, collection) {
        var kinds = await me.kinds();
        var migratedKinds = {};
        kinds = kinds.filter(kind => kind.startsWith(prefix));
        if (!kinds.length) {
            return;
        }
        for (var kind of kinds) {
            var [package, component, target, private] = kind.split(".");
            let entities = await me.query(kind);
            if (!entities.length) {
                continue;
            }
            if (!target) {
                continue;
            }
            var targetId = "db." + collection + "." + target;
            var targetComponent = screens.browse(targetId);
            if (!targetComponent) {
                throw targetId + " not found in db package";
            }
            migratedKinds[kind] = 0;
            for (var entity of entities) {
                entity = JSON.parse(JSON.stringify(entity));
                delete entity.key;
                entity.package = package;
                entity.component = component;
                entity.private = private ? private : null;
                await targetComponent.store(entity);
                migratedKinds[kind]++;
            }
        }
        return migratedKinds;
    };
    return "server";
};
