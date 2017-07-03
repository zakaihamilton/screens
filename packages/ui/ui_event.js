/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.click_delay = 200;
    me.click_repeat = 50;
    me.handle = {
        click: function (object, method, event) {
            if (object.event_types["dblclick"]) {
                object.event_dblclick = false;
                object.click_timeout = setTimeout(function () {
                    if(!object.event_dblclick) {
                        me.send_event(object, method, event);
                    }
                }, me.click_delay);
                return false;
            }
            return true;
        },
        dblclick: function (object, method, event) {
            if(object.click_timeout !== null) {
                clearTimeout(object.click_timeout);
                object.click_timeout = null;
            }
            object.event_dblclick = true;
            return true;
        },
        repeatdown: function(object, method, event) {
            object.repeat_interval = true;
            object.click_repeat_interval = setInterval(function() {
                if(object.repeat_interval) {
                    me.send_event(object, method, event);
                }
            }, me.click_repeat);
            event.preventDefault();
            return true;
        },
        repeatover: function(object, method, event) {
            object.repeat_interval = true;
            event.preventDefault();
            return false;
        },
        repeatleave: function(object, method, event) {
            object.repeat_interval = false;
            event.preventDefault();
            return false;
        },
        repeatup: function(object, method, event) {
            if(object.click_repeat_interval !== null) {
                clearInterval(object.click_repeat_interval);
                object.click_repeat_interval = null;
            }
            event.preventDefault();
            return false;
        }
    };
    me.send_event = function(object, method, event) {
        if(!object.getAttribute('disabled')) {
            me.set(object, method, event);
        }        
    };
    me.register = function (object, type, method, name=type, target=object) {
        if (!object.event_types) {
            object.event_types = {};
        }
        if(method) {
            method = me.ui.element.to_full_name(object, method);
        }
        var listener_callback = function (event) {
            var result = true;
            if (name in me.handle) {
                result = me.handle[name](object, method, event);
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
    me.down = {
        set: function (object, value) {
            me.register(object, "mousedown", value);
        }
    };
    me.up = {
        set: function (object, value) {
            me.register(object, "mouseup", value);
        }
    };
    me.repeat = {
        set: function (object, value) {
            me.register(object, "mousedown", value, "repeatdown");
            me.register(object, "mouseover", value, "repeatover");
            me.register(object, "mouseleave", value, "repeatleave");
            me.register(object, "mouseup", value, "repeatup", window);
        }
    };
};
