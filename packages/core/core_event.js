/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.event = function CoreEvent(me) {
    me._forwarding_list = {};
    me.link = function (source, target, enabled) {
        var source_list = me._forwarding_list[source];
        if (!source_list) {
            me._forwarding_list[source] = {};
        }
        me._forwarding_list[source][target] = enabled;
    };
    me.send = function (object, name, value) {
        if(!object) {
            return;
        }
        var source_method = me.core.property.fullname(object, name);
        var forwarding_list = me._forwarding_list[source_method];
        if (forwarding_list) {
            for (var target in forwarding_list) {
                var enabled = forwarding_list[target];
                if(enabled) {
                    me.set(object, target, value);
                }
            }
        }
    };
};
