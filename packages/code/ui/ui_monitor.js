/*
 @author Zakai Hamilton
 @component UIMonitor
 */

screens.ui.monitor = function UIMonitor(me) {
    me.change = {
        set: function (object, value) {
            me.core.event.register(null, object, "change", value);
        }
    };
    me.search = {
        set: function (object, value) {
            me.core.event.register(null, object, "search", value);
        }
    };
};
