/*
 @author Zakai Hamilton
 @component WidgetTray
 */

package.widget.tray = function WidgetTray(me) {
    me["ui.element.default"] = {
        "ui.class.class":"container"
    };
    me.tray = {
        get: function(object) {
            var window = me.package.widget.window.window(object);
            var parent = me.package.widget.window.parent(window);
            var type = "icon";
            if(parent) {
                parent = me.package.core.property.get(parent, "content");
            }
            else {
                parent = me.package.ui.element.bar();
                type = "list";
            }
            if(!parent.var) {
                parent.var = {};
            }
            if(!parent.var.tray) {
                me.package.ui.element.create({
                    "ui.element.component":"widget.tray",
                    "ui.basic.var":"tray",
                    "type":type
                }, parent);
            }
            return parent.var.tray;
        }
    };
    me.init = function() {
        me.type = me.package.core.object.property("widget.tray.type", {
            set: function(object, value) {
                me.package.core.property.set(object, "ui.property.broadcast", {
                    "type":value
                });
            }
        });
    };
};
