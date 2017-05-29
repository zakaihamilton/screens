/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.event = new function CoreEvent() {
    this._forwarding_list = {};
    this.forward = function (source, target, enabled) {
        source_list = this._forwarding_list[source];
        if (source_list == undefined) {
            this._forwarding_list[source] = {};
        }
        this._forwarding_list[source][target] = enabled;
    };
    this.send = function (component, name, params) {
        forwarding_list = this._forwarding_list[component];
        if (forwarding_list !== undefined) {
            for (var target in forwarding_list) {
                var enabled = forwarding_list[target];
                if(enabled) {
                    target = package[target];
                    if (typeof target[name] === "function") {
                        args = Array.prototype.slice.call(arguments, 2);
                        target[name].apply(target, args);
                    }
                }
            }
        }
    };
};
