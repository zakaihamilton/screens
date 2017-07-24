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
    };
    me.isSupported = function () {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
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
