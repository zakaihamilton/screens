/*
 @author Zakai Hamilton
 @component UICacheKey
 */

package.ui.cachekey = function UICacheKey(me) {
    me.forward = {
        get : function(object, property) {
            return {
                get: function (object) {
                    var window = me.widget.window.window(object);
                    var key = me.get(window, "key");
                    return property + key;
                }
            };
        }
    };    
};