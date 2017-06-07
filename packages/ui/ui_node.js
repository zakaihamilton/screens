/*
 @author Zakai Hamilton
 @component UINode
 */

package.ui.node = new function UINode() {
    var me = this;
    me.get_parent = function(object) {
        return object.parentNode;
    };
    me.set_parent = function(object, value) {
        value.appendChild(object);
    };
};