/*
 @author Zakai Hamilton
 @component UIResize
 */

package.ui.resize = function UIResize(me) {
    me.enabled = {
        get: function (object) {
            return object.resize_enabled;
        },
        set: function (object, value) {
            object.resize_enabled = value;
        }
    };
    me.target = {
        get: function (object) {
            return object.resize_target;
        },
        set: function (object, value) {
            object.resize_target = value;
        }
    };
    me.extend = {
        set: function (object) {
            me.the.core.property.set(object, "ui.touch.down", "ui.resize.down");
        }
    };
    me.down = {
        set: function (object, event) {
            var target = object.resize_target;
            if (!target) {
                target = me.the.widget.window.window(object);
            }
            if (!target.resize_enabled) {
                event.preventDefault();
                return;
            }
            var target_region = me.the.ui.rect.absolute_region(target);
            me.info = {
                target: target,
                left: event.clientX - target_region.left,
                top: event.clientY - target_region.top,
                width: target.offsetWidth,
                height: target.offsetHeight
            };
            me.the.core.property.set(target, "ui.property.broadcast", {
                "transition": true
            });
            event.preventDefault();
            me.the.core.property.set(object, "ui.property.group", {
                "ui.touch.move": "ui.resize.move",
                "ui.touch.up": "ui.resize.up"
            });
        }
    };
    me.move = {
        set: function (object, event) {
            var target_region = me.the.ui.rect.absolute_region(me.info.target);
            var object_region = me.the.ui.rect.absolute_region(object);
            var shift_region = {};
            me.the.ui.rect.empty_region(shift_region);
            var min_width = parseInt(me.the.core.property.get(me.info.target, "ui.style.minWidth"), 10);
            var min_height = parseInt(me.the.core.property.get(me.info.target, "ui.style.minHeight"), 10);
            if (object_region.left < target_region.left + (target_region.width / 2)) {
                if (object_region.right < target_region.left + (target_region.width / 2)) {
                    target_region.width = target_region.width + (target_region.left - event.clientX);
                    if (target_region.width >= min_width) {
                        target_region.left = event.clientX;
                    }
                }
            } else {
                target_region.width = event.clientX - target_region.left;
            }
            if (object_region.top < target_region.top + (target_region.height / 2)) {
                if (object_region.bottom < target_region.top + (target_region.height / 2)) {
                    target_region.height = target_region.height + (target_region.top - event.clientY);
                    if (target_region.height >= min_height) {
                        target_region.top = event.clientY;
                    }
                }
            } else {
                target_region.height = event.clientY - target_region.top;
            }
            me.the.ui.rect.set_absolute_region(me.info.target, target_region);
        }
    };
    me.up = {
        set: function (object, event) {
            me.the.core.property.set(object, "ui.property.group", {
                "ui.touch.move": null,
                "ui.touch.up": null
            });
            me.the.core.property.set(me.info.target, "ui.property.broadcast", {
                "transition": false
            });
            var window = me.the.widget.window.window(me.info.target);
            me.the.core.property.notify(window, "update");
            var parent = me.the.widget.window.parent(me.info.target);
            me.the.core.property.notify(parent, "update");
            if(window.child_window) {
                me.the.core.property.notify(window.child_window, "update");
            }
        }
    };
    me.event = {
        set: function (object, value) {
            me.the.ui.event.register(null, object, "resize", value, "resize", window);
        }
    };
};