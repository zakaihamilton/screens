screens.fs.mongo = function FSMongo(me, { storage }) {
    me.init = function () {
        storage.fs.register("mongo", me.driver);
    };
};

screens.fs.mongo.driver = function FSMongoDriver(me, { core, storage }) {
    me.mkdir = function () {
        /* ignore on aws */
    };
    me.location = function (path = "") {
        const [dbName, collectionName, recordId] = path.split("/").filter(Boolean);
        return [dbName, collectionName, recordId];
    };
    me.rmdir = async function (path) {
        const [dbName, collectionName] = me.location(path);
        const cluster = await storage.db.cluster();
        if (collectionName) {
            const collection = await cluster.db(dbName).collection(collectionName);
            collection.drop();
        }
        else if (dbName) {
            const db = await cluster.db(dbName);
            await db.dropDatabase();
        }
    };
    me.readdir = async function (path) {
        const [dbName, collectionName] = me.location(path);
        const cluster = await storage.db.cluster();
        if (collectionName) {
            const collection = cluster.db(dbName).collection(collectionName);
            const records = await collection.find({}, { projection: { _id: 1 } }).toArray();
            return records.map(record => record._id.toString());
        }
        else if (dbName) {
            const collections = await cluster.db(dbName).listCollections().toArray();
            return collections.map(collection => collection.name);
        }
        else {
            const admin = cluster.db().admin();
            const { databases } = await admin.listDatabases();
            return databases.map(database => database.name);
        }
    };
    me.listdir = async function (path) {
        const [dbName, collectionName] = me.location(path);
        const cluster = await storage.db.cluster();
        if (collectionName) {
            const collection = cluster.db(dbName).collection(collectionName);
            const records = await collection.find({}).toArray();
            return records.map(record => {
                return {
                    name: record._id.toString(),
                    stat: {
                        isDirectory: false,
                        isFile: true,
                        isSymbolicLink: false,
                        isReadOnly: false,
                        size: JSON.stringify(record).length
                    }
                };
            });
        }
        else if (dbName) {
            const collections = await cluster.db(dbName).listCollections().toArray();
            return collections.map(collection => {
                return {
                    name: collection.name,
                    stat: {
                        isDirectory: true,
                        isFile: false,
                        isSymbolicLink: false,
                        isReadOnly: true
                    }
                };
            });
        }
        else {
            const admin = cluster.db().admin();
            const { databases } = await admin.listDatabases();
            return databases.map(database => {
                return {
                    name: database.name,
                    stat: {
                        isDirectory: true,
                        isFile: false,
                        isSymbolicLink: false,
                        isReadOnly: true
                    }
                };
            });
        }
    };
    me.readFile = async function (path) {
        const [dbName, collectionName, recordId] = me.location(path);
        const cluster = await storage.db.cluster();
        if (!recordId) {
            return null;
        }
        const collection = cluster.db(dbName).collection(collectionName);
        const record = await collection.findOne({ _id: storage.db.objectId(recordId) });
        let result = null;
        if (record) {
            result = JSON.stringify(record, null, 4);
        }
        return result;
    };
    me.writeFile = async function (path, data) {
        if (!core.json.isValid(data)) {
            throw "invalid json: " + data;
        }
        const [dbName, collectionName, recordId] = me.location(path);
        const cluster = await storage.db.cluster();
        if (!recordId) {
            return null;
        }
        const collection = cluster.db(dbName).collection(collectionName);
        data = JSON.parse(data || "{}");
        data = { ...data };
        delete data._id;
        await collection.replaceOne({ _id: storage.db.objectId(recordId) }, data, { upsert: true });
    };
    me.copyFile = async function (from, to) {
        const data = await me.readFile(from);
        const array = [...data];
        await me.writeFile(to, array);
    };
    me.unlink = async function (path) {
        const [dbName, collectionName, recordId] = me.location(path);
        const cluster = await storage.db.cluster();
        if (!recordId) {
            return null;
        }
        const collection = cluster.db(dbName).collection(collectionName);
        await collection.deleteOne({ _id: storage.db.objectId(recordId) });
    };
    me.rename = async function (from, to) {
        const data = await me.readFile(from);
        const array = [...data];
        await me.writeFile(to, array);
        await me.unlink(from);
    };
    me.stat = async function (path) {
        const [dbName, collectionName, recordId] = me.location(path);
        const cluster = await storage.db.cluster();
        if (recordId) {
            const collection = cluster.db(dbName).collection(collectionName);
            const record = await collection.findOne({ _id: storage.db.objectId(recordId) });
            if (!record) {
                return null;
            }
            return {
                name: recordId,
                isDirectory: false,
                isFile: true,
                isSymbolicLink: false,
                size: JSON.stringify(record).length
            };
        }
        else if (collectionName) {
            const collections = await cluster.db(dbName).listCollections().toArray();
            if (!collections.find(collection => collection.name === collectionName)) {
                return null;
            }
            return {
                name: collectionName,
                isDirectory: true,
                isFile: false,
                isSymbolicLink: false
            };
        }
        else if (dbName) {
            const admin = cluster.db().admin();
            const { databases } = await admin.listDatabases();
            if (!databases.find(database => database.name === dbName)) {
                return null;
            }
            return {
                name: dbName,
                isDirectory: true,
                isFile: false,
                isSymbolicLink: false,
                isReadOnly: false
            };
        }
        else {
            return {
                name: "",
                isDirectory: true,
                isFile: false,
                isSymbolicLink: false,
                isReadOnly: false
            };
        }
    };
    me.lstat = async function (path) {
        return me.stat(path);
    };
    me.symlink = async function () {
        throw "Links not supported";
    };
    me.readlink = async function () {
        throw "Links not supported";
    };
    me.du = async function (path) {
        const result = await me.metadata(path);
        return result && result.size;
    };
    return "server";
};