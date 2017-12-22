/*
 @author Zakai Hamilton
 @component UIMove
 */

package.ui.move = function UIMove(me) {
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
    me.extend = {
        set: function (object) {
            me.core.property.set(object, "ui.touch.down", "ui.move.down");
        }
    };
    me.down = {
        set: function(object, event) {
            var target = object.move_target;
            if(!target) {
                target = me.widget.window.window(object);
            }
            if (!target.move_enabled) {
                event.preventDefault();
                return;
            }
            var target_region = me.ui.rect.absolute_region(target);
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
            me.core.property.set(object, "ui.property.group", {
                "ui.touch.move":"ui.move.move",
                "ui.touch.up":"ui.move.up"
            });
        }
    };
    me.move = {
        set: function(object, event) {
            var target_region = me.ui.rect.absolute_region(me.info.target);
            var shift_region = {};
            me.ui.rect.empty_region(shift_region);
            target_region.left = event.clientX - me.info.left;
            target_region.top = event.clientY - me.info.top;
            me.ui.rect.set_absolute_region(me.info.target, target_region);
            var parent = me.widget.window.parent(me.info.target);
            me.core.property.notify(parent, "update");
        }
    };
    me.up = {
        set: function(object, event) {
            me.core.property.set(object, "ui.property.group", {
                "ui.touch.move":null,
                "ui.touch.up":null,
            });
            me.core.property.set(me.info.target, "ui.property.broadcast", {
                "transition": false
            });
            var window = me.widget.window.window(me.info.target);
            me.core.property.notify(window, "update");
        }
    };
};