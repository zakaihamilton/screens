/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me) {
    me.init = function () {
        me.mongodb = require('mongodb');
        me.split = require('split-string');
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
            me.mongodb.MongoClient.connect(url, function (err, client) {
                if (err) {
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
    me.collection = async function (location) {
        var db = await me.database(location.db);
        var collectionName = location.collection;
        var collection = db.collection(collectionName);
        return collection;
    };
    me.objectId = function (id) {
        id = id.toString();
        var object = me.mongodb.ObjectID(id);
        return object;
    }
    me.findByIds = async function(location, ids) {
        var collection = await me.collection(location);
        var results = [];
        ids = ids.map(id => id.toString());
        var results = await collection.find({"_id":{"$in":ids}}).toArray();
        return results;
    };
    me.findOne = async function (location, id) {
        var collection = await me.collection(location);
        var result = await collection.findOne({ _id: id });
        return result;
    };
    me.set = async function (location, data) {
        var count = 0;
        var collection = await me.collection(location);
        var isArray = true;
        if (!Array.isArray(data)) {
            isArray = true;
            data = [data];
        }
        data.map(async data => {
            if (data) {
                if (!data._id) {
                    data._id = me.mongodb.ObjectID().toString();
                }
                if (data._id) {
                    var result = await collection.replaceOne({ _id: data._id }, data, { upsert: true });
                    me.log("replace result: " + JSON.stringify(result));
                }
            }
        });
        if (!isArray) {
            data = data[0]
        }
        return data;
    };
    me.remove = async function (location, idOrList) {
        var collection = await me.collection(location);
        if (Array.isArray(idOrList)) {
            var result = await collection.remove({ _id: { "$in": idOrList } });
            return result.nRemoved;
        }
        else {
            var result = await collection.remove({ _id: idOrList }, true);
            return result.nRemoved;
        }
    };
    me.removeAll = async function (location) {
        var collection = await me.collection(location);
        var result = await collection.remove({ _id: id });
        return result.nRemoved;
    };
    me.list = async function (location, query, projection) {
        var collection = await me.collection(location);
        var cursor = await collection.find(query, projection);
        var array = await cursor.toArray();
        me.log("found " + array.length +
            " items for query: " + JSON.stringify(query) +
            " location: " + JSON.stringify(location));
        return array;
    };
    me.createIndex = async function (location, index) {
        var collection = await me.collection(location);
        collection.createIndex(index);
    };
    return "server";
};

screens.storage.db.helper = function StorageDBHelper(me) {
    me.extend = function (component) {
        component.remove = async function (objectId) {
            return await me.remove(objectId, component.id);
        };
        component.get = async function (objectId) {
            return await me.get(objectId, component.id);
        };
        component.set = async function (data) {
            return await me.set(component.id, data);
        };
        component.list = async function (userId, params, count) {
            return await me.list(userId, component.id, params, count);
        };
        component.findByIds = async function(ids) {
            return await me.findByIds(component.id, ids);
        };
    };
    me.location = function (name) {
        var location = {};
        tokens = name.split(".");
        location.collection = tokens.pop();
        location.db = tokens.pop();
        return location;
    };
    me.remove = async function (objectId, name) {
        var object = await me.upper.remove(me.location(name), objectId);
        return object;
    };
    me.get = async function (objectId, name) {
        var object = await me.upper.findOne(me.location(name), objectId);
        return object;
    };
    me.set = async function (name, data) {
        var result = await me.upper.set(me.location(name), data);
        return result;
    };
    me.findByIds = async function(name, ids) {
        var result = await me.upper.findByIds(me.location(name), ids);
        return result;
    };
    me.list = async function (userId, name, params, projection) {
        params = Object.assign({}, params);
        params.user = userId || 0;
        var list = await me.upper.list(me.location(name), params, projection);
        return list;
    };    
};
