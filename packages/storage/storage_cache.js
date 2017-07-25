/*
 @author Zakai Hamilton
 @component DataStorage
 */

package.require("storage.cache", "browser");

package.storage.cache = function StorageCache(me) {
    me.init = function () {
        console.log("storage cache");
        me.local = me.core.object.create(me);
        me.session = me.core.object.create(me);
        if (me.isSupported()) {
            me.local.storage = localStorage;
            me.session.storage = sessionStorage;
        }
        me.key = me.core.object.property("storage.cache.key");
    };
    me.isSupported = function () {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
        }
    };
    me.storeLocal = {
        set: function(object) {
            var key = me.get(object, "storage.cache.key");
            if(key) {
                var value = me.get(object, "ui.basic.text");
                me.set(me.local, key, value);
            }
        }
    };
    me.restoreLocal = {
        set: function(object) {
            var key = me.get(object, "storage.cache.key");
            if(key) {
                var value = me.get(me.local, key);
                me.set(object, "ui.basic.text", value);
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
