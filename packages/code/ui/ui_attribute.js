/*
 @author Zakai Hamilton
 @component UIAttribute
 */

screens.ui.attribute = function UIAttribute(me, packages) {
    me.stylesheets = {};
    me.lookup = {
        get: function (object, value, property) {
            property = property.replace(/#/, "");
            if (object.getAttribute) {
                return object.getAttribute(property);
            }
        },
        set: function (object, value, property) {
            property = property.replace(/#/, "");
            if (typeof value !== "undefined") {
                if (value === null) {
                    object.removeAttribute(property);
                }
                else {
                    object.setAttribute(property, value);
                }
            }
        }
    };
};
