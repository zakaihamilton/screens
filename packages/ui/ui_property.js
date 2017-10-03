/*
 @author Zakai Hamilton
 @component UIProperty
 */

package.ui.property = function UIProperty(me) {
    me.group = {
        set: function(object, properties) {
            for (var key in properties) {
                me.set(object, key, properties[key]);
            }
        }
    };
    me.attribute = {
        set: function(object, properties) {
            for (var key in properties) {
                me.set(object, "ui.attribute." + key, properties[key]);
            }
        }
    };
    me.style = {
        set: function(object, properties) {
            for (var key in properties) {
                me.set(object, "ui.style." + key, properties[key]);
            }
        }
    };
    me.after = {
        set: function(object, properties) {
            setTimeout(function() {
                for (var key in properties) {
                    me.set(object, key, properties[key]);
                }
            }, 0);
        }
    };
    me.broadcast = {
        set: function(object, properties) {
            for (var key in properties) {
                me.set(object, key, properties[key]);
            }
            var childList = me.ui.node.childList(object);
            if(childList) {
                for(var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    if(!child.component) {
                        continue;
                    }
                    if(child.component === me.widget.window.id) {
                        continue;
                    }
                    if(child.getAttribute("noBroadcast")) {
                        continue;
                    }
                    me.broadcast.set(child, properties);
                }
            }
        }
    };
    me.bubble = {
        set: function(object, properties) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            if(parent) {
                me.broadcast.set(parent, properties);
                me.bubble.set(parent, properties);
            }
        }
    };
    me.themedPropertySet = function (name, callback) {
        return me.core.object.property(name, {
            "set": function (object, value, name) {
                if (value) {
                    me.set(object, "ui.property.broadcast", {
                        "ui.class.add": name
                    });
                } else {
                    me.set(object, "ui.property.broadcast", {
                        "ui.class.remove": name
                    });
                }
                if (callback) {
                    callback(object, value, name);
                }
            }
        });
    };
};
