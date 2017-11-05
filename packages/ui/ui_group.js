/*
 @author Zakai Hamilton
 @component UIGroup
 */

package.ui.group = function UIGroup(me) {
    me.forward = {
        get: function (object, property) {
            return {
                set: function (object, value) {
                    if (Array.isArray(value)) {
                        me.the.ui.element.create(value, object);
                    } else if (value) {
                        for (var key in value) {
                            me.the.core.property.set(object, key, value[key]);
                        }
                    }
                    me.the.core.message.send("ui." + property + ".group", object);
                }
            };
        }
    };
};
