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
                    if (!object.getAttribute('disabled')) {
                        me.set(object, method, event);
                    }
                }, me.click_delay);
                return false;
            }
            return true;
        },
        dblclick: function (object, method, event) {
            if(object.click_timeout) {
                clearTimeout(object.click_timeout);
                object.click_timeout = null;
            }
            return true;
        },
        repeatdown: function(object, method, event) {
            object.repeat_interval = true;
            object.click_repeat_interval = setInterval(function() {
                if(object.repeat_interval) {
                    me.send_event(object, method, event);
                }
            }, me.click_repeat);
            return true;
        },
        repeatover: function(object, method, event) {
            object.repeat_interval = true;
            return false;
        },
        repeatleave: function(object, method, event) {
            object.repeat_interval = false;
            return false;
        },
        repeatup: function(object, method, event) {
            if(object.click_repeat_interval) {
                clearInterval(object.click_repeat_interval);
                object.click_repeat_interval = null;
            }
            return false;
        }
    };
    me.send_event = function(object, method, event) {
        if(!object.getAttribute('disabled')) {
            me.set(object, method, event);
        }        
    };
    me.register = function (object, type, method, name=type) {
        if (!object.event_types) {
            object.event_types = {};
        }
        var listener_callback = function (event) {
            var result = true;
            if (name in me.handle) {
                result = me.handle[name](object, method, event);
            }
            if (result) {
                me.send_event(object, method, event);
            }
        };
        var listener = object.event_types[name];
        if (listener) {
            object.removeEventListener(type, listener);
        }
        if (method) {
            object.event_types[name] = listener_callback;
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
            me.register(object, "mouseup", value, "repeatup");
        }
    };
};
