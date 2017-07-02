/*
 @author Zakai Hamilton
 @component WidgetList
 */

package.widget.list = function WidgetList(me) {
    me.depends = {
        properties: ["ui.element.count"]
    };
    me.redirect = {
        "ui.basic.text": "widget.list.text",
        "ui.basic.readOnly": "widget.list.readOnly",
        "ui.basic.elements": "widget.list.elements"
    };
    me.class = "widget.list.group";
    me.default = {
        "ui.basic.tag": "div"
    };
    me.create = {
        set: function (object) {
            me.ui.element.create([
                {
                    "ui.style.display": "flex",
                    "ui.basic.elements": [
                        {
                            "ui.basic.text": "",
                            "ui.basic.var": "selection",
                            "ui.theme.class": "widget.list.selection",
                            "ui.basic.type": "text"
                        },
                        {
                            "ui.theme.class": "widget.list.button",
                            "ui.event.click": "widget.list.dropdown",
                            "ui.basic.elements": [
                                {
                                    "ui.theme.class": "widget.list.button.arrow"
                                },
                                {
                                    "ui.theme.class": "widget.list.button.line"
                                }
                            ]
                        }
                    ]
                },
                {
                    "ui.basic.var": "list",
                    "ui.theme.class": "widget.list.container",
                    "ui.element.component": "widget.container"
                }
            ], object);
        }
    };
    me.dropdown = {
        set: function (object, value) {
            var list = me.ui.node.container(object, me.id);
            var display = me.get(list.var.list, "ui.style.display");
            if (display === "none") {
                me.set(list.var.list, "ui.style.display", "flex");
                me.set(list.var.list, "ui.style.zIndex", "1");
            } else {
                me.set(list.var.list, "ui.style.display", "none");
                me.set(list.var.list, "ui.style.zIndex", "0");
            }
        }
    };
    me.text = {
        get: function (object) {
            return me.get(object.var.selection, "ui.basic.text");
        },
        set: function (object, value) {
            me.set(object.var.selection, "ui.basic.text", value);
        }
    };
    me.readOnly = {
        get: function (object) {
            return me.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            me.set(object.var.selection, "ui.basic.readOnly", value);
        }
    }
    me.elements = {
        set: function (object, value) {
            if (value) {
                var content = me.widget.container.content(object.var.list);
                me.ui.element.create(value, content);
            }
        }
    };
};
