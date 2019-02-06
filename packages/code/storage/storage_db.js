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
            var err = name + " mongodb key not defined in private";
            me.log_error(err);
            throw err;
        }
        var url = info.url;
        try {
            var client = await me.mongodb.MongoClient.connect(url, { useNewUrlParser: true });
        }
        finally {
            unlock();
        }
        var db = client.db(info.db);
        me.log("connected to db: " + db.databaseName);
        me.databases[name] = db;
        return db;
    };
    me.collection = async function (location) {
        var db = await me.database(location.db);
        if (!db) {
            throw "Cannot find database for location: " + location.toString();
        }
        if (location.options) {
            let names = await db.listCollections().toArray();
            if (!names) {
                throw "Cannot find collection names for location: " + location.toString();
            }
            if (!names.map(item => item.name).includes(location.collection)) {
                await db.createCollection(location.collection, location.options);
            }
        }
        var collection = db.collection(location.collection);
        if (!collection) {
            throw "Cannot find collection for location: " + location.toString();
        }
        if (location.indexes) {
            for (let index of location.indexes) {
                collection.createIndex(index);
            }
            location.indexes = null;
        }
        return collection;
    };
    me.objectId = function (id) {
        id = id.toString();
        var object = me.mongodb.ObjectID(id);
        return object;
    };
    me.findByIds = async function (location, ids) {
        var collection = await me.collection(location);
        ids = ids.map(id => id.toString());
        var results = await collection.find({ "_id": { "$in": ids } }).toArray();
        return results;
    };
    me.find = async function (location, query) {
        var collection = await me.collection(location);
        var result = await collection.findOne(query);
        return result;
    };
    me.get = async function (location, id) {
        var collection = await me.collection(location);
        var result = await collection.findOne({ _id: id });
        return result;
    };
    me.set = async function (location, data) {
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
                    await collection.replaceOne({ _id: data._id }, data, { upsert: true });
                }
            }
        });
        if (!isArray) {
            data = data[0];
        }
        return data;
    };
    me.push = async function (location, data) {
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
                    await collection.insertOne(data);
                }
            }
        });
        if (!isArray) {
            data = data[0];
        }
        return data;
    };
    me.remove = async function (location, query, removeOne = true) {
        var collection = await me.collection(location);
        var result = null;
        if (removeOne) {
            result = await collection.deleteOne(query);
        }
        else {
            result = await collection.deleteMany(query);
        }
        return result.nRemoved;
    };
    me.list = async function (location, query = {}, projection, params) {
        var collection = await me.collection(location);
        if (!projection) {
            projection = {};
        }
        var cursor = await collection.find(query, projection);
        if (params) {
            for (var param in params) {
                cursor = cursor[param](params[param]);
            }
        }
        var array = await cursor.toArray();
        me.log("found " + array.length +
            " items for query: " + JSON.stringify(query) +
            " projection: " + JSON.stringify(projection),
            " params: " + JSON.stringify(params),
            " location: " + JSON.stringify(location));
        return array;
    };
    me.use = async function (location, query, data) {
        data = Object.assign({}, data);
        delete data._id;
        var collection = await me.collection(location);
        var result = await collection.replaceOne(query, data, { upsert: true });
        return result;
    };
    me.createIndex = async function (location, index) {
        var collection = await me.collection(location);
        collection.createIndex(index);
    };
    me.extension = function (component) {
        var getLocation = function (name) {
            var location = {};
            var tokens = name.split(".");
            location.collection = tokens.pop();
            location.db = tokens.pop();
            location.options = component.options;
            location.indexes = component.indexes;
            return location;
        };
        var mapping = {
            remove: "remove",
            get: "get",
            find: "find",
            set: "set",
            use: "use",
            findByIds: "findByIds",
            list: "list",
            createIndex: "createIndex",
            push: "push"
        };
        var location = getLocation(component.id);
        for (var source in mapping) {
            var target = mapping[source];
            component[source] = me[target].bind(null, location);
        }
    };
    return "server";
};