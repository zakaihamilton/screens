/*
 @author Zakai Hamilton
 @component UIMonitor
 */

package.ui.monitor = function UIMonitor(me) {
    me.change = {
        set: function (object, value) {
            me.core.event.register(null, object, "change", value);
        }
    };
};
