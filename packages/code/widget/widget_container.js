/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

screens.widget.container = function WidgetContainer(me, { core, widget, ui }) {
    me.element = {
        properties: {
            "ui.class.class": "root",
            "core.event.scroll": "scroll"
        }
    };
    me.isChild = function (container) {
        var isChild = false;
        var window = widget.window.get(container);
        if (window && window.var.container === container) {
            var parent = widget.window.parent(window);
            if (!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.empty = {
        set: function (object) {
            ui.node.empty(object);
            core.property.notify(object, "update");
        }
    };
    me.scroll = function (object) {
        var container = ui.node.container(object, widget.container.id);
        if (container) {
            if (!widget.container.isChild(container)) {
                core.property.set(container, "ui.scroll.scrolled");
            }
        }
    };
};
