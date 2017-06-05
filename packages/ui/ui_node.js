/*
 @author Zakai Hamilton
 @component UINode
 */

package.ui.node = new function() {
    this.get_parent = function(object) {
        return object.parentNode;
    };
    this.set_parent = function(object, value) {
        value.appendChild(object);
    };
};