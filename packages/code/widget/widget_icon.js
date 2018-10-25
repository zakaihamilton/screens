/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

screens.widget.icon = function WidgetIcon(me) {
    me.element = {
        dependencies : {
            properties: ["ui.basic.src", "text"]
        },
        redirect : {
            "ui.basic.text": "text",
            "ui.basic.src": "src"
        },
        extend :["ui.drag.icon"],
        properties : __json__
    };
    me.init = function () {
        me.core.property.set(me, "core.property.object.type", {
            set: function (object, value, name, oldValue) {
                if (value === "hidden") {
                    me.core.property.set(object, "ui.basic.show", false);
                }
                else if (value === "icon") {
                    me.core.property.set(object.var.icon, "ui.attribute.width", "64px");
                    me.core.property.set(object.var.icon, "ui.attribute.height", "64px");
                }
                else if (value === "list") {
                    me.core.property.set(object.var.icon, "ui.attribute.width", "16px");
                    me.core.property.set(object.var.icon, "ui.attribute.height", "16px");
                }
                me.core.property.set(object, "ui.class.remove", "widget.icon." + oldValue);
                me.core.property.set(object, "ui.class.add", "widget.icon." + value);
                me.core.property.set(object.var.icon, "ui.class.class", "widget.icon.image." + value);
                me.core.property.set(object.var.label, "ui.class.class", "widget.icon.label." + value);
            }
        });
    };
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function (object, value) {
            object.var.label.innerHTML = value;
        }
    };
    me.src = {
        get: function (object) {
            return object.var.icon.src;
        },
        set: function (object, value) {
            object.var.icon.src = value;
        }
    };
};
