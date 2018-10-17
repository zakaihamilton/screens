/*
 @author Zakai Hamilton
 @component UIWindowKey
 */

screens.ui.windowkey = function UIWindowKey(me) {
    me.proxy.get = function () {
        return {
            get: function (object, value, property) {
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
