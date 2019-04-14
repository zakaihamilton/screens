/*
 @author Zakai Hamilton
 @component AppLogger
 */

screens.app.logger = function AppLogger(me, packages) {
    const { core } = packages;
    me.launch = function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        me.singleton.isEnabled = false;
        return me.singleton;
    };
    me.init = function () {
        me.ui.options.load(me, null, {
            "source": "Browser",
            "filter": "",
            "autoRefresh": false
        });
        me.ui.options.toggleSet(me, null, {
            "autoRefresh": "app.logger.refresh"
        });
        me.ui.options.choiceSet(me, null, {
            "source": "app.logger.refresh"
        });
        me.ui.options.listSet(me, null, {
            "filter": "app.logger.refresh"
        });
    };
    me.send = async function (method) {
        var source = me.options.source.toLowerCase().replace(/\s/g, '_');
        var send_method = "send_" + source;
        var send = core.message[send_method];
        var args = Array.prototype.slice.call(arguments, 0);
        return await send.apply(null, args);
    };
    me.clear = {
        set: function (object) {
            var bindings = me.bindings(object);
            var logger = bindings.logger;
            core.property.set(logger, "ui.basic.text", "");
            me.send("core.console.clearMessages");
        }
    };
    me.refresh = async function (object) {
        var bindings = me.bindings(object);
        var logger = bindings.logger;
        core.property.set(logger, "ui.basic.text", "");
        var messages = await me.send("core.console.retrieveMessages");
        if (!messages) {
            messages = [];
        }
        if (me.options.filter) {
            messages = messages.filter(message => message.includes(me.options.filter));
        }
        core.property.set(logger, "ui.basic.text", messages.join("\r\n"));
        logger.scrollTop = logger.scrollHeight;
        var isEnabled = await me.send("core.console.isEnabled");
        me.singleton.isEnabled = isEnabled;
        clearTimeout(me.timerHandle);
        if (me.options.autoRefresh) {
            me.timerHandle = setInterval(() => {
                me.refresh(object);
            }, 5000);
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
    return "browser";
};
