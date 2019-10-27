/*
 @author Zakai Hamilton
 @component UIWindowKey
 */

screens.ui.windowkey = function UIWindowKey(me, { core }) {
    me.lookup = {
        get: function (object, value, property) {
            if (property.endsWith("-")) {
                var window = me.widget.window.get(object);
                var key = core.property.get(window, "key");
                return property + key;
            }
            else {
                return property;
            }
        }
    };
};
