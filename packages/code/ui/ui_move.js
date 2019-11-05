/*
 @author Zakai Hamilton
 @component UIMove
 */

screens.ui.move = function UIMove(me, { core, ui, widget }) {
    me.snapSensitivity = 5;
    me.enabled = {
        get: function (object) {
            return object.move_enabled;
        },
        set: function (object, value) {
            object.move_enabled = value;
        }
    };
    me.target = {
        get: function (object) {
            return object.move_target;
        },
        set: function (object, value) {
            object.move_target = value;
        }
    };
    me.relative = {
        get: function (object) {
            return object.move_relative;
        },
        set: function (object, value) {
            object.move_relative = value;
        }
    };
    me.method = {
        get: function (object) {
            return object.move_method;
        },
        set: function (object, value) {
            object.move_method = value;
        }
    };
    me.extend = function (object, type) {
        object.move_type = type;
        core.property.set(object, "ui.touch.down", "ui.move.down");
    };
    me.down = function (object, event) {
        var target = object.move_target;
        var type = object.move_type;
        if (type === "this") {
            target = object;
        }
        else if (type === "window") {
            target = widget.window.get(object);
        }
        if (!target) {
            return;
        }
        if (!target.move_enabled) {
            core.property.set(target, "ui.focus.active", true);
            return;
        }
        var regionMethod = target.move_relative ? ui.rect.relativeRegion : ui.rect.absoluteRegion;
        var target_region = regionMethod(target);
        me.info = {
            target: target,
            left: event.clientX - target_region.left,
            top: event.clientY - target_region.top,
            width: target.offsetWidth,
            height: target.offsetHeight
        };
        core.property.set(target, "ui.focus.active", true);
        core.property.set(target, "ui.property.broadcast", {
            "transition": true
        });
        event.preventDefault();
        var move_method = "ui.move.move";
        if (object.move_method) {
            move_method = object.move_method;
        }
        core.property.set(object, {
            "ui.touch.move": move_method,
            "ui.touch.up": "ui.move.up",
            "ui.style.transition": "none",
            "ui.class.transition": true
        });
    };
    me.move = function (object, event) {
        var type = object.move_type;
        var regionMethod = me.info.target.move_relative ? ui.rect.relativeRegion : ui.rect.absoluteRegion;
        var target_region = regionMethod(me.info.target);
        target_region.left = event.clientX - me.info.left;
        target_region.top = event.clientY - me.info.top;
        ui.rect.setAbsoluteRegion(me.info.target, target_region);
        if (type === "window") {
            me.snap(object, true);
        }
    };
    me.up = function (object, event) {
        var type = object.move_type;
        core.property.set(object, {
            "ui.touch.move": null,
            "ui.touch.up": null,
            "ui.class.transition": false,
            "ui.style.transition": ""
        });
        core.property.set(me.info.target, "ui.property.broadcast", {
            "transition": false
        });
        var window = widget.window.get(me.info.target);
        core.property.notify(window, "update");

        if (type === "window") {
            me.snap(object, false);
        }
    };
    me.snap = function (object, signalOnly) {
        var window = widget.window.get(object);
        var target_region = ui.rect.absoluteRegion(window);
        var parent = widget.window.parent(window);
        var parent_region = ui.rect.absoluteRegion(parent);
        if (!parent) {
            parent = ui.element.desktop();
            var workspace = ui.element.workspace();
            parent_region = ui.rect.absoluteRegion(workspace);
        }
        core.property.notify(parent, "update");
        var alignToLeft = target_region.left + me.snapSensitivity < parent_region.left;
        var alignToRight = target_region.right - me.snapSensitivity > parent_region.right;
        var alignToTop = target_region.top + me.snapSensitivity < parent_region.top;
        var alignToBottom = target_region.bottom - me.snapSensitivity > parent_region.bottom;
        if (alignToLeft) {
            if (!signalOnly) {
                if (alignToTop) {
                    ui.arrange.alignToLeftTop(object);
                }
                else if (alignToBottom) {
                    ui.arrange.alignToLeftBottom(object);
                }
                else {
                    ui.arrange.alignToLeft(object);
                }
            }
        }
        else if (alignToRight) {
            if (!signalOnly) {
                if (alignToTop) {
                    ui.arrange.alignToRightTop(object);
                }
                else if (alignToBottom) {
                    ui.arrange.alignToRightBottom(object);
                }
                else {
                    ui.arrange.alignToRight(object);
                }
            }
        }
        else if (alignToTop) {
            if (!signalOnly) {
                ui.arrange.alignToTop(object);
            }
        }
        else if (alignToBottom) {
            if (!signalOnly) {
                ui.arrange.alignToBottom(object);
            }
        }
        core.property.set(parent.var.align, "ui.class.show", signalOnly);
        core.property.set(parent.var.align, "ui.class.left", alignToLeft);
        core.property.set(parent.var.align, "ui.class.right", alignToRight);
        core.property.set(parent.var.align, "ui.class.top", alignToTop);
        core.property.set(parent.var.align, "ui.class.bottom", alignToBottom);
    };
};