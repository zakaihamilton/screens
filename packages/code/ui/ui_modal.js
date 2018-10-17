/*
 @author Zakai Hamilton
 @component UIModal
 */

screens.ui.modal = function UIModal(me) {
    me.lookup = {
        set: function (object, value, property) {
            if (Array.isArray(value)) {
                value = value.slice(0);
                value.unshift("modal." + property + ".launch");
                return me.core.message.send.apply(null, value);
            } else {
                return me.core.message.send("modal." + property + ".launch", value);
            }
        }
    };
    me.proxy.apply = function (appName) {
        var result = null;
        var appArgs = Array.prototype.slice.call(arguments, 1);
        return me.core.message.send("modal." + appName + ".launch", appArgs);
    };
    return "browser";
};
