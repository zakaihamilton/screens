/*
 @author Zakai Hamilton
 @component StorageDB
 */

screens.storage.db = function StorageDB(me, { core, db, cache }) {
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
            clusterHandle = await me.mongodb.MongoClient.connect(url, {});
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
        const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map(
            ({ name }) => name
        );
        let collection = null;
        if (!collections.includes(location.collection)) {
            collection = await db.createCollection(location.collection, location.options);
        }
        else {
            collection = await db.collection(location.collection);
        }
        if (!collection) {
            throw "Cannot find collection for location: " + location.collection;
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
        var object = new me.mongodb.ObjectId(id);
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
        var [array, hash] = await me.getCache(location, query, "find");
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        var result = await core.util.performance(location.componentId + ".findById: " + id, async () => {
            return await collection.findOne(query);
        });
        await me.setCache(location, hash, result);
        return result;
    };
    me.find = async function (location, query) {
        var [array, hash] = await me.getCache(location, query, "find");
        if (array) {
            return array;
        }
        var collection = await me.collection(location);
        var result = await core.util.performance(location.componentId + ".find: " + JSON.stringify(query), async () => {
            return await collection.findOne(query);
        });
        await me.setCache(location, hash, result);
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
                    data._id = (new me.mongodb.ObjectId()).toString();
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
                    data._id = (new me.mongodb.ObjectId()).toString();
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
        if (location.componentId === "db.shared.stream") {
            console.log("query", query);
        }
        var [array, hash, queryString] = await me.getCache(location, query, params);
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
            const items = await cursor.toArray();
            if (params && params.project && params.project.user) {
                const users = await db.shared.user.list();
                for (const item of items) {
                    const user = users.find(user => user.user === item.user);
                    item.user = user ? user.name.split("@")[0] : "Unknown";
                }
            }
            return items;
        }, 500);
        await me.setCache(location, hash, array);
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
    me.getCache = async function (location, ...params) {
        var result = null;
        var string = me.queryAsString(params);
        var hash = core.string.hash(string);
        if (location.cache) {
            result = await cache.db.read(location.componentId + "/" + hash);
        }
        return [result, hash, string];
    };
    me.setCache = async function (location, hash, value) {
        if (location.cache) {
            await cache.db.write(location.componentId + "/" + hash, value);
            me.notifyCache(location);
        }
    };
    me.notifyCache = function (location) {
        if (location.cache && location.componentId) {
            setTimeout(() => {
                me.emptyCache(location);
            }, 10000);
        }
    };
    me.emptyCache = function (location) {
        if (location.cache) {
            cache.db.deleteAll(location.componentId);
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
