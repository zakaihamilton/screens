/*
 @author Zakai Hamilton
 @component UIStyle
 */

package.ui.style = new function() {
    this.set = function(object, method, value) {
        object.style[method] = value;
    };
    this.get = function(object, method) {
        if(method in object.style) {
            return object.style[method];
        }
    };
};
