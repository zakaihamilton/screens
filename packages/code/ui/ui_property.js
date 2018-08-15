/*
 @author Zakai Hamilton
 @component UIProperty
 */

screens.ui.property = function UIProperty(me) {
    me.init = function() {
        me.afterQueue = [];
        me.afterQueueTimer = null;
    };
    me.handle = function(object, prefix, properties) {
        if(Array.isArray(properties)) {
            for (var property of properties) {
                me.handle(object, prefix, property);
            }
        }
        else {
            for (var key in properties) {
                var name = key;
                if(prefix) {
                    name = prefix + key;
                }
                me.core.property.set(object, name, properties[key]);
            }
        }
    };
    me.attribute = {
        set: function(object, properties) {
            me.handle(object, "ui.attribute.", properties);
        }
    };
    me.style = {
        set: function(object, properties) {
            me.handle(object, "ui.style.", properties);
        }
    };
    me.after = {
        set: function(object, properties) {
            me.afterQueue.push({object:object, properties:properties});
            if(!me.afterQueueTimer) {
                me.afterQueueTimer = setTimeout(function() {
                    me.afterQueueTimer = null;
                    var queue = me.afterQueue;
                    me.afterQueue = [];
                    queue.map(list => {
                        me.handle(list.object, null, list.properties);
                    });
                }, properties.timeout || 0);
            }
        }
    };
    me.broadcast = {
        set: function(object, properties) {
            for (var key in properties) {
                me.core.property.set(object, key, properties[key]);
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
            var window = me.widget.window(object);
            var parent = me.widget.window.parent(window);
            if(parent) {
                me.broadcast.set(parent, properties);
                me.bubble.set(parent, properties);
            }
        }
    };
    me.themedProperties = function (object, mapping) {
        for(var name in mapping) {
            me.core.property.set(object, "core.object." + name, {
                "set": function (object, value, name) {
                    if (value) {
                        me.core.property.set(object, "ui.property.broadcast", {
                            "ui.class.add": name
                        });
                    } else {
                        me.core.property.set(object, "ui.property.broadcast", {
                            "ui.class.remove": name
                        });
                    }
                    var callback = mapping[name];
                    if (callback) {
                        callback(object, value, name);
                    }
                }
            });
        }
    };
};
