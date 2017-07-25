/*
 @author Zakai Hamilton
 @component AppStorage
 */

package.app.storage = function AppStorage(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "body", "self");
    };
    me.cache = function() {
        if(!me.singleton) {
            return me.storage.cache.local;
        }
        var storage = me.get(me.singleton.var.storage, "ui.basic.text");
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
                var keys = me.storage.cache.keyList(cache);
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
                var key = me.get(me.singleton.var.key, "ui.basic.text");
                var value = me.get(me.singleton.var.value, "ui.basic.text");
                if(key) {
                    me.set(cache, key, value);
                }
            }
        }
    };
    me.onChangeStorage = {
        set: function(object, string) {
            console.log("Changed storage to: " + string);
        }
    };
};
