/*
 @author Zakai Hamilton
 @component UIKey
 */

screens.ui.key = function UIKey(me) {
    me.handle = {
        keydown: function(object, method, event) {
            return true;
        },
        keyup: function(object, method, event) {
            return true;
        }
    };
    me.down = {
        set: function (object, value) {
            me.core.event.register(me.handle, object, "keydown", value);
        }
    };
    me.up = {
        set: function (object, value) {
            me.core.event.register(me.handle, object, "keyup", value);
        }
    };
};
