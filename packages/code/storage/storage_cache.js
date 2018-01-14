/*
 @author Zakai Hamilton
 @component StorageCache
 */

package.require("storage.cache", "browser");

package.storage.cache = function StorageCache(me) {
    me.init = function () {
        me.none = me.core.object.create(me);
        me.local = me.core.object.create(me);
        me.session = me.core.object.create(me);
        if (me.isSupported()) {
            me.none.storage = null;
            me.none.members = function () {
                return [];
            };
            me.none.clear = function () {
            };
            me.local.storage = localStorage;
            me.local.members = function () {
                return me.keyList(me.local);
            };
            me.local.clear = function () {
                me.local.storage.clear();
            };
            me.session.storage = sessionStorage;
            me.session.members = function () {
                return me.keyList(me.session);
            };
            me.session.clear = function () {
                me.session.storage.clear();
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
    me.validKey = function (key) {
        key = key.replace(/[.]/g, "-");
        return key;
    };
    me.store = {
        set: function (object, value) {
            var key = me.core.property.get(object, "storage.cache.key");
            var location = me.core.property.get(object, "storage.cache.location");
            if (!location) {
                location = "local";
            }
            if (key) {
                me.core.property.set(me[location], key, value);
            }
        }
    };
    me.restore = {
        set: function (object, value) {
            var key = me.core.property.get(object, "storage.cache.key");
            var location = me.core.property.get(object, "storage.cache.location");
            if (!location) {
                location = "local";
            }
            if (key) {
                var store = me.core.property.get(me[location], key);
                if(store !== null) {
                    me.core.property.set(object, value, store);
                }
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
    me.forward = function (object, property) {
        return {
            get: function (object) {
                if (object.storage) {
                    return object.storage.getItem(property);
                }
            },
            set: function (object, value) {
                if (object.storage && typeof value !== "undefined") {
                    if (value) {
                        object.storage.setItem(property, value);
                    } else {
                        object.storage.removeItem(property);
                    }
                }
            }
        };
    };
};
