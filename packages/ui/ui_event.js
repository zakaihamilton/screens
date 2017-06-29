/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.handle = function (object, type, method) {
        if (!object.event_types) {
            object.event_types = {};
        }
        var listener_callback = function (event) {
            /* Because of double click that can interfere with single click
             * if both double click and single click are on the same object
             * then delay the single click for the double click to occur before
             * the single click is sent
             */
            if (type === "click" && object.event_types["dblclick"]) {
                object.event_dblclick = false;
                setTimeout(function (object) {
                    if (object.event_dblclick) {
                        return;
                    }
                    if (!object.getAttribute('disabled')) {
                        me.set(object, method, event);
                    }
                }, 200, object);
            } else {
                if (type === "dblclick") {
                    object.event_dblclick = true;
                }
                if (!object.getAttribute('disabled')) {
                    me.set(object, method, event);
                }
            }
        };
        var listener = object.event_types[type];
        if(listener) {
            object.removeEventListener(type, listener);
        }
        if (method) {
            object.event_types[type] = listener_callback;
            object.addEventListener(type, listener_callback);
        }
    };
    me.move = {
        set: function (object, value) {
            me.handle(object, "mousemove", value);
        }
    };
    me.click = {
        set: function (object, value) {
            me.handle(object, "click", value);
        }
    };
    me.dblclick = {
        set: function (object, value) {
            me.handle(object, "dblclick", value);
        }
    };
    me.repeat = {
        set: function(object, value) {
            object.event_repeat = value;
        }
    };
};
