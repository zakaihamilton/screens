/*
 @author Zakai Hamilton
 @component CoreApp
 */

screens.core.app = function CoreApp(me) {
    me.init = function () {
        me.core.listener.register(me.sendReady, me.core.login.id);
    };
    me.sendReady = async function () {
        if (!me.list) {
            me.list = await me.user.access.appList();
        }
        for (var name of screens.components) {
            if (!(name.includes("app."))) {
                continue;
            }
            await me.core.util.performance(name + ".ready", async () => {
                try {
                    await me.core.message.send(name + ".ready");
                }
                catch (err) {
                    console.error(screens.platform + ": Failed to notify app: " + name + " for ready message with error: " + err);
                }
            });
        }
    };
    me.available = function (name) {
        var available = me.core.util.isAdmin || (me.list && me.list.includes(name));
        return available;
    };
    me.lookup = {
        set: async function (object, value, property) {
            me.launch(property, value);
        }
    };
    me.launch = async function (appName) {
        if (!appName) {
            return null;
        }
        if (!me.available(appName)) {
            return null;
        }
        var result = null;
        var appArgs = Array.prototype.slice.call(arguments, 1);
        if (appArgs[0] && appArgs[0].target) {
            appArgs.splice(0, 1);
        }
        result = await me.core.message.send("app." + appName + ".launch", appArgs);
        return result;
    };
    me.singleton = function (appName) {
        var singleton = null;
        var app = me.app[appName];
        if (app) {
            singleton = app.singleton;
            if (me.core.property.get(app.singleton, "ui.node.parent")) {
                return app.singleton;
            }
        }
        return singleton;
    };
    return "browser";
};
