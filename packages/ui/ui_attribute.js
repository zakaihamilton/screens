/*
 @author Zakai Hamilton
 @component UIAttribute
 */

package.ui.attribute = function UIAttribute(me) {
    me.require = {platform: "browser"};
    me.stylesheets = {};
    me.forward = {
        get : function(object, property) {
            return {
                get: function (object) {
                    return object.getAttribute(property);
                },
                set: function (object, value) {
                    if (object && typeof value !== "undefined") {
                        object.setAttribute(property, value);
                    }
                }
            }
        }
    };
};
