/*
 @author Zakai Hamilton
 @component AppCache
 */

package.app.cache = function AppCache(me) {
    me.launch = function () {
        if (me.the.core.property.get(me.singleton, "ui.node.parent")) {
            me.the.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.the.ui.element.create(__json__, "workspace", "self");
    };
    me.cache = function() {
        if(!me.singleton) {
            return me.the.storage.cache.local;
        }
        var storage = me.the.core.property.get(me.singleton.var.storage, "ui.basic.text");
        if(storage === "Local") {
            return me.the.storage.cache.local;
        }
        else if(storage === "Session") {
            return me.the.storage.cache.session;
        }
    };
    me.keyList = {
        get: function(object) {
            var cache = me.cache();
            if(cache) {
                var keys = cache.members();
                return keys.map(function(item) {
                    return [item];
                });
            }
        }
    };
    me.store = {
        set: function(object) {
            var cache = me.cache();
            if(cache) {
                var key = me.the.core.property.get(me.singleton.var.key, "ui.basic.text");
                var value = me.the.core.property.get(me.singleton.var.value, "ui.basic.text");
                if(key) {
                    me.the.core.property.set(cache, key, value);
                }
            }
        }
    };
    me.clear = {
        set: function(object) {
            var cache = me.cache();
            if(cache) {
                var key = me.the.core.property.get(me.singleton.var.key, "ui.basic.text");
                if(key) {
                    me.the.core.property.set(cache, key, "");
                    me.the.core.property.set(me.singleton.var.key, "ui.basic.text", "");
                    me.the.core.property.set(me.singleton.var.value, "ui.basic.text", "");
                }
            }
        }
    };
    me.clearAll = {
        set: function(object) {
            var cache = me.cache();
            if(cache) {
                cache.clear();
            }
        }
    };
    me.onChangeStorage = {
        set: function(object, string) {
            me.the.core.property.set(me.singleton.var.key, "ui.basic.text", "");
            me.the.core.property.set(me.singleton.var.value, "ui.basic.text", "");
        }
    };
    me.onChangeKey = {
        set: function(object) {
            var cache = me.cache();
            var key = me.the.core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.the.core.property.get(cache, key);
            me.the.core.property.set(me.singleton.var.value, "ui.basic.text", value);
        }
    };
};
