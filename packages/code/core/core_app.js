/*
 @author Zakai Hamilton
 @component CoreApp
 */

package.core.app = function CoreApp(me) {
    me.get = function (object, property) {
        return {
            set: function (object, value) {
                package.include("app." + property, function () {
                    if (Array.isArray(value)) {
                        value = value.slice(0);
                        value.unshift("app." + property + ".launch");
                        me.core.message.send.apply(null, value);
                    } else {
                        me.core.message.send("app." + property + ".launch", value);
                    }
                });
            }
        };
    };
    me.preload = function(callback, appName) {
        package.include("app." + appName, function () {
            callback();
        });
    };
    me.launch = function (callback, appName, appArgs) {
        var result = null;
        package.include("app." + appName, function () {
            if (Array.isArray(appArgs)) {
                appArgs = appArgs.slice(0);
            }
            if(!appArgs) {
                appArgs = [];
            }
            result = me.core.message.send("app." + appName + ".launch", appArgs);
            if (callback) {
                callback(result);
            }
        });
    };
    return "browser";
};
