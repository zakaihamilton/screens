/*
 @author Zakai Hamilton
 @component UIKey
 */

package.ui.key = function UIKey(me) {
    me.init = function() {
        me.send_event = me.the.ui.event.send_event;
        me.register = me.the.ui.event.register;
    }
    me.keys = [];
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
            me.register(me.handle, object, "keydown", value);
        }
    };
    me.up = {
        set: function (object, value) {
            me.register(me.handle, object, "keyup", value);
        }
    };
};
