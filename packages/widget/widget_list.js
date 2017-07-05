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
        "ui.basic.elements": "elements",
        "ui.basic.readOnly": "readOnly"
    };
    me.default = {
        "ui.theme.class": "group",
        "ui.basic.elements": [
            {
                "ui.basic.text": "",
                "ui.basic.var": "selection",
                "ui.theme.class": "selection",
                "ui.touch.click": "dropdown"
            },
            {
                "ui.theme.class": "button",
                "ui.touch.click": "dropdown",
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
            var region = me.ui.rect.absolute_region(object.parentNode);
            object.var.list = me.ui.element.create({
                "ui.element.component": "widget.list.popup",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.style.width": region.width + "px",
                "ui.style.height": "100px",
                "ui.basic.elements": object.parentNode.listElements
            }, document.body);
            object.var.list.var.parentList = object.parentNode;
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
    me.elements = {
        get: function (object) {
            return object.listElements;
        },
        set: function (object, value) {
            object.listElements = value;
        }
    };
};

package.widget.list.popup = function WidgetListPopup(me) {
    me.redirect = {
        "ui.basic.elements": "elements"
    };
    me.default = {
        "ui.theme.class": "border",
        "ui.basic.elements": [
            {
                "ui.basic.var": "modal",
                "ui.element.component": "widget.modal"
            },
            {
                "ui.basic.var":"container",
                "ui.element.component":"widget.container"
            }
        ]
    };
    me.back = {
        set: function (object, value) {
            me.set(object.var.parentList, "back", value);
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
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.set(object.var.container, "ui.basic.elements", value);
            }
        }
    };
};
