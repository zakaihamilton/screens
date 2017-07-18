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
                    var styles = null;
                    var method = object._getComputedStyle;
                    if(method) {
                        styles = method(object);
                    }
                    else {
                        styles = getComputedStyle(object);
                    }
                    return styles[property];
                },
                set: function (object, value) {
                    if (object && typeof value !== "undefined" && object.style) {
                        object.style[property] = value;
                    }
                }
            }
        }
    };
};
