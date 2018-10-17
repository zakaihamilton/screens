/*
 @author Zakai Hamilton
 @component CoreLink
 */

screens.core.link = function CoreLink(me) {
    me.lookup = {
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
