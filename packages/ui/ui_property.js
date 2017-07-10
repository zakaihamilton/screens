/*
 @author Zakai Hamilton
 @component UIProperty
 */

package.ui.property = function UIProperty(me) {
    me.broadcast = function(object, name, value, stopAtWindow=true) {
        if(object) {
            me.set(object, name, value);
            var childList = me.ui.node.childList(object);
            if(childList) {
                for(var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    if(stopAtWindow && child.component === me.widget.window.id) {
                        continue;
                    }
                    me.broadcast(child, name, value, stopAtWindow);
                }
            }
        }
    };
    me.notify = function(object, name, value) {
        if(object) {
            if(object.component !== me.widget.window.id) {
                object = me.widget.window.window(object);
            }
            if(object) {
                me.broadcast(object, name, value);
                object = me.widget.window.parent(object);
            }
            if(!object) {
                object = document.body;
            }
            me.broadcast(object, name, value);
        }
    };
    me.notifyAll = function(name, value) {
        me.broadcast(document.body, name, value, false);
    }
    me.toggleOptionSet = function(source, option) {
        return {
            get: function (object) {
                return source.options[option];
            },
            set: function (object, value) {
                source.options[option] = !source.options[option];
            }
        }
    }
    me.attributeSet = function(attribute, callback) {
        return {
            get: function(object) {
                return object[attribute];
            },
            set: function(object, value) {
                object[attribute] = value;
                if(value) {
                    me.ui.property.broadcast(object, "ui.theme.add", attribute);
                }
                else {
                    me.ui.property.broadcast(object, "ui.theme.remove", attribute);
                }
                if(callback) {
                    callback(object, value);
                }
            }
        };
    };
};
