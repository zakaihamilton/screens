/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me) {
    me.init = function () {
        me.mongodb = require('mongodb');
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
        return new Promise((resolve, reject) => {
            me.mongodb.MongoClient.connect(url, function(err, client) {
                if(err) {
                    reject(err);
                }
                else {
                    var db = client.db(info.db);
                    me.log("connected to db: " + db.databaseName);
                    me.databases[name] = db;
                    resolve(db);
                }
            });
        });
    };
    me.collection = async function(location) {
        var db = await me.database(location.db);
        var collectionName = location.collection;
        var collection = db.collection(collectionName);
        return collection;
    };
    me.objectId = function(id) {
        return me.mongodb.ObjectId(id);
    }
    me.findOne = async function(location, id) {
        var collection = await me.collection(location);
        var result = await collection.findOne({_id:id});
        return result;
    };
    me.insertOne = async function(location, data) {
        var collection = await me.collection(location);
        var result = await collection.insertOne(data);
        return result.insertedId;
    };
    me.updateOne = async function(location, id, data) {
        var collection = await me.collection(location);
        var result = await collection.updateOne({_id:id}, data);
        return result.modifiedCount;
    };
    me.removeOne = async function(location, id) {
        var collection = await me.collection(location);
        var result = await collection.remove({_id:id}, true);
        return result.nRemoved;
    };
    me.removeAll = async function(location) {
        var collection = await me.collection(location);
        var result = await collection.remove({_id:id});
        return result.nRemoved;
    };
    me.list = async function(location, query, projection) {
        var collection = await me.collection(location);
        var array = await collection.find(query, projection).toArray();
        me.log("found " + array.length + " items for query: " + JSON.stringify(query));
        return array;
    };
    return "server";
};
