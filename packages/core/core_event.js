/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.event = new function CoreEvent() {
    /* example: package.core.event.forward(package.core.http, package.ui.window, true) */
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
            forwarding_list.forEach(function (enabled, target_id) {
                if(enabled) {
                    target = package[target_id];
                    if (typeof target.name === "function") {
                        target.name.apply(target, Array.prototype.slice.call(arguments, 3));
                    }
                }
            });
        }
    };
};
