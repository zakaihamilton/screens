/*
 @author Zakai Hamilton
 @component UICacheKey
 */

package.ui.cachekey = function UICacheKey(me) {
    me.forward = function (object, property) {
        return {
            get: function (object) {
                var window = me.package.widget.window.window(object);
                var key = me.package.core.property.get(window, "key");
                return property + key;
            }
        };
    };
};