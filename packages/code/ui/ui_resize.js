/*
 @author Zakai Hamilton
 @component UIResize
 */

screens.ui.resize = function UIResize(me) {
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
            me.core.property.set(object, "ui.touch.down", "ui.resize.down");
        }
    };
    me.down = {
        set: function (object, event) {
            var target = object.resize_target;
            if (!target) {
                target = me.widget.window.get(object);
            }
            if (!target.resize_enabled) {
                return;
            }
            var target_region = me.ui.rect.absoluteRegion(target);
            me.info = {
                target: target,
                left: event.clientX - target_region.left,
                top: event.clientY - target_region.top,
                width: target.offsetWidth,
                height: target.offsetHeight
            };
            me.core.property.set(target, "ui.property.broadcast", {
                "transition": true
            });
            event.preventDefault();
            me.core.property.set(object, {
                "ui.touch.move": "ui.resize.move",
                "ui.touch.up": "ui.resize.up"
            });
        }
    };
    me.move = {
        set: function (object, event) {
            var target_region = me.ui.rect.absoluteRegion(me.info.target);
            var object_region = me.ui.rect.absoluteRegion(object);
            var shift_region = {};
            me.ui.rect.emptyRegion(shift_region);
            var min_width = parseInt(me.core.property.get(me.info.target, "ui.style.minWidth"), 10);
            var min_height = parseInt(me.core.property.get(me.info.target, "ui.style.minHeight"), 10);
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
            me.ui.rect.setAbsoluteRegion(me.info.target, target_region);
            var window = me.widget.window.get(me.info.target);
            me.core.property.set(window, "resize");
        }
    };
    me.up = {
        set: function (object, event) {
            me.core.property.set(object, {
                "ui.touch.move": null,
                "ui.touch.up": null
            });
            me.core.property.set(me.info.target, "ui.property.broadcast", {
                "resize": null,
                "transition": false
            });
            var window = me.widget.window.get(me.info.target);
            me.core.property.set(window, "ui.property.broadcast", {
                "update": null
            });
            var parent = me.widget.window.parent(me.info.target);
            me.core.property.set(parent, "ui.property.broadcast", {
                "update": null
            });
            if (window.child_window) {
                me.core.property.set(window.child_window, "ui.property.broadcast", {
                    "update": null
                });
            }
        }
    };
    me.event = {
        set: function (object, value) {
            me.core.event.register(null, object, "resize", value, "resize", window);
            me.core.event.register(null, object, "orientationchange", value, "orientationchange", window);
        }
    };
    me.centerWidget = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.container, "ui.style.overflow", "hidden");
        var region = me.ui.rect.absoluteRegion(object);
        var target_region = me.ui.rect.absoluteRegion(window.var.container);
        var size = target_region.width > target_region.height ? target_region.height : target_region.width;
        me.core.property.set(object, {
            "ui.style.top": ((target_region.height - size) / 2) + "px",
            "ui.style.left": ((target_region.width - size) / 2) + "px"
        });
        if (region.width !== size && region.height !== size) {
            me.core.property.set(object, {
                "ui.style.width": size + "px",
                "ui.style.height": size + "px",
                "redraw": null
            });
        }
    };
};
