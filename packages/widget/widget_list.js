/*
 @author Zakai Hamilton
 @component WidgetList
 */

package.widget.list = function WidgetList(me) {
    me.depends = {
        properties: ["ui.element.count"]
    };
    me.redirect = {
        "ui.basic.elements": "elements"
    };
    me.default = {
        "ui.theme.class": "border",
        "ui.basic.elements": [
            {
                "ui.basic.var": "container",
                "ui.element.component": "widget.container"
            }
        ]
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.set(object.var.container, "ui.basic.elements", value);
            }
        }
    };
};

package.widget.list.dropdown = function WidgetDropDownList(me) {
    me.depends = {
        properties: ["ui.element.count", "ui.basic.text"]
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
            if(value) {
                var label = me.get(value, "ui.basic.text");
                me.set(object, "ui.basic.text", label);
            }
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
                "ui.basic.elements": object.parentNode.listElements,
                "ui.var.parentList":object.parentNode
            }, document.body);
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
                "ui.basic.var": "container",
                "ui.element.component": "widget.container"
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
            me.set(object, "back", value);
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

package.widget.list.item = function WidgetMenuItem(me) {
    me.default = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click",
        "ui.theme.class": "widget.list.item"
    };
    me.depends = {
        parent: ["widget.list", "widget.list.popup"],
        properties: ["ui.basic.text"]
    };
    me.value = function (object, value) {
        if (typeof value === "string") {
            value = me.get(object.parentNode.target, value);
        }
        return value;
    };
    me.group = {
        get: function (object) {
            return object.group;
        },
        set: function (object, value) {
            object.group = value;
        }
    };
    me.state = {
        set: function (object, value) {
            value = me.value(object, value);
            console.log("state: " + value);
            if (value) {
                me.set(object, "ui.theme.add", "checked");
            } else {
                me.set(object, "ui.theme.remove", "checked");
            }
        }
    };
    me.click = {
        set: function (object) {
            if (object.group) {
                me.set(object, "ui.theme.add", "checked");
                var childList = me.ui.node.childList(object.parentNode);
                if (childList) {
                    for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                        var child = childList[childIndex];
                        if (child.group !== object.group || object === child) {
                            continue;
                        }
                        me.set(child, "ui.theme.remove", "checked");
                    }
                }
                var popup = me.ui.node.container(object, "widget.list.popup");
                me.set(popup, "select", object);
            }
            else {
                me.set(object, "ui.theme.toggle", "checked");
            }
        }
    };
};
