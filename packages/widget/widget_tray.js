/*
 @author Zakai Hamilton
 @component WidgetTray
 */

package.widget.tray = function WidgetTray(me) {
    me.default = {
        "ui.theme.class":"container"
    };
    me.tray = {
        get: function(object) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            if(!parent) {
                parent = document.body;
            }
            if(!parent.var) {
                parent.var = {};
            }
            if(!parent.var.tray) {
                me.ui.element.create({
                    "ui.element.component":"widget.tray",
                    "ui.basic.var":"tray"
                }, parent);
            }
            return parent.var.tray;
        }
    };
};
