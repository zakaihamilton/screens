/*
 @author Zakai Hamilton
 @component CoreApp
 */

screens.core.app = function CoreApp(me, { core, app }) {
    me.init = async function () {
        core.listener.register(me.sendReady, core.login.id);
    };
    me.sendReady = async function () {
        let methods = {};
        for (var name of screens.components) {
            await core.util.performance(name + ".ready", async () => {
                let component = screens.browse(name);
                if (component.remote) {
                    return;
                }
                try {
                    await core.message.send(name + ".ready", methods);
                }
                catch (err) {
                    me.log_error(screens.platform + ": Failed to notify: " + name + " for ready message with error: " + err);
                }
            });
        }
        let results = await core.client.send(methods);
        for (let method in results) {
            await core.message.send(method, results[method]);
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
    me.launch = async function (appName, ...appArgs) {
        if (!appName) {
            return null;
        }
        if (!me.available(appName)) {
            return null;
        }
        var result = null;
        if (appArgs[0] && appArgs[0].target) {
            appArgs.splice(0, 1);
        }
        result = await core.message.send("app." + appName + ".launch", appArgs);
        core.property.set(result, "show", true);
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
