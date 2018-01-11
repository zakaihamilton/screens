/*
 @author Zakai Hamilton
 @component UIProperty
 */

package.ui.property = function UIProperty(me) {
    me.init = function() {
        me.afterQueue = [];
        me.afterQueueTimer = null;
    };
    me.attribute = {
        set: function(object, properties) {
            for (var key in properties) {
                me.core.property.set(object, "ui.attribute." + key, properties[key]);
            }
        }
    };
    me.style = {
        set: function(object, properties) {
            for (var key in properties) {
                me.core.property.set(object, "ui.style." + key, properties[key]);
            }
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
                        for (var key in list.properties) {
                            me.core.property.set(list.object, key, list.properties[key]);
                        }
                    });
                }, 0);
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
                    me.core.property.set(object, "ui.property.broadcast", {
                        "ui.class.add": name
                    });
                } else {
                    me.core.property.set(object, "ui.property.broadcast", {
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
