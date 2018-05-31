/*
 @author Zakai Hamilton
 @component UIAttribute
 */

screens.ui.attribute = function UIAttribute(me) {
    me.stylesheets = {};
    me.proxy.get = function (object, property) {
        return {
            get: function (object) {
                if(object.getAttribute) {
                    return object.getAttribute(property);
                }
            },
            set: function (object, value) {
                if (typeof value !== "undefined") {
                    if(value === null) {
                        object.removeAttribute(property);
                    }
                    else {
                        object.setAttribute(property, value);
                    }
                }
            }
        };
    };
};
