/*
 @author Zakai Hamilton
 @component CoreLink
 */

package.core.link = function CoreLink(me) {
    me.forward = function (object, property) {
        return {
            set: function (object, value) {
                if (typeof value !== "undefined") {
                    if (typeof property === "string") {
                        property = property.replace(/-/g, ".");
                    }
                    me.package.core.property.link(property, value, true, object);
                }
            }
        };
    };
};
