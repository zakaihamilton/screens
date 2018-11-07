/*
 @author Zakai Hamilton
 @component UIMove
 */

screens.ui.move = function UIMove(me) {
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
    me.extend = function (object) {
        me.core.property.set(object, "ui.touch.down", "ui.move.down");
    };
    me.down = function (object, event) {
        var target = object.move_target;
        if (!target) {
            target = me.widget.window.get(object);
        }
        if (!target.move_enabled) {
            me.core.property.set(target, "ui.focus.active", true);
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
        me.core.property.set(target, "ui.focus.active", true);
        me.core.property.set(target, "ui.property.broadcast", {
            "transition": true
        });
        event.preventDefault();
        me.core.property.set(object, {
            "ui.touch.move": "ui.move.move",
            "ui.touch.up": "ui.move.up"
        });
    };
    me.move = function (object, event) {
        var target_region = me.ui.rect.absoluteRegion(me.info.target);
        var shift_region = {};
        me.ui.rect.emptyRegion(shift_region);
        target_region.left = event.clientX - me.info.left;
        target_region.top = event.clientY - me.info.top;
        me.ui.rect.setAbsoluteRegion(me.info.target, target_region);
        me.clip(object, true);
    };
    me.up = function (object, event) {
        me.core.property.set(object, {
            "ui.touch.move": null,
            "ui.touch.up": null,
        });
        me.core.property.set(me.info.target, "ui.property.broadcast", {
            "transition": false
        });
        var window = me.widget.window.get(me.info.target);
        me.core.property.notify(window, "update");
        me.clip(object, false);
    };
    me.clip = function (object, signalOnly) {
        var window = me.widget.window.get(object);
        var target_region = me.ui.rect.absoluteRegion(window);
        var parent = me.widget.window.parent(window);
        if (!parent) {
            parent = me.ui.element.desktop();
        }
        var parent_region = me.ui.rect.absoluteRegion(parent);
        me.core.property.notify(parent, "update");
        var alignToLeft = false, alignToRight = false;
        var alignToTop = false, alignToBottom = false;
        if (target_region.left < parent_region.left) {
            if (signalOnly) {
                alignToLeft = true;
            }
            else {
                me.ui.arrange.alignToLeft(object);
            }
        }
        else if (target_region.right > parent_region.right) {
            if (signalOnly) {
                alignToRight = true;
            }
            else {
                me.ui.arrange.alignToRight(object);
            }
        }
        else if(target_region.top < parent_region.top) {
            if (signalOnly) {
                alignToTop = true;
            }
            else {
                me.ui.arrange.alignToTop(object);
            }
        }
        else if(target_region.bottom > parent_region.bottom) {
            if (signalOnly) {
                alignToBottom = true;
            }
            else {
                me.ui.arrange.alignToBottom(object);
            }
        }
        var align = alignToLeft || alignToRight || alignToTop || alignToBottom;
        me.core.property.set(parent.var.align, "ui.class.show", align);
        me.core.property.set(parent.var.align, "ui.class.left", alignToLeft);
        me.core.property.set(parent.var.align, "ui.class.right", alignToRight);
        me.core.property.set(parent.var.align, "ui.class.top", alignToTop);
        me.core.property.set(parent.var.align, "ui.class.bottom", alignToBottom);
    };
};