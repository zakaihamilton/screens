/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.content = function WidgetContent(me) {
    me.default = {
        "ui.class.class": "base",
        "ui.touch.wheel":"wheel"
    };
    me.wheel = {
        set: function(object, event) {
            var container = me.the.ui.node.container(object, me.the.widget.container.id);
            if(container) {
                if(!me.the.widget.container.isChild(container)) {
                    var scrollbar = container.var.vertical;
                    var delta = event.deltaY;
                    me.the.core.property.set(scrollbar, "delta", delta);
                }
            }
        }
    };
};
