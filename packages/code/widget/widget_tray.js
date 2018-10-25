/*
 @author Zakai Hamilton
 @component WidgetTray
 */

screens.widget.tray = function WidgetTray(me) {
    me.element = {
        properties : {
            "ui.class.class": "container"
        }
    };
    me.tray = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var parent = me.widget.window.parent(window);
            var isPopup = me.core.property.get(window, "popup");
            var type = "icon";
            if (parent) {
                type = "hidden";
                parent = me.core.property.get(parent, "content");
            }
            else {
                parent = me.ui.element.bar();
                type = "list";
            }
            if (isPopup) {
                type = "hidden";
            }
            if (!parent.var) {
                parent.var = {};
            }
            if (!parent.var.tray) {
                me.ui.element.create({
                    "ui.element.component": "widget.tray",
                    "ui.basic.var": "tray",
                    "type": type
                }, parent);
            }
            return parent.var.tray;
        }
    };
    me.init = function () {
        me.core.property.set(me, "core.property.object.type", {
            set: function (object, value) {
                me.core.property.set(object, "ui.property.broadcast", {
                    "type": value
                });
            }
        });
    };
};
