/*
 @author Zakai Hamilton
 @component UIAttribute
 */

screens.ui.attribute = function UIAttribute(me) {
    me.stylesheets = {};
    me.proxy.get = function (object, property) {
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
