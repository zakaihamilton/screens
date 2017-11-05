/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.content = function WidgetContent(me) {
    me["ui.element.default"] = {
        "ui.class.class": "base",
        "ui.touch.wheel":"wheel"
    };
    me.wheel = {
        set: function(object, event) {
            var container = me.package.ui.node.container(object, me.package.widget.container.id);
            if(container) {
                if(!me.package.widget.container.isChild(container)) {
                    var scrollbar = container.var.vertical;
                    var delta = event.deltaY;
                    me.package.core.property.set(scrollbar, "delta", delta);
                }
            }
        }
    };
};
