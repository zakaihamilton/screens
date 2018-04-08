/*
 @author Zakai Hamilton
 @component UIWindowKey
 */

screens.ui.windowkey = function UIWindowKey(me) {
    me.proxy.get = function (object, property) {
        return {
            get: function (object) {
                if(property.endsWith("-")) {
                    var window = me.widget.window(object);
                    var key = me.core.property.get(window, "key");
                    return property + key;
                }
                else {
                    return property;
                }
            }
        };
    };
};