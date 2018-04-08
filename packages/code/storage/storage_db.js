/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me) {
    me.init = function () {
        me.mongodb = require('mongodb');
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
        return new Promise((resolve, reject) => {
            me.mongodb.MongoClient.connect(url, function(err, db) {
                if(err) {
                    reject(err);
                }
                else {
                    me.databases[name] = db;
                    resolve(db);
                }
            });
        });
    };
    me.collection = async function(location) {
        var db = await me.database(location.db);
        var collection = db.collection(location.collection);
        return collection;
    };
    me.objectId = function(id) {
        return me.mongodb.ObjectId(id);
    }
    me.get = async function(location, objectId) {
        var collection = await me.collection(location);
        var result = await collection.findOne({_id:objectId});
        return result;
    };
    me.set = async function(location, data) {
        var collection = await me.collection(location);
        var single = false;
        if(!Array.isArray(data)) {
            data = [data];
            single = true;
        }
        for(item in data) {
            var res = await new Promise((resolve, reject) => {
                collection.save(data, (err, res) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
            if(res._id) {
                item._id = res._id;
            }
        }
        if(single) {
            data = data[0];
        }
        return data;
    };
    return "server";
};
