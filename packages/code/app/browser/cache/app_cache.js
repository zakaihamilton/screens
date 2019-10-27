/*
 @author Zakai Hamilton
 @component AppCache
 */

screens.app.cache = function AppCache(me, { core, ui, storage }) {
    me.launch = function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.keyList = {
        get: function () {
            var keys = storage.local.keyList();
            return keys.map(function (item) {
                return [item];
            });
        }
    };
    me.store = {
        set: function () {
            var key = core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = core.property.get(me.singleton.var.value, "ui.basic.text");
            if (key) {
                storage.local.set(key, value);
            }
        }
    };
    me.clear = {
        set: function () {
            var key = core.property.get(me.singleton.var.key, "ui.basic.text");
            if (key) {
                storage.local.set(key, "");
                core.property.set([me.singleton.var.key, me.singleton.var.value], "ui.basic.text", "");
            }
        }
    };
    me.clearAll = {
        set: function () {
            storage.local.empty();
        }
    };
    me.onChangeStorage = {
        set: function () {
            core.property.set([me.singleton.var.key, me.singleton.var.value], "ui.basic.text", "");
        }
    };
    me.onChangeKey = {
        set: function () {
            var key = core.property.get(me.singleton.var.key, "ui.basic.text");
            var value = me.storage.local.get(key);
            core.property.set(me.singleton.var.value, "ui.basic.text", value);
        }
    };
};
