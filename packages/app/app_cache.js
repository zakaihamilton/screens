/*
 @author Zakai Hamilton
 @component AppCache
 */

package.app.cache = function AppCache(me) {
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.package.ui.element.create(__json__, "workspace", "self");
    };
    me.cache = function() {
        if(!me.singleton) {
            return me.package.storage.cache.local;
        }
        var storage = me.package.core.property.get(me.singleton.var.storage, "ui.basic.text");
        if(storage === "Local") {
            return me.package.storage.cache.local;
        }
        else if(storage === "Session") {
            return me.package.storage.cache.session;
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
                var key = me.package.core.property.get(me.singleton.var.key, "ui.basic.text");
                var value = me.package.core.property.get(me.singleton.var.value, "ui.basic.text");
                if(key) {
                    me.package.core.property.set(cache, key, value);
                }
            }
        }
    };
    me.clear = {
        set: function(object) {
            var cache = me.cache();
            if(cache) {
                var key = me.package.core.property.get(me.singleton.var.key, "ui.basic.text");
                if(key) {
                    me.package.core.property.set(cache, key, "");
                    me.package.core.property.set(me.singleton.var.key, "ui.basic.text", "");
                    me.package.core.property.set(me.singleton.var.value, "ui.basic.text", "");
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
            me.package.core.property.set(me.singleton.var.key, "ui.basic.text", "");
            me.package.core.property.set(me.singleton.var.value, "ui.basic.text", "");
        }
    };
    me.onChangeKey = {
        set: function(object) {
            var cache = me.cache();
            var key = me.package.core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.package.core.property.get(cache, key);
            me.package.core.property.set(me.singleton.var.value, "ui.basic.text", value);
        }
    };
};
