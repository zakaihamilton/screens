/*
 @author Zakai Hamilton
 @component UIWindowKey
 */

package.ui.windowkey = function UIWindowKey(me) {
    me.get = function (object, property) {
        return {
            get: function (object) {
                if(property.endsWith("-")) {
                    var window = me.widget.window.window(object);
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