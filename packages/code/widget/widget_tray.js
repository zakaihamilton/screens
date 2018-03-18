/*
 @author Zakai Hamilton
 @component WidgetTray
 */

package.widget.tray = function WidgetTray(me) {
    me.properties = {
        "ui.class.class":"container"
    };
    me.tray = {
        get: function(object) {
            var window = me.widget.window(object);
            var parent = me.widget.window.parent(window);
            var type = "icon";
            if(parent) {
                parent = me.core.property.get(parent, "content");
            }
            else {
                parent = me.ui.element.bar();
                type = "list";
            }
            if(!parent.var) {
                parent.var = {};
            }
            if(!parent.var.tray) {
                me.ui.element({
                    "ui.element.component":"widget.tray",
                    "ui.basic.var":"tray",
                    "type":type
                }, parent);
            }
            return parent.var.tray;
        }
    };
    me.init = function() {
        me.core.property.set(me, "core.object.type", {
            set: function(object, value) {
                me.core.property.set(object, "ui.property.broadcast", {
                    "type":value
                });
            }
        });
    };
};
