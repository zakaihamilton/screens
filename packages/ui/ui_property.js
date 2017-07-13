/*
 @author Zakai Hamilton
 @component UIProperty
 */

package.ui.property = function UIProperty(me) {
    me.broadcast = {
        set: function(object, properties) {
            for (var key in properties) {
                me.set(object, key, properties[key]);
            }
            var childList = me.ui.node.childList(object);
            if(childList) {
                for(var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    if(child.component === me.widget.window.id) {
                        continue;
                    }
                    me.broadcast.set(child, properties);
                }
            }
        }
    };
    me.notify = {
        set: function(object, properties) {
            var window = me.widget.window.window(object);
            if(window) {
                me.broadcast.set(window, properties);
            }
            var parent = me.widget.window.parent(window);
            if(!parent) {
                parent = document.body;
            }
            me.broadcast.set(parent, properties);
        }
    };
};
