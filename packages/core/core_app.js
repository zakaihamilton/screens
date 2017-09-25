/*
    @author Zakai Hamilton
    @component CoreApp
*/

package.core.app = function CoreApp(me) {
    me.forward = {
        get : function(object, property) {
            return {
                set: function (object, value) {
                    package.include("app." + property, function (info) {
                        if (info.complete) {
                            if(Array.isArray(value)) {
                                value = value.slice(0);
                                value.unshift("app." + property + ".launch");
                                me.send.apply(null, value);
                            }
                            else {
                                me.send("app." + property + ".launch", value);
                            }
                        }
                    });
                }
            };
        }
    };
    me.launch = function(callback, appName, args) {
        var result = null;
        package.include("app." + appName, function (info) {
            if (info.complete) {
                if(Array.isArray(args)) {
                    args = args.slice(0);
                }
                result = me.send("app." + appName + ".launch", args);
                if(callback) {
                    callback(result);
                }
            }
        });
    };
};
