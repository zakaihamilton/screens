/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me) {
    me.init = function () {
        const {Database, Model} = require('mongorito');
        me.Database = Database;
        me.Model = Model;
        me.databases = {};
        me.initModels();
    };
    me.initModels = function() {
        me.lock((task) => {
            var db = screens["db"];
            if(db) {
                var components = Object.keys(db);
                if(components) {
                    components.map(function (component_name) {
                        me.lock(task, (task) => {
                            var component = screens("db." + component_name);
                            if(component.register) {
                                me.log("db: " + component_name);
                                component.register(task);
                            }
                            me.unlock(task);
                        });
                    });
                }
            }
            me.unlock(task, () => {
                if(callback) {
                    callback();
                }
            });
        });
    };
    me.database = function (callback, name) {
        var dbHandle = me.databases[name];
        if (dbHandle) {
            callback(null, dbHandle);
            return;
        }
        me.core.private.keys(async (keys) => {
            var info = keys[name];
            if (!info) {
                err = name + " mongodb key not defined in private";
                me.error(err);
                callback(err);
                return;
            }
            var url = info.url;
            try {
                dbHandle = new Database(url);
                await dbHandle.connect();
                me.log("Connected correctly to server");
                me.databases[name] = dbHandle;
                callback(null, dbHandle);
            }
            catch(err) {
                err = "Failed to connect to server, url: " + url + " err: " + err;
                me.error(err);
                callback(err);
            }
        }, "mongodb");
    };
    return "server";
};
