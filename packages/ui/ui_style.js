/*
 @author Zakai Hamilton
 @component UIStyle
 */

package.ui.style = new function UIStyle() {
    var me = this;
    me.set = function(object, method, value) {
        object.style[method] = value;
    };
    me.get = function(object, method) {
        if(method in object.style) {
            return object.style[method];
        }
    };
};
