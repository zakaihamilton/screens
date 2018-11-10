/*
 @author Zakai Hamilton
 @component CoreApp
 */

screens.core.app = function CoreApp(me) {
    me.available = async function (name) {
        if(!me.apps) {
            me.apps = await me.user.access.appList();
        }
        var available = me.apps && me.apps.includes(name);
        return available;
    };
    me.lookup = {
        set: async function (object, value, property) {
            if (!property) {
                return;
            }
            if (!await me.available(property)) {
                return;
            }
            var progress = me.ui.modal.launch("progress", {
                "title": property.charAt(0).toUpperCase() + property.slice(1),
                "delay": "1000"
            });
            await screens.include("app." + property);
            me.core.property.set(progress, "close");
            if (Array.isArray(value)) {
                value = value.slice(0);
                value.unshift("app." + property + ".launch");
                await me.core.message.send.apply(null, value);
            } else {
                value = [value];
                await me.core.message.send("app." + property + ".launch", value);
            }
        }
    };
    me.launch = async function (appName) {
        if (!appName) {
            return null;
        }
        if (!await me.available(appName)) {
            return null;
        }
        var result = null;
        var progress = me.ui.modal.launch("progress", {
            "title": appName.charAt(0).toUpperCase() + appName.slice(1),
            "delay": "1000"
        });
        me.log("launching app: " + appName);
        await screens.include("app." + appName);
        me.core.property.set(progress, "close");
        var appArgs = Array.prototype.slice.call(arguments, 1);
        result = await me.core.message.send("app." + appName + ".launch", appArgs);
        return result;
    };
    return "browser";
};
