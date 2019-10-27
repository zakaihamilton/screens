/*
 @author Zakai Hamilton
 @component UIModal
 */

screens.ui.modal = function UIModal(me, packages) {
    const { core } = packages;
    me.lookup = {
        set: function (object, value, property) {
            if (Array.isArray(value)) {
                value = value.slice(0);
                value.unshift("modal." + property + ".launch");
                return core.message.send.apply(null, value);
            } else {
                return core.message.send("modal." + property + ".launch", value);
            }
        }
    };
    me.launch = function (appName, ...appArgs) {
        return core.message.send("modal." + appName + ".launch", appArgs);
    };
    return "browser";
};
