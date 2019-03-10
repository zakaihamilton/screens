/*
 @author Zakai Hamilton
 @component CoreApp
 */

screens.core.app = function CoreApp(me, packages) {
    const { core, ui, app } = packages;
    me.init = async function () {
        core.listener.register(me.sendReady, core.login.id);
    };
    me.sendReady = async function () {
        for (var name of screens.components) {
            if (!(name.includes("app."))) {
                continue;
            }
            await core.util.performance(name + ".ready", async () => {
                try {
                    await core.message.send(name + ".ready");
                }
                catch (err) {
                    me.log_error(screens.platform + ": Failed to notify app: " + name + " for ready message with error: " + err);
                }
            });
        }
    };
    me.available = function (name) {
        let appList = core.util.info.appList;
        var available = core.util.info.admin || (appList && appList.includes(name));
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
        var progress = ui.modal.launch("progress", {
            "title": core.string.title(appName),
            "delay": "500"
        });
        result = await core.message.send("app." + appName + ".launch", appArgs);
        core.property.set(result, "show", true);
        core.property.set(progress, "close");
        return result;
    };
    me.singleton = function (appName) {
        var singleton = null;
        var component = app[appName];
        if (component) {
            singleton = component.singleton;
            if (core.property.get(component.singleton, "ui.node.parent")) {
                return component.singleton;
            }
        }
        return singleton;
    };
    return "browser";
};
