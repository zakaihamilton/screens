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
    me.send = function (component, name, params) {
        forwarding_list = me._forwarding_list[component];
        if (forwarding_list !== undefined) {
            for (var target in forwarding_list) {
                var enabled = forwarding_list[target];
                if(enabled) {
                    target = me[target];
                    if (typeof target[name] === "function") {
                        var args = Array.prototype.slice.call(arguments, 2);
                        target[name].apply(target, args);
                    }
                }
            }
        }
    };
};
