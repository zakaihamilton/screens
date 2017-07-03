/*
 @author Zakai Hamilton
 @component WidgetList
 */

package.widget.list = function WidgetList(me) {

};

package.widget.list.dropdown = function WidgetDropDownList(me) {
    me.depends = {
        properties: ["ui.element.count"]
    };
    me.redirect = {
        "ui.basic.text": "text",
        "ui.basic.readOnly": "readOnly"
    };
    me.default = {
        "ui.basic.tag": "div",
        "ui.theme.class": "group",
        "ui.style.display": "flex",
        "ui.basic.elements": [
            {
                "ui.basic.text": "",
                "ui.basic.var": "selection",
                "ui.theme.class": "selection",
                "ui.event.click": "dropdown"
            },
            {
                "ui.theme.class": "button",
                "ui.event.click": "dropdown",
                "ui.basic.elements": [
                    {
                        "ui.theme.class": "button.arrow"
                    },
                    {
                        "ui.theme.class": "button.line"
                    }
                ]
            }
        ]
    };
    me.back = {
        set: function (object, value) {
            me.set(object.var.list, "ui.node.parent", null);
        }
    };
    me.dropdown = {
        set: function (object, value) {
            var region = me.ui.rect.relative_region(object.parentNode);
            me.ui.element.create({
                "ui.basic.var": "list",
                "ui.element.component": "widget.list.popup",
                "ui.style.top": region.height + "px",
                "ui.style.width": region.width - 2 + "px",
                "ui.style.height": "100px"
            }, object.parentNode);
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
    };
};

package.widget.list.popup = function WidgetListPopup(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.theme.class": "widget.list.popup",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal"
        }
    };
    me.back = {
        set: function (object, value) {
            me.set(object.parentNode, "back", value);
            me.set(object, "ui.node.parent", null);
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            me.set(object, info, item);
            me.set(object, "back", item);
        }
    };
};
