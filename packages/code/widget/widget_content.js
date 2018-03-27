/*
 @author Zakai Hamilton
 @component WidgetContent
 */

screens.widget.content = function WidgetContent(me) {
    me.properties = {
        "ui.class.class": "base",
        "ui.touch.wheel":"wheel"
    };
    me.wheel = {
        set: function(object, event) {
            var container = me.ui.node.container(object, me.widget.container.id);
            if(container) {
                if(!me.widget.container.isChild(container)) {
                    var scrollbar = container.var.vertical;
                    var delta = event.deltaY;
                    me.core.property.set(scrollbar, "delta", delta);
                }
            }
        }
    };
};
