/*
 @author Zakai Hamilton
 @component UIMonitor
 */

package.ui.monitor = function UIMonitor(me) {
    me.init = function() {
        me.send_event = me.the.ui.event.send_event;
        me.register = me.the.ui.event.register;
    }
    me.keys = [];
    me.handle = {};
    me.change = {
        set: function (object, value) {
            me.register(me.handle, object, "change", value);
        }
    };
};
