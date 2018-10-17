/*
 @author Zakai Hamilton
 @component CoreLink
 */

screens.core.link = function CoreLink(me) {
    me.proxy.get = function () {
        return {
            set: function (object, value, property) {
                if (typeof value !== "undefined") {
                    if (typeof property === "string") {
                        property = property.replace(/-/g, ".");
                    }
                    me.core.property.link(property, value, true, object);
                }
            }
        };
    };
};
