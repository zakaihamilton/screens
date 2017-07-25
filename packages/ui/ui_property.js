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
    me.trickle = {
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
                    me.trickle.set(child, properties);
                }
            }
        }
    };
    me.bubble = {
        set: function(object, properties) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            if(parent) {
                me.trickle.set(parent, properties);
                me.bubble.set(parent, properties);
            }
        }
    };
    me.notify = {
        set: function(object, properties) {
            var window = me.widget.window.window(object);
            if(window) {
                me.trickle.set(window, properties);
            }
            var parent = me.widget.window.parent(window);
            if(!parent) {
                parent = document.body;
            }
            me.trickle.set(parent, properties);
        }
    };
    me.toggleOptionSet = function (options, key, callback) {
        return {
            get: function (object) {
                return options[key];
            },
            set: function (object, value) {
                options[key] = !options[key];
                if(callback) {
                    callback(options, key, options[key]);
                }
            }
        };
    };
    me.themedPropertySet = function (name, callback) {
        return me.core.object.property(name, {
            "set": function (object, name, value) {
                if (value) {
                    me.set(object, "ui.property.trickle", {
                        "ui.theme.add": name
                    });
                } else {
                    me.set(object, "ui.property.trickle", {
                        "ui.theme.remove": name
                    });
                }
                if (callback) {
                    callback(object, name, value);
                }
            }
        });
    };
};
