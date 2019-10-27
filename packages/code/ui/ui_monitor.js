/*
 @author Zakai Hamilton
 @component UIMonitor
 */

screens.ui.monitor = function UIMonitor(me, { core }) {
    me.change = {
        set: function (object, value) {
            core.event.register(null, object, "change", value);
        }
    };
    me.search = {
        set: function (object, value) {
            core.event.register(null, object, "search", value);
        }
    };
};
