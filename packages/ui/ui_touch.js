/*
 @author Zakai Hamilton
 @component UITouch
 */

package.ui.touch = function UIEvent(me) {
    me.click_delay = 200;
    me.click_repeat_delay = 250;
    me.click_repeat_interval = 50;
    me.init = function () {
        me.send_event = me.ui.event.send_event;
        me.register = me.ui.event.register;
    };
    me.handle = {
        click: function (object, method, event) {
            if (object.event_types["dblclick"]) {
                object.event_dblclick = false;
                object.click_timeout = setTimeout(function () {
                    if (!object.event_dblclick) {
                        me.send_event(object, method, event);
                    }
                }, me.click_delay);
                return false;
            }
            return true;
        },
        dblclick: function (object, method, event) {
            if (object.click_timeout !== null) {
                clearTimeout(object.click_timeout);
                object.click_timeout = null;
            }
            object.event_dblclick = true;
            return true;
        },
        repeatdown: function (object, method, event) {
            object.repeat_interval = true;
            object.click_repeat_delay = setTimeout(function () {
                object.click_repeat_interval = setInterval(function () {
                    if (object.repeat_interval) {
                        me.send_event(object, method, event);
                    }
                }, me.click_repeat_interval);
            }, me.click_repeat_delay);
            event.preventDefault();
            return false;
        },
        repeatover: function (object, method, event) {
            object.repeat_interval = true;
            event.preventDefault();
            return false;
        },
        repeatleave: function (object, method, event) {
            object.repeat_interval = false;
            event.preventDefault();
            return false;
        },
        repeatup: function (object, method, event) {
            if (object.click_repeat_delay) {
                clearTimeout(object.click_repeat_delay);
                object.click_repeat_delay = null;
            }
            if (object.click_repeat_interval) {
                clearInterval(object.click_repeat_interval);
                object.click_repeat_interval = null;
            }
            event.preventDefault();
            return false;
        }
    };
    me.move = {
        set: function (object, value) {
            me.register(me.handle, object, "mousemove", value, "mousemove", window);
        }
    };
    me.over = {
        set: function (object, value) {
            me.register(me.handle, object, "mouseover", value);
        }
    };
    me.enter = {
        set: function (object, value) {
            me.register(me.handle, object, "mouseenter", value);
        }
    };
    me.click = {
        set: function (object, value) {
            me.register(me.handle, object, "click", value);
        }
    };
    me.dblclick = {
        set: function (object, value) {
            me.register(me.handle, object, "dblclick", value);
        }
    };
    me.down = {
        set: function (object, value) {
            me.register(me.handle, object, "mousedown", value);
        }
    };
    me.up = {
        set: function (object, value) {
            me.register(me.handle, object, "mouseup", value, "mouseup", window);
        }
    };
    me.repeat = {
        set: function (object, value) {
            me.register(me.handle, object, "mousedown", value, "repeatdown");
            me.register(me.handle, object, "mouseover", value, "repeatover");
            me.register(me.handle, object, "mouseleave", value, "repeatleave");
            me.register(me.handle, object, "mouseup", value, "repeatup", window);
        }
    };
    me.default = {
        set: function (object, value) {
            me.register(me.handle, object, "dblclick", value, "default");
        }
    };
    me.wheel = {
        set: function (object, value) {
            me.register(me.handle, object, "wheel", value);
        }
    };
};
