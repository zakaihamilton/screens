/*
 @author Zakai Hamilton
 @component CoreEvent
 */

screens.core.event = function CoreEvent(me) {
    me.lookup = {
        set: function (object, value, property) {
            me.register(null, object, property, value);
        }
    };
    me.send_event = function (object, method, event) {
        if (!object || !object.getAttribute || !object.getAttribute('disabled')) {
            return me.core.property.set(object, method, event);
        }
    };
    me.register = function (handlers, object, type, method, name = type, target = object, options = null) {
        if (!object) {
            return;
        }
        if (!object.event_types) {
            object.event_types = {};
        }
        if (method) {
            method = me.core.property.to_full_name(object, method);
        }
        var listener_callback = function (event) {
            var enabled = true;
            if (handlers && name in handlers) {
                enabled = handlers[name](object, method, event);
            }
            if (enabled) {
                var result = me.send_event(object, method, event);
                if (result && result.then) {
                    if (options) {
                        if (options.respondWith) {
                            event.respondWith(result);
                        }
                        if (options.waitUntil) {
                            event.waitUntil(result);
                        }
                    }
                }
            }
        };
        var listener = object.event_types[name];
        if (listener) {
            target.removeEventListener(type, listener);
        }
        if (method) {
            object.event_types[name] = listener_callback;
            target.addEventListener(type, listener_callback, options);
        }
    };
};
