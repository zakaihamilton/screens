/*
 @author Zakai Hamilton
 @component UIGroup
 */

screens.ui.group = function UIGroup(me) {
    me.lookup = {
        set: function (object, value, property) {
            if (Array.isArray(value)) {
                me.ui.element.create(value, object);
            } else if (value) {
                for (var key in value) {
                    me.core.property.set(object, key, value[key]);
                }
            }
            me.core.message.send("ui." + property + ".group", object);
        }
    };
};
