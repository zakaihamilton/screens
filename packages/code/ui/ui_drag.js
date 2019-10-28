/*
 @author Zakai Hamilton
 @component UIDrag
 */

screens.ui.drag = function UIDrag(me, { core }) {
    me.start = {
        set: function (object, value) {
            core.event.register(null, object, "dragstart", value);
        }
    };
    me.enter = {
        set: function (object, value) {
            core.event.register(null, object, "dragenter", value);
        }
    };
    me.over = {
        set: function (object, value) {
            core.event.register(null, object, "dragover", value);
        }
    };
    me.leave = {
        set: function (object, value) {
            core.event.register(null, object, "dragleave", value);
        }
    };
    me.drop = {
        set: function (object, value) {
            core.event.register(null, object, "drop", value);
        }
    };
    me.end = {
        set: function (object, value) {
            core.event.register(null, object, "dragend", value);
        }
    };
    me.drag = {
        set: function (object, value) {
            core.event.register(null, object, "drag", value);
        }
    };
}

screens.ui.drag.icon = function UIDragIcon(me, { core }) {
    me.source = null;
    me.target = null;
    me.element = {
        set: function (object, value) {
            if (value) {
                value.drag_element = object;
            }
        }
    };
    me.extend = {
        set: function (object) {
            object.setAttribute("draggable", true);
            core.property.set(object, {
                "ui.drag.start": "ui.drag.icon.start",
                "ui.drag.enter": "ui.drag.icon.enter",
                "ui.drag.over": "ui.drag.icon.over",
                "ui.drag.leave": "ui.drag.icon.leave",
                "ui.drag.drop": "ui.drag.icon.drop",
                "ui.drag.end": "ui.drag.icon.end",
                "ui.drag.drag": "ui.drag.icon.drag"
            });
        }
    };
    me.start = {
        set: function (object, event) {
            var target = me.parent_draggable(event.target);
            if (!target) {
                if (event.preventDefault) {
                    event.preventDefault();
                }
                return;
            }
            if (target.drag_element) {
                var rect = ui.rect.absoluteRegion(target.drag_element);
                var in_rect = ui.rect.inRegion(rect, event.clientX, event.clientY);
                if (!in_rect) {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    return false;
                }
            }
            me.source = target;
            var source_rect = ui.rect.absoluteRegion(target);
            me.drag_offset = { x: event.clientX - source_rect.left, y: event.clientY - source_rect.top };
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.dropEffect = "move";
            core.property.set(target, "ui.class.add", "drag");
        }
    };
    me.enter = {
        set: function (object, event) {
            if (me.source && me.source.style.position !== "absolute") {
                var target = me.parent_draggable(event.target);
                me.target = target;
                core.property.set(target, "ui.class.add", "over");
            }
        }
    };
    me.over = {
        set: function (object, event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            if (me.source && me.source.style.position !== "absolute") {
                var target = me.parent_draggable(event.target);
                me.target = target;
                core.property.set(target, "ui.class.add", "over");
            }
            return false;
        }
    };
    me.leave = {
        set: function (object, event) {
            if (me.source && me.source.style.position !== "absolute") {
                var target = me.parent_draggable(event.target);
                core.property.set(target, "ui.class.remove", "over");
                me.target = null;
            }
        }
    };
    me.drop = {
        set: function (object, event) {
            if (me.source && me.source.style.position !== "absolute") {
                var target = me.parent_draggable(event.target);
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                if (me.source.style.position !== "absolute") {
                    ui.node.shift(me.source, target);
                }
            }
            return false;
        }
    };
    me.end = {
        set: function (object, event) {
            if (me.source) {
                if (me.source.style.position !== "absolute") {
                    var target = me.parent_draggable(event.target);
                    core.property.set(me.target, "ui.class.remove", "over");
                    core.property.set(target, "ui.class.remove", "over");
                }
                me.source = me.target = null;
                core.property.set(target, "ui.class.remove", "drag");
            }
        }
    };
    me.drag = {
        set: function (object, event) {
            if (me.source && me.source.style.position === "absolute") {
                if (event.clientX && event.clientY) {
                    me.drag_pos = { x: event.clientX, y: event.clientY };
                }
                var region = ui.rect.relativeRegion(me.source);
                region.left = me.drag_pos.x - me.drag_offset.x;
                region.top = me.drag_pos.y - me.drag_offset.y;
                ui.rect.setRelativeRegion(me.source, region);
            }
        }
    };
    me.parent_draggable = function (object) {
        while (object) {
            if (object.draggable === true) {
                break;
            }
            object = object.parentNode;
        }
        return object;
    };
};
