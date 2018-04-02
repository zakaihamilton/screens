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
    };
    me.database = function (callback, name) {
        var database = me.databases[name];
        if (database) {
            callback(null, database);
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
                database = new Database(url);
                await database.connect();
                me.log("Connected correctly to server");
                me.databases[name] = database;
                callback(null, database);
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
