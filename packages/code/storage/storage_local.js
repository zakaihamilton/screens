/*
 @author Zakai Hamilton
 @component StorageLocal
 */

screens.storage.local = function StorageLocal(me, packages) {
    const { core } = packages;
    me.get = function (key) {
        key = me.validKey(key);
        return localStorage.getItem(key);
    };
    me.set = function (key, value) {
        key = me.validKey(key);
        if (typeof value !== "undefined") {
            if (value) {
                localStorage.setItem(key, value);
            } else {
                localStorage.removeItem(key);
            }
        }
    };
    me.empty = function () {
        localStorage.clear();
    };
    me.validKey = function (key) {
        key = key.replace(/[.]/g, "-");
        return key;
    };
    me.key = {
        get: function (object) {
            return object.local_key;
        },
        set: function (object, value) {
            return object.local_key = value;
        }
    };
    me.store = {
        set: function (object, value) {
            var key = core.property.get(object, "storage.local.key");
            if (key) {
                me.set(key, value);
            }
        }
    };
    me.restore = {
        set: function (object, method) {
            var key = core.property.get(object, "storage.local.key");
            if (key) {
                var value = me.get(key);
                core.property.set(object, method, value);
            }
        }
    };
    me.keyList = function () {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            keys.push(key);
        }
        return keys;
    };
    me.lookup = {
        get: function (object, value, property) {
            return me.get(property);
        },
        set: function (object, value, property) {
            return me.set(property, value);
        }
    };
    return "browser";
};

screens.storage.local.db = function StorageLocalDb(me, packages) {
    const { core } = packages;
    me.databases = {};
    me.database = async function (dbName, storeName) {
        core.mutex.enable(me.id, true);
        var unlock = await core.mutex.lock(me.id);
        let handle = me.databases[dbName];
        if (handle) {
            unlock();
            return handle;
        }
        return new Promise((resolve, reject) => {
            let dbVersion = 1;
            var request = indexedDB.open(dbName, dbVersion);
            request.onerror = () => {
                reject("Cannot open database:" + request.error.name);
            };
            request.onupgradeneeded = (e) => {
                if (e.oldVersion < 1) {
                    request.result.createObjectStore(storeName);
                }
                if (e.oldVersion !== dbVersion) {
                    request.result.deleteObjectStore(storeName);
                    request.result.createObjectStore(storeName);
                }
            };
            request.onsuccess = () => {
                me.databases[dbName] = request.result;
                unlock();
                resolve(request.result);
            };
        });
    };
    me.method = async function (collection, methodName, ...params) {
        let storeName = "screens";
        if (me.platform === "server" || me.platform === "service") {
            return;
        }
        var access = {
            "get": "readonly",
            "put": "readwrite",
            "delete": "readwrite",
            "clear": "readwrite",
            "count": "readonly",
            "getAllKeys": "readonly"
        };
        var dbHandle = await me.database(collection, storeName);
        var transaction = dbHandle.transaction(storeName, access[methodName]);
        return new Promise((resolve, reject) => {
            let storeHandle = transaction.objectStore(storeName);
            let method = storeHandle[methodName];
            let request = method.call(storeHandle, ...params);
            request.onerror = () => {
                reject(request.error.name);
            };
            transaction.oncomplete = () => {
                resolve(request.result);
            };
        });
    };
    me.get = function (collection, key) {
        return me.method(collection, "get", key);
    };
    me.set = function (collection, key, value) {
        if (typeof value === "undefined" || value === null) {
            return me.method(collection, "delete", key);
        }
        else {
            return me.method(collection, "put", value, key);
        }
    };
    me.clear = function (collection) {
        return me.method(collection, "clear");
    };
    me.length = function (collection) {
        return me.method(collection, "count");
    };
    me.keys = function (collection) {
        return me.method(collection, "getAllKeys");
    };
};
