/*
 @author Zakai Hamilton
 @component UICacheKey
 */

package.ui.cachekey = function UICacheKey(me) {
    me.forward = function (object, property) {
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