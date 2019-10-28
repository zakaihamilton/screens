/*
 @author Zakai Hamilton
 @component UIGroup
 */

screens.ui.group = function UIGroup(me, { core, ui }) {
    me.lookup = {
        set: function (object, value, property) {
            if (Array.isArray(value)) {
                ui.element.create(value, object);
            } else if (value) {
                for (var key in value) {
                    core.property.set(object, key, value[key]);
                }
            }
            core.message.send("ui." + property + ".group", object);
        }
    };
};
