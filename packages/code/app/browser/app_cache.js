/*
 @author Zakai Hamilton
 @component AppCache
 */

screens.app.cache = function AppCache(me, packages) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.keyList = {
        get: function () {
            var keys = me.storage.local.keyList();
            return keys.map(function (item) {
                return [item];
            });
        }
    };
    me.store = {
        set: function () {
            var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.core.property.get(me.singleton.var.value, "ui.basic.text");
            if (key) {
                me.storage.local.set(key, value);
            }
        }
    };
    me.clear = {
        set: function () {
            var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
            if (key) {
                me.storage.local.set(key, "");
                me.core.property.set([me.singleton.var.key, me.singleton.var.value], "ui.basic.text", "");
            }
        }
    };
    me.clearAll = {
        set: function () {
            me.storage.local.empty();
        }
    };
    me.onChangeStorage = {
        set: function () {
            me.core.property.set([me.singleton.var.key, me.singleton.var.value], "ui.basic.text", "");
        }
    };
    me.onChangeKey = {
        set: function () {
            var key = me.core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.storage.local.get(key);
            me.core.property.set(me.singleton.var.value, "ui.basic.text", value);
        }
    };
};
