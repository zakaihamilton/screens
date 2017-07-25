/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.event = function CoreEvent(me) {
    me.init = function() {
        package.broadcast = me.broadcast;
    }
    me.forward = {
        get : function(object, property) {
            return {
                set: function (object, value) {
                    if (typeof value !== "undefined") {
                        me.link(property, value, true, object);
                    }
                }
            };
        }
    };
    me._forwarding_list = {};
    me.link = function (source, target, enabled, object) {
        if(!object) {
            object=me;
        }
        if(object !== me) {
            source = me.core.property.fullname(object, source);
            target = me.core.property.fullname(object, target);
        }
        var source_list = object._forwarding_list[source];
        if (!source_list) {
            object._forwarding_list[source] = {};
        }
        object._forwarding_list[source][target] = enabled;
    };
    me.broadcast = function (object, name, value) {
        if(!object) {
            return;
        }
        if (Array.isArray(object)) {
            var results = object.map(function (item) {
                return me.broadcast(item, name, value);
            });
            return results;
        }
        var source_method = me.core.property.fullname(object, name);
        me.broadcastTo(me._forwarding_list, object, source_method, value);
        me.broadcastTo(object._forwarding_list, object, source_method, value);
        me.set(object, name, value);
    };
    me.broadcastTo = function(list, object, name, value) {
        if(list) {
            var forwarding_list = list[name];
            if (forwarding_list) {
                for (var target in forwarding_list) {
                    var enabled = forwarding_list[target];
                    if(enabled) {
                        me.set(object, target, value);
                    }
                }
            }
        }
    };
};
