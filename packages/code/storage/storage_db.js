/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me) {
    me.init = function () {
        me.mongodb = require("mongodb");
        me.split = require("split-string");
        me.databases = {};
    };
    me.database = async function (name) {
        var unlock = await me.core.mutex.lock();
        var database = me.databases[name];
        if (database) {
            unlock();
            return database;
        }
        var keys = await me.core.private.keys("mongodb");
        var info = keys[name];
        if (!info) {
            unlock();
            err = name + " mongodb key not defined in private";
            me.log_error(err);
            throw err;
        }
        var url = info.url;
        return new Promise((resolve, reject) => {
            me.mongodb.MongoClient.connect(url, function (err, client) {
                unlock();
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
        if(!db) {
            throw "Cannot find database for location: " + location.toString();
        }
        var collection = db.collection(location.collection);
        if(!collection) {
            throw "Cannot find collection for location: " + location.toString();
        }
        return collection;
    };
    me.objectId = function (id) {
        id = id.toString();
        var object = me.mongodb.ObjectID(id);
        return object;
    }
    me.findByIds = async function (location, ids) {
        var collection = await me.collection(location);
        var results = [];
        ids = ids.map(id => id.toString());
        var results = await collection.find({ "_id": { "$in": ids } }).toArray();
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
    me.remove = async function (location, query, removeOne=true) {
        var collection = await me.collection(location);
        var result = await collection.remove(query, removeOne);
        return result.nRemoved;
    };
    me.list = async function (location, query={}, projection, params) {
        var collection = await me.collection(location);
        var cursor = await collection.find(query, projection);
        if(params) {
            for(var param in params) {
                cursor = cursor[param](params[param]);
            }
        }
        var array = await cursor.toArray();
        me.log("found " + array.length +
            " items for query: " + JSON.stringify(query) +
            " projection: " + projection,
            " params: " + JSON.stringify(params),
            " location: " + JSON.stringify(location));
        return array;
    };
    me.use = async function (location, query, data) {
        var collection = await me.collection(location);
        var result = await collection.replaceOne(query, data, { upsert: true });
        return result;
    };
    me.createIndex = async function (location, index) {
        var collection = await me.collection(location);
        collection.createIndex(index);
    };
    me.extension = function(component) {
        var getLocation = function (name) {
            var location = {};
            tokens = name.split(".");
            location.collection = tokens.pop();
            location.db = tokens.pop();
            return location;
        };
        var mapping = {
            remove : "remove",
            get: "findOne",
            set: "set",
            use: "use",
            findByIds: "findByIds",
            list: "list"
        };
        var location = getLocation(component.id);
        for(var source in mapping) {
            var target = mapping[source];
            component[source] = me[target].bind(null, location);
        }
    };
    return "server";
};