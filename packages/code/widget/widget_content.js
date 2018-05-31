/*
 @author Zakai Hamilton
 @component WidgetContent
 */

screens.widget.content = function WidgetContent(me) {
    me.element = {
        properties: {
            "ui.class.class": "base",
            "core.event.scroll": "scroll"
        }
    };
    me.scroll = function (object) {
        var container = me.ui.node.container(object, me.widget.container.id);
        if (container) {
            if (!me.widget.container.isChild(container)) {
                var scrollbar = container.var.vertical;
                me.core.property.set(scrollbar, "scroll");
            }
        }
    };
};
