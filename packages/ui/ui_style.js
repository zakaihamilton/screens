/*
 @author Zakai Hamilton
 @component UIStyle
 */

package.ui.style = function UIStyle(me) {
    me.require = {platform: "browser"};
    me.stylesheets = {};
    me.forward = {
        get : function(object, property) {
            return {
                get: function (object) {
                    return getComputedStyle(object)[property];
                },
                set: function (object, value) {
                    if (object && typeof value !== "undefined") {
                        object.style[property] = value;
                    }
                }
            }
        }
    };
};
