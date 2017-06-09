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
    me.index = function(object) {
        for (var index = 0; (object = object.previousElementSibling); index++);
        return index;
    };
    me.shift = function(object, target) {
        if(object && target && object !== target && object.parentNode == target.parentNode) {
            var object_index = me.index(object);
            var target_index = me.index(target);
            if(!target.nextSibling) {
                object.parentNode.appendChild(object);
            }
            else if(!target.previousSibling) {
                object.parentNode.insertBefore(object, target);
            }
            else if(object_index > target_index) {
                object.parentNode.insertBefore(object, target);
            }
            else {
                object.parentNode.insertBefore(object, target.nextSibling);
            }
        }
    };
};