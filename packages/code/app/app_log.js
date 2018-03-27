/*
 @author Zakai Hamilton
 @component AppLog
 */

screens.app.log = function AppLog(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        me.singleton.isEnabled = false;
        return me.singleton;
    };
    me.init = function () {
        me.ui.options.load(me, null, {
            "source": "Browser"
        });
        me.ui.options.choiceSet(me, "source", function (object, options, key, value) {
            me.core.property.notify(me.singleton, "app.log.refresh");
        });
    };
    me.send = function (method, callback) {
        var source = me.options["source"];
        var send = null;
        if (source === "Server") {
            send = me.core.message.send_server;
        } else if (source === "Client") {
            send = me.core.message.send_client;
        } else if (source === "Browser") {
            send = me.core.message.send_browser;
        }
        var args = Array.prototype.slice.call(arguments, 0);
        send.apply(null, args);
    };
    me.clear = {
        set: function (object) {
            var log = me.singleton.var.log;
            me.core.property.set(log, "ui.basic.text", "");
            me.send("core.console.clearMessages", function () {

            });
        }
    };
    me.refresh = {
        set: function (object) {
            var log = me.singleton.var.log;
            me.core.property.set(log, "ui.basic.text", "");
            me.send("core.console.retrieveMessages", function (messages) {
                me.core.property.set(log, "ui.basic.text", messages.join("\r\n"));
            });
            me.send("core.console.isEnabled", function (isEnabled) {
                me.singleton.isEnabled = isEnabled;
            });
        }
    };
    me.enable = {
        get: function (object) {
            return me.singleton.isEnabled;
        },
        set: function (object) {
            me.singleton.isEnabled = !me.singleton.isEnabled;
            me.send("core.console.enable", function () {

            }, me.singleton.isEnabled);
        }
    };
};
