/*
 @author Zakai Hamilton
 @component CoreApp
 */

screens.core.app = function CoreApp(me) {
    me.get = function (object, property) {
        return {
            set: function (object, value) {
                if(!property) {
                    return;
                }
                var progress = me.ui.popup("progress", {
                    "title":property.charAt(0).toUpperCase() + property.slice(1),
                    "delay":"250"
                });
                screens.include("app." + property, function () {
                    me.core.property.set(progress, "close");
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
        screens.include("app." + appName, function () {
            callback();
        });
    };
    me.apply = function (callback, appName) {
        if(!appName) {
            callback();
            return null;
        }
        var result = null;
        var progress = me.ui.popup("progress", {
            "title":appName.charAt(0).toUpperCase() + appName.slice(1),
            "delay":"250"
        });
        screens.include("app." + appName, () => {
            me.core.property.set(progress, "close");
            var appArgs = Array.prototype.slice.call(arguments, 2);
            result = me.core.message.send("app." + appName + ".launch", appArgs);
            if (callback) {
                callback(result);
            }
        });
    };
    return "browser";
};
