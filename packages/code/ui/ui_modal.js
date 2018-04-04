/*
 @author Zakai Hamilton
 @component UIModal
 */

screens.ui.modal = function UIModal(me) {
    me.get = function (object, property) {
        return {
            set: async function (object, value) {
                if (Array.isArray(value)) {
                    value = value.slice(0);
                    value.unshift("modal." + property + ".launch");
                    return await me.core.message.send.apply(null, value);
                } else {
                    return await me.core.message.send("modal." + property + ".launch", value);
                }
            }
        };
    };
    me.apply = async function (appName) {
        var result = null;
        var appArgs = Array.prototype.slice.call(arguments, 1);
        return await me.core.message.send("modal." + appName + ".launch", appArgs);
    };
    return "browser";
};
