/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me, packages) {
    const { core } = packages;
    me.init = async function () {
        me.mongodb = require("mongodb");
        me.clusterHandle = null;
        core.mutex.enable(me.id, true);
        me.keys = await core.private.keys("mongodb");
    };
    me.supported = function () {
        return !(!me.keys);
    };
    me.cluster = async function () {
        if (!me.keys) {
            me.keys = await core.private.keys("mongodb");
            if (!me.keys) {
                throw "No private keys for database";
            }
        }
        var clusterHandle = null;
        var unlock = await core.mutex.lock(me.id);
        try {
            clusterHandle = me.clusterHandle;
            if (clusterHandle) {
                unlock();
                return clusterHandle;
            }
            var url = me.keys.url;
            clusterHandle = await me.mongodb.MongoClient.connect(url, { useNewUrlParser: true });
            me.clusterHandle = clusterHandle;
            me.log("connected to cluster: " + url);
        }
        finally {
            unlock();
        }
        return clusterHandle;
    };
    me.database = async function (name) {
        var cluster = await me.cluster();
        var db = null;
        var info = me.keys[name];
        if (!info) {
            var err = name + " mongodb key not defined in private";
            me.log_error(err);
            throw err;
        }
        db = cluster.db(info.db);
        return db;
    };
    me.collection = async function (location) {
        var db = await me.database(location.db);
        if (!db) {
            throw "Cannot find database for location: " + location.toString();
        }
        var collection = await new Promise((resolve, reject) => {
            db.collection(location.collection, { strict: location.options ? true : false }, async (error, handle) => {
                if (error) {
                    try {
                        handle = await db.createCollection(location.collection, location.options);
                        resolve(handle);
                    }
                    catch (createError) {
                        try {
                            handle = await db.collection(location.collection);
                        }
                        catch (getError) {
                            reject(createError);
                        }
                    }
                }
                else {
                    resolve(handle);
                }
            });
        });
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
        var result = await core.util.performance(location.componentId + ".findById: " + id, async () => {
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
        var result = await core.util.performance(location.componentId + ".find: " + JSON.stringify(query), async () => {
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
            if (location.options && location.options.capped) {
                result = await collection.drop();
                let db = await me.database(location.db);
                await db.createCollection(location.collection, location.options);
            }
            else {
                result = await collection.deleteMany(query);
            }
        }
        me.notifyCache(location);
        if (result) {
            delete result.connection;
        }
        return result;
    };
    me.list = async function (location, query = {}, params) {
        var [array, hash, queryString] = me.getCache(location, query, params);
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        array = await core.util.performance(location.componentId + ".list: " + queryString, async () => {
            var cursor = await collection.find(query);
            if (params) {
                for (var param in params) {
                    cursor = cursor[param](params[param]);
                }
            }
            return await cursor.toArray();
        }, 500);
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
        if (result) {
            delete result.connection;
        }
        return result;
    };
    me.createIndex = async function (location, index) {
        var collection = await me.collection(location);
        collection.createIndex(index);
    };
    me.queryAsString = function (query) {
        var string = JSON.stringify(core.json.map(query, item => {
            if (item && item.source) {
                return item.source;
            }
            return item;
        }));
        return string;
    };
    me.getCache = function (location) {
        var args = Array.prototype.slice.call(arguments, 1);
        var result = null;
        var string = me.queryAsString(args);
        var hash = core.string.hash(string);
        if (location.cache) {
            result = location.cache[hash];
        }
        return [result, hash, string];
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
            }, 2500);
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