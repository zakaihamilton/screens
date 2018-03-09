/*
 @author Zakai Hamilton
 @component UIAttribute
 */

package.ui.attribute = function UIAttribute(me) {
    me.stylesheets = {};
    me.get = function (object, property) {
        return {
            get: function (object) {
                return object.getAttribute(property);
            },
            set: function (object, value) {
                if (typeof value !== "undefined") {
                    object.setAttribute(property, value);
                }
            }
        };
    };
};
