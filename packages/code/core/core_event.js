/*
 @author Zakai Hamilton
 @component CoreEvent
 */

screens.core.event = function CoreEvent(me, { core }) {
    me.events = {};
    me.lookup = {
        set: function (object, value, property) {
            me.register(null, object, property, value);
        }
    };
    me.send_event = function (object, method, event) {
        if (!object || !object.getAttribute || !object.getAttribute("disabled")) {
            return core.property.set(object, method, event);
        }
    };
    me.enabled = {
        get: function (name) {
            var isEnabled = true;
            var item = me.events[name];
            if (item && item.disabled) {
                isEnabled = false;
            }
            return isEnabled;
        },
        set: function (name, flag) {
            var item = me.events[name];
            if (!item) {
                item = me.events[name] = {};
            }
            item.disabled = !flag;
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
            method = core.property.to_full_name(object, method);
        }
        var listener_callback = function (event) {
            var enabled = true;
            if (handlers && name in handlers) {
                enabled = handlers[name](object, method, event);
            }
            var item = me.events[name];
            if (item && item.disabled) {
                enabled = false;
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
