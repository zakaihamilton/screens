/*
 @author Zakai Hamilton
 @component UIMonitor
 */

package.ui.monitor = function UIMonitor(me) {
    me.init = function() {
        me.send_event = me.ui.event.send_event;
        me.register = me.ui.event.register;
    };
    me.keys = [];
    me.handle = {};
    me.change = {
        set: function (object, value) {
            me.register(me.handle, object, "change", value);
        }
    };
};
