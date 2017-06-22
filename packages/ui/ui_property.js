/*
 @author Zakai Hamilton
 @component UIProperty
 */

package.ui.property = function UIProperty(me) {
    me.broadcast = function(object, name, value) {
        if(object) {
            me.set(object, name, value);
            if(object.childNodes) {
                for(var childIndex = 0; childIndex < object.childNodes.length; childIndex++) {
                    var child = object.childNodes[childIndex];
                    if(child.component === me.widget.window.id) {
                        continue;
                    }
                    me.broadcast(child, name, value);
                }
            }
        }
    };
};
