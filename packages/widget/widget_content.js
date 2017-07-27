/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.content = function WidgetContent(me) {
    me.default = {
        "ui.theme.class": "base",
        "ui.touch.wheel":"wheel"
    };
    me.wheel = {
        set: function(object, event) {
            var container = me.ui.node.container(object, me.widget.container.id);
            if(container) {
                var scrollbar = container.var.vertical;
                var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
                if(delta > 0) {
                    me.set(scrollbar, "before");
                }
                else if(delta < 0) {
                    me.set(scrollbar, "after");
                }
            }
        }
    };
};
