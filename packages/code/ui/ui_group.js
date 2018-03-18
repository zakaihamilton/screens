/*
 @author Zakai Hamilton
 @component UIGroup
 */

package.ui.group = function UIGroup(me) {
    me.get = function (object, property) {
        return {
            set: function (object, value) {
                if (Array.isArray(value)) {
                    me.ui.element(value, object);
                } else if (value) {
                    for (var key in value) {
                        me.core.property.set(object, key, value[key]);
                    }
                }
                me.core.message.send("ui." + property + ".group", object);
            }
        };
    };
};
