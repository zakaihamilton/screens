/*
 @author Zakai Hamilton
 @component StorageCache
 */

package.require("storage.cache", "browser");

package.storage.cache = function StorageCache(me) {
    me.init = function () {
        me.local = me.core.object.create(me);
        me.session = me.core.object.create(me);
        if (me.isSupported()) {
            me.local.storage = localStorage;
            me.local.members = function() {
                return me.keyList(me.local);
            };
            me.session.storage = sessionStorage;
            me.session.members = function() {
                return me.keyList(me.session);
            };
        }
        me.key = me.core.object.property("storage.cache.key");
        me.location = me.core.object.property("storage.cache.location");
    };
    me.isSupported = function () {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
        }
    };
    me.validKey = function(key) {
        key = key.replace(/[.]/g, "-");
        return key;
    };
    me.store = {
        set: function(object, value) {
            var key = me.get(object, "storage.cache.key");
            var location = me.get(object, "storage.cache.location");
            if(key && location) {
                me.set(me[location], key, value);
            }
        }
    };
    me.restore = {
        set: function(object, value) {
            var key = me.get(object, "storage.cache.key");
            var location = me.get(object, "storage.cache.location");
            console.log("restore key: "+ key + " location: " + location + " value: " + value);
            if(key && location) {
                var store = me.get(me[location], key);
                me.set(object, value, store);
            }
        }
    };
    me.keyList = function (object) {
        var keys = [];
        if (object && object.storage) {
            for (var i = 0; i < object.storage.length; i++) {
                var key = object.storage.key(i);
                keys.push(key);
            }
            return keys;
        }
    };
    me.forward = {
        get: function (object, property) {
            return {
                get: function (object) {
                    if (object.storage) {
                        return object.storage.getItem(property);
                    }
                },
                set: function (object, value) {
                    console.log("storeLocal property:" + property + " value: " + value + "storage:" + object.storage);
                    if (object.storage && typeof value !== "undefined") {
                        if(value) {
                            object.storage.setItem(property, value);
                        }
                        else {
                            object.storage.removeItem(property);
                        }
                    }
                }
            };
        }
    };
};
