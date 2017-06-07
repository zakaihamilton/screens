/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.event = new function CoreEvent() {
    var me = this;
    me._forwarding_list = {};
    me.forward = function (source, target, enabled) {
        source_list = me._forwarding_list[source];
        if (source_list == undefined) {
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
                    target = package[target];
                    if (typeof target[name] === "function") {
                        var args = Array.prototype.slice.call(arguments, 2);
                        target[name].apply(target, args);
                    }
                }
            }
        }
    };
};
