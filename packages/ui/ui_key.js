/*
 @author Zakai Hamilton
 @component UITouch
 */

package.ui.key = function UIKey(me) {
    me.send_event = me.ui.event.send_event;
    me.register = me.ui.event.register;
    me.keys = [];
    me.handle = {
        keydown: function(object, method, event) {
            
        },
        keyup: function(object, method, event) {
            
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
