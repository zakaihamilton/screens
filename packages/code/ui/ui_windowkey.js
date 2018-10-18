/*
 @author Zakai Hamilton
 @component UIWindowKey
 */

screens.ui.windowkey = function UIWindowKey(me) {
    me.lookup = {
        get: function (object, value, property) {
            if (property.endsWith("-")) {
                var window = me.widget.window.get(object);
                var key = me.core.property.get(window, "key");
                return property + key;
            }
            else {
                return property;
            }
        }
    };
};
