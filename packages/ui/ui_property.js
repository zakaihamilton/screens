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
            if(object.component !== me.widget.window.id) {
                object = me.widget.window.window(object);
            }
            if(object) {
                me.broadcast.set(object, properties);
                object = me.widget.window.parent(object);
            }
            if(!object) {
                object = document.body;
            }
            me.broadcast.set(object, properties);
        }
    };
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
                    me.set(object, "ui.property.broadcast", {"ui.theme.add": attribute});
                }
                else {
                    me.set(object, "ui.property.broadcast", {"ui.theme.remove": attribute});
                }
                if(callback) {
                    callback(object, value);
                }
            }
        };
    };
};
