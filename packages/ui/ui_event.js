/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.send_event = function(object, method, event) {
        if(!object.getAttribute || !object.getAttribute('disabled')) {
            me.core.property.set(object, method, event);
        }
    };
    me.register = function (handlers, object, type, method, name=type, target=object) {
        if (!object.event_types) {
            object.event_types = {};
        }
        if(method) {
            method = me.ui.element.to_full_name(object, method);
        }
        var listener_callback = function (event) {
            var result = true;
            if (handlers && name in handlers) {
                result = handlers[name](object, method, event);
            }
            if (result === true) {
                me.send_event(object, method, event);
            }
        };
        var listener = object.event_types[name];
        if (listener) {
            target.removeEventListener(type, listener);
        }
        if (method) {
            object.event_types[name] = listener_callback;
            target.addEventListener(type, listener_callback);
        }
    };
};
