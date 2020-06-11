/*
 @author Zakai Hamilton
 @component UIKey
 */

screens.ui.key = function UIKey(me, { core }) {
    me.handle = {
        keydown: function () {
            return true;
        },
        keyup: function () {
            return true;
        },
        enter: function (_object, _method, event) {
            return event.keyCode === 13;
        }
    };
    me.down = {
        set: function (object, value) {
            core.event.register(me.handle, object, "keydown", value);
        }
    };
    me.up = {
        set: function (object, value) {
            core.event.register(me.handle, object, "keyup", value);
        }
    };
    me.enter = {
        set: function (object, value) {
            core.event.register(me.handle, object, "keyup", value, "enter");
        }
    };
    me.press = {
        set: function (object, value) {
            core.event.register(me.handle, object, "keypress", value);
        }
    };
};
