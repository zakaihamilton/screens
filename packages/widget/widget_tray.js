/*
 @author Zakai Hamilton
 @component WidgetTray
 */

package.widget.tray = function WidgetTray(me) {
    me.default = {
        "ui.class.class":"container"
    };
    me.tray = {
        get: function(object) {
            var window = me.the.widget.window.window(object);
            var parent = me.the.widget.window.parent(window);
            var type = "icon";
            if(parent) {
                parent = me.the.core.property.get(parent, "content");
            }
            else {
                parent = me.the.ui.element.bar();
                type = "list";
            }
            if(!parent.var) {
                parent.var = {};
            }
            if(!parent.var.tray) {
                me.the.ui.element.create({
                    "ui.element.component":"widget.tray",
                    "ui.basic.var":"tray",
                    "type":type
                }, parent);
            }
            return parent.var.tray;
        }
    };
    me.init = function() {
        me.type = me.the.core.object.property("widget.tray.type", {
            set: function(object, value) {
                me.the.core.property.set(object, "ui.property.broadcast", {
                    "type":value
                });
            }
        });
    };
};
