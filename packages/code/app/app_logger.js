/*
 @author Zakai Hamilton
 @component AppLogger
 */

screens.app.logger = function AppLogger(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        me.singleton.isEnabled = false;
        return me.singleton;
    };
    me.init = function () {
        me.ui.options.load(me, null, {
            "source": "Browser",
            "type": "core.console.retrieveMessages"
        });
        me.ui.options.choiceSet(me, null, {
            "source": () => {
                me.core.property.notify(me.singleton, "app.logger.refresh");
            },
            "type": () => {
                me.core.property.notify(me.singleton, "app.logger.refresh");
            }
        });
    };
    me.send = async function (method) {
        var source = me.options.source.toLowerCase().replace(/\s/g, '_');
        var send_method = "send_" + source;
        var send = me.core.message[send_method];
        var args = Array.prototype.slice.call(arguments, 0);
        return await send.apply(null, args);
    };
    me.clear = {
        set: function (object) {
            var bindings = me.bindings(object);
            var logger = bindings.logger;
            me.core.property.set(logger, "ui.basic.text", "");
            me.send("core.console.clearMessages");
        }
    };
    me.refresh = {
        set: async function (object) {
            var bindings = me.bindings(object);
            var logger = bindings.logger;
            me.core.property.set(logger, "ui.basic.text", "");
            var messages = await me.send(me.options.type);
            if (!messages) {
                messages = [];
            }
            me.core.property.set(logger, "ui.basic.text", messages.join("\r\n"));
            var isEnabled = await me.send("core.console.isEnabled");
            me.singleton.isEnabled = isEnabled;
        }
    };
    me.enable = {
        get: function () {
            return me.singleton.isEnabled;
        },
        set: function () {
            me.singleton.isEnabled = !me.singleton.isEnabled;
            me.send("core.console.enable", me.singleton.isEnabled);
        }
    };
    me.bindings = function () {
        var ids = [
            "logger"
        ];
        var bindings = {};
        for (var id of ids) {
            bindings[id] = document.getElementById("app.logger." + id);
        }
        return bindings;
    };
};
