/*
 @author Zakai Hamilton
 @component UIMonitor
 */

package.ui.monitor = function UIMonitor(me) {
    me.change = {
        set: function (object, value) {
            me.ui.event.register(null, object, "change", value);
        }
    };
};
