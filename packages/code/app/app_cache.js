/*
 @author Zakai Hamilton
 @component AppCache
 */

package.app.cache = function AppCache(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
    me.cache = function() {
        if(!me.singleton) {
            return me.storage.cache.local;
        }
        var storage = me.core.property.get(me.singleton.var.storage, "ui.basic.text");
        if(storage === "Local") {
            return me.storage.cache.local;
        }
        else if(storage === "Session") {
            return me.storage.cache.session;
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
                var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
                var value = me.core.property.get(me.singleton.var.value, "ui.basic.text");
                if(key) {
                    me.core.property.set(cache, key, value);
                }
            }
        }
    };
    me.clear = {
        set: function(object) {
            var cache = me.cache();
            if(cache) {
                var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
                if(key) {
                    me.core.property.set(cache, key, "");
                    me.core.property.set([me.singleton.var.key,me.singleton.var.value], "ui.basic.text", "");
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
            me.core.property.set([me.singleton.var.key,me.singleton.var.value], "ui.basic.text", "");
        }
    };
    me.onChangeKey = {
        set: function(object) {
            var cache = me.cache();
            var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.core.property.get(cache, key);
            me.core.property.set(me.singleton.var.value, "ui.basic.text", value);
        }
    };
};
