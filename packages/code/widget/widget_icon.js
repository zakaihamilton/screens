/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

package.widget.icon = function WidgetIcon(me) {
    me["ui.element.depends"] = {
        properties: ["ui.basic.src", "text"]
    };
    me["core.property.redirect"] = {
        "ui.basic.text" : "text",
        "ui.basic.src" : "src"
    };
    me.extend = ["ui.drag.icon"];
    me["ui.element.default"] = __json__;
    me.init = function() {
        me.core.property.set(me, "core.object.type", {
            set: function(object, value, name, oldValue) {
                if(value === "icon") {
                    me.core.property.set(object.var.icon, "ui.attribute.width", "32px");
                    me.core.property.set(object.var.icon, "ui.attribute.height", "32px");
                }
                else if(value === "list") {
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
        set: function(object, value) {
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
