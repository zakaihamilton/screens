/*
 @author Zakai Hamilton
 @component StorageLocal
 */

screens.storage.local = function StorageLocal(me) {
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
            var key = me.core.property.get(object, "storage.local.key");
            if (key) {
                me.set(key, value);
            }
        }
    };
    me.restore = {
        set: function (object, method) {
            var key = me.core.property.get(object, "storage.local.key");
            if (key) {
                var value = me.get(key);
                me.core.property.set(object, method, value);
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
