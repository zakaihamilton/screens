/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

screens.widget.icon = function WidgetIcon(me, { core, ui }) {
    me.init = function () {
        me.element = {
            dependencies: {
                properties: ["ui.basic.src", "text"]
            },
            redirect: {
                "ui.basic.text": "text",
                "ui.basic.src": "src"
            },
            extend: ["ui.drag.icon"],
            properties: me.json
        };
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
            object.var.icon.src = ui.image.get(value);
        }
    };
    me.type = {
        get: function (object) {
            var isHidden = core.property.get(object, "ui.basic.show");
            if (isHidden) {
                return "hidden";
            }
            var isIcon = core.property.get(object, "ui.class.contains", "widget.icon.icon");
            if (isIcon) {
                return "icon";
            }
            else {
                return "list";
            }
        },
        set: function (object, value) {
            if (value === "hidden") {
                core.property.set(object, "ui.basic.show", false);
            }
            else if (value === "icon") {
                core.property.set(object, "ui.class.remove", "widget.icon.list");
            }
            else if (value === "list") {
                core.property.set(object, "ui.class.remove", "widget.icon.icon");
            }
            core.property.set(object, "ui.class.add", "widget.icon." + value);
            core.property.set(object.var.icon, "ui.class.class", "widget.icon.image." + value);
            core.property.set(object.var.label, "ui.class.class", "widget.icon.label." + value);
        }
    };
};
