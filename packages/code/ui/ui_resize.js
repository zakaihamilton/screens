/*
 @author Zakai Hamilton
 @component UIResize
 */

screens.ui.resize = function UIResize(me, { core, widget, ui }) {
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
            core.property.set(object, "ui.touch.down", "ui.resize.down");
        }
    };
    me.down = {
        set: function (object, event) {
            var target = object.resize_target;
            if (!target) {
                target = widget.window.get(object);
            }
            if (!target.resize_enabled) {
                return;
            }
            var target_region = ui.rect.absoluteRegion(target);
            me.info = {
                target: target,
                left: event.clientX - target_region.left,
                top: event.clientY - target_region.top,
                width: target.offsetWidth,
                height: target.offsetHeight
            };
            core.property.set(target, "ui.property.broadcast", {
                "transition": true
            });
            event.preventDefault();
            core.property.set(object, {
                "ui.touch.move": "ui.resize.move",
                "ui.touch.up": "ui.resize.up"
            });
        }
    };
    me.move = {
        set: function (object, event) {
            var target_region = ui.rect.absoluteRegion(me.info.target);
            var object_region = ui.rect.absoluteRegion(object);
            var shift_region = {};
            ui.rect.emptyRegion(shift_region);
            var min_width = parseInt(core.property.get(me.info.target, "ui.style.minWidth"), 10);
            var min_height = parseInt(core.property.get(me.info.target, "ui.style.minHeight"), 10);
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
            ui.rect.setAbsoluteRegion(me.info.target, target_region);
            var window = widget.window.get(me.info.target);
            core.property.set(window, "resize");
        }
    };
    me.up = {
        set: function (object) {
            core.property.set(object, {
                "ui.touch.move": null,
                "ui.touch.up": null
            });
            core.property.set(me.info.target, "ui.property.broadcast", {
                "resize": null,
                "transition": false
            });
            var window = widget.window.get(me.info.target);
            core.property.set(window, "ui.property.broadcast", {
                "update": null
            });
            var parent = widget.window.parent(me.info.target);
            core.property.set(parent, "ui.property.broadcast", {
                "update": null
            });
            if (window.child_window) {
                core.property.set(window.child_window, "ui.property.broadcast", {
                    "update": null
                });
            }
        }
    };
    me.toggleLockRotation = function (object) {
        var enable = false;
        ["resize", "orientationchange"].map(name => {
            enable = !core.event.enabled.get(name);
            core.event.enabled.set(name, enable);
        });
        core.property.set(object, "ui.class.on", !enable);
    };
    me.toggleFullscreen = function (object) {
        var enable = !document.fullscreen;
        if (enable) {
            document.body.requestFullscreen();
        }
        else {
            document.exitFullscreen();
        }
        core.property.set(object, "ui.class.on", enable);
    };
    me.event = {
        set: function (object, value) {
            core.event.register(null, object, "resize", value, "resize", window);
            core.event.register(null, object, "orientationchange", value, "orientationchange", window);
        }
    };
    me.centerWidget = function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.container, "ui.style.overflow", "hidden");
        var region = ui.rect.absoluteRegion(object);
        var target_region = ui.rect.absoluteRegion(window.var.container);
        var size = target_region.width > target_region.height ? target_region.height : target_region.width;
        core.property.set(object, {
            "ui.style.top": ((target_region.height - size) / 2) + "px",
            "ui.style.left": ((target_region.width - size) / 2) + "px"
        });
        if (region.width !== size && region.height !== size) {
            core.property.set(object, {
                "ui.style.width": size + "px",
                "ui.style.height": size + "px",
                "redraw": null
            });
        }
    };
};
