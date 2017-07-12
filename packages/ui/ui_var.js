/*
 @author Zakai Hamilton
 @component UIVar
 */

package.ui.var = function UIVar(me) {
    me.require = {platform: "browser"};
    me.forward = {
        get : function(object, property) {
            return {
                get: function (object) {
                    return object.var[property];
                },
                set: function (object, value) {
                    if (object && typeof value !== "undefined") {
                        object.var[property] = value;
                    }
                }
            };
        }
    };
};
