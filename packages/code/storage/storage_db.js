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
    me.database = async function (name) {
        var database = me.databases[name];
        if (database) {
            return database;
        }
        var keys = await me.core.private.keys("mongodb");
        var info = keys[name];
        if (!info) {
            err = name + " mongodb key not defined in private";
            me.error(err);
            throw err;
        }
        var url = info.url;
        try {
            database = new me.Database(url);
            await database.connect();
            me.log("Connected correctly to server");
            me.databases[name] = database;
            return database;
        }
        catch(err) {
            err = "Failed to connect to server, url: " + url + " err: " + err;
            me.error(err);
            throw err;
        }
    };
    me.createModel = async function(dbName) {
        var db = await me.database(dbName);
        var model = class extends me.Model {};
        db.register(model);
        return model;
    };
    return "server";
};
