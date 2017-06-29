/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.handle = {
        click : function (object, method, event) {
            if (object.event_types["dblclick"]) {
                object.event_dblclick = false;
                setTimeout(function (object) {
                    if (object.event_dblclick) {
                        return;
                    }
                    if (!object.getAttribute('disabled')) {
                        me.set(object, method, event);
                    }
                }, 200, object);
            }
            else if (!object.getAttribute('disabled')) {
                me.set(object, method, event);
            }
        },
        dblclick : function(object, method, event) {
            object.event_dblclick = true;
            if (!object.getAttribute('disabled')) {
                me.set(object, method, event);
            }            
        },
        mousemove : function(object, method, event) {
            if (!object.getAttribute('disabled')) {
                me.set(object, method, event);
            }            
        }
    };
    me.register = function (object, type, method) {
        if (!object.event_types) {
            object.event_types = {};
        }
        var listener_callback = function (event) {
            me.handle[type](object, method, event);
        };
        var listener = object.event_types[type];
        if (listener) {
            object.removeEventListener(type, listener);
        }
        if (method) {
            object.event_types[type] = listener_callback;
            object.addEventListener(type, listener_callback);
        }
    };
    me.move = {
        set: function (object, value) {
            me.register(object, "mousemove", value);
        }
    };
    me.click = {
        set: function (object, value) {
            me.register(object, "click", value);
        }
    };
    me.dblclick = {
        set: function (object, value) {
            me.register(object, "dblclick", value);
        }
    };
    me.repeat = {
        set: function (object, value) {
            object.event_repeat = value;
        }
    };
};
