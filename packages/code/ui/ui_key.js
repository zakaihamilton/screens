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
        },
        enter: function(object, method, event) {
            return event.keyCode === 13;
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
    me.enter = {
        set: function(object, value) {
            me.core.event.register(me.handle, object, "keyup", value, "enter");
        }
    };
};
