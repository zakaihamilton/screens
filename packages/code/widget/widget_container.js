/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

screens.widget.container = function WidgetContainer(me) {
    me.element = {
        properties : {
            "ui.class.class": "root",
            "core.event.scroll": "scroll"
        }
    };
    me.isChild = function (container) {
        var isChild = false;
        var window = me.widget.window(container);
        if (window && window.var.container === container) {
            var parent = me.widget.window.parent(window);
            if (!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.empty = {
        set: function (object) {
            me.ui.node.empty(object);
            me.core.property.notify(object, "update");
        }
    };
    me.scroll = function (object) {
        var container = me.ui.node.container(object, me.widget.container.id);
        if (container) {
            if (!me.widget.container.isChild(container)) {
                me.core.property.set(container, "ui.scroll.snap");
            }
        }
    };
};
