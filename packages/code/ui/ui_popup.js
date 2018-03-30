/*
 @author Zakai Hamilton
 @component UIPopup
 */

screens.ui.popup = function UIPopup(me) {
    me.get = function (object, property) {
        return {
            set: function (object, value) {
                if (Array.isArray(value)) {
                    value = value.slice(0);
                    value.unshift("popup." + property + ".launch");
                    return me.core.message.send.apply(null, value);
                } else {
                    return me.core.message.send("popup." + property + ".launch", value);
                }
            }
        };
    };
    me.apply = function (appName) {
        var result = null;
        var appArgs = Array.prototype.slice.call(arguments, 1);
        return me.core.message.send("popup." + appName + ".launch", appArgs);
    };
    return "browser";
};
