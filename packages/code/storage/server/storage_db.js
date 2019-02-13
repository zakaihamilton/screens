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
        var db = null;
        var unlock = await me.core.mutex.lock(me.id);
        try {
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
            var client = await me.mongodb.MongoClient.connect(url, { useNewUrlParser: true });
            db = client.db(info.db);
            me.log("connected to db: " + db.databaseName);
            me.databases[name] = db;
        }
        finally {
            unlock();
        }
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
    me.findById = async function (location, id) {
        var query = { _id: id };
        var [array, hash] = me.getCache(location, query, "find");
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        var result = await me.core.util.performance(location.componentId + ".findById: " + id, async () => {
            return await collection.findOne(query);
        });
        me.setCache(location, hash, result);
        return result;
    };
    me.find = async function (location, query) {
        var [array, hash] = me.getCache(location, query, "find");
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        var result = await me.core.util.performance(location.componentId + ".find: " + JSON.stringify(query), async () => {
            return await collection.findOne(query);
        });
        me.setCache(location, hash, result);
        return result;
    };
    me.store = async function (location, listOrSingle) {
        var collection = await me.collection(location);
        var isSingle = false;
        var list = listOrSingle;
        if (!Array.isArray(listOrSingle)) {
            isSingle = true;
            list = [listOrSingle];
        }
        for (var data of list) {
            if (data) {
                if (!data._id) {
                    data._id = me.mongodb.ObjectID().toString();
                }
                if (data._id) {
                    await collection.replaceOne({ _id: data._id }, data, { upsert: true });
                }
            }
        }
        listOrSingle = list;
        if (isSingle) {
            listOrSingle = list[0];
        }
        me.notifyCache(location);
        return listOrSingle;
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
        me.notifyCache(location);
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
        me.notifyCache(location);
        return result.nRemoved;
    };
    me.list = async function (location, query = {}, params) {
        var [array, hash] = me.getCache(location, query, params);
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        array = await me.core.util.performance(location.componentId + ".list: " + JSON.stringify(query), async () => {
            var cursor = await collection.find(query);
            if (params) {
                for (var param in params) {
                    cursor = cursor[param](params[param]);
                }
            }
            return await cursor.toArray();
        });
        me.setCache(location, hash, array);
        return array;
    };
    me.use = async function (location, query, data) {
        if (!data) {
            return me.remove(location, query);
        }
        data = Object.assign({}, query, data);
        delete data._id;
        var collection = await me.collection(location);
        var result = await collection.replaceOne(query, data, { upsert: true });
        me.notifyCache(location);
        return result;
    };
    me.createIndex = async function (location, index) {
        var collection = await me.collection(location);
        collection.createIndex(index);
    };
    me.getCache = function (location) {
        var args = Array.prototype.slice.call(arguments, 1);
        var result = null;
        var hash = me.core.string.hash(JSON.stringify(args));
        if (location.cache) {
            result = location.cache[hash];
            if (result) {
                me.log("using db cache for: " + location.componentId + " = " + JSON.stringify(args));
            }
        }
        return [result, hash];
    };
    me.setCache = function (location, hash, value) {
        if (location.cache) {
            location.cache[hash] = value;
        }
    };
    me.notifyCache = function (location) {
        if (location.cache && location.componentId) {
            me.emptyCache(location);
            if (location.timer) {
                clearTimeout(location.timer);
            }
            location.timer = setTimeout(async () => {
                location.timer = null;
                await me.db.events.msg.send(location.componentId + ".emptyCache");
            }, 1000);
        }
    };
    me.emptyCache = function (location) {
        if (location.cache) {
            location.cache = {};
        }
    };
    me.handle = async function (location, query, callback) {
        var data = await me.find(location, query);
        if (!data) {
            data = await callback();
        }
        return data;
    };
    me.extension = function (component) {
        var getLocation = function (name) {
            var location = {};
            var tokens = name.split(".");
            location.collection = tokens.pop();
            location.db = tokens.pop();
            location.options = component.options;
            location.indexes = component.indexes;
            location.cache = component.cache;
            location.componentId = component.id;
            return location;
        };
        var mapping = [
            "remove",
            "store",
            "findById",
            "find",
            "use",
            "findByIds",
            "list",
            "createIndex",
            "push",
            "emptyCache",
            "handle"
        ];
        var location = getLocation(component.id);
        for (var name of mapping) {
            component[name] = me[name].bind(null, location);
        }
    };
    return "server";
};