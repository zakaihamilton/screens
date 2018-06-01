/*
 @author Zakai Hamilton
 @component WidgetList
 */

screens.widget.list = function WidgetList(me) {
    me.element = {
        dependencies : {
            properties: ["ui.element.count"]
        },
        redirect : {
            "ui.basic.elements": "elements"
        },
        properties : {
            "ui.class.class": "border",
            "ui.basic.elements": [
                {
                    "ui.basic.var": "container",
                    "ui.element.component": "widget.container"
                }
            ]
        }
    };
    me.elements = {
        get: function (object) {
            return object.listElements;
        },
        set: function (object, value) {
            if (value) {
                object.listElements = value;
                me.core.property.set(object.var.container, "empty");
                me.core.property.set(object.var.container, "ui.basic.elements", value);
                me.core.property.notify(object.var.container, "update");
            }
        }
    };
    me.refresh = {
        set: function (object) {
            me.core.property.set(object.var.container, "empty");
            me.core.property.set(object, "elements", object.listElements);
            me.core.property.notify(object.var.container, "update");
        }
    };
    me.selection = {
        get: function (object, value) {
            var selection = [];
            var childList = me.ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var state = me.core.property.get(child, "state");
                    var label = me.core.property.get(child, "ui.basic.text");
                    if (state) {
                        selection.push(label);
                        break;
                    }
                }
            }
            return selection;
        },
        set: function (object, value) {
            var childList = me.ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = me.core.property.get(child, "ui.basic.text");
                    me.core.property.set(child, "state", value === label);
                }
            }
        }
    };
};

screens.widget.list.dropdown = function WidgetDropDownList(me) {
    me.element = {
        dependencies : {
            properties: ["ui.element.count", "ui.basic.text"]
        },
        redirect : {
            "ui.basic.text": "text",
            "ui.basic.readOnly": "readOnly",
            "ui.basic.elements": "elements",
            "ui.group.data": "data",
            "ui.monitor.change": "monitorChange"
        },
        properties : {
            "ui.class.class": "group",
            "ui.basic.elements": [
                {
                    "ui.element.component": "widget.input",
                    "ui.basic.text": "",
                    "ui.basic.type": "text",
                    "ui.basic.var": "selection",
                    "ui.class.class": "selection",
                    "ui.basic.readOnly": true,
                    "ui.touch.click": "dropdown"
                },
                {
                    "ui.class.class": "button",
                    "ui.touch.click": "dropdown",
                    "ui.basic.elements": [
                        {
                            "ui.class.class": "button.arrow"
                        },
                        {
                            "ui.class.class": "button.line"
                        }
                    ]
                }
            ]
        }
    };
    me.back = {
        set: function (object, value) {
            if (value) {
                var label = me.core.property.get(value, "ui.basic.text");
                me.core.property.set(object, "ui.basic.text", label);
                me.core.property.set(object, "onChange", label);
            }
        }
    };
    me.dropdown = {
        set: function (object, value) {
            var region = me.ui.rect.absolute_region(object.parentNode);
            object.var.list = me.ui.element({
                "ui.element.component": "widget.list.popup",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.style.width": region.width + "px",
                "ui.style.height": "200px",
                "ui.basic.parentWidget": object.parentNode,
                "ui.basic.elements": object.parentNode.listElements,
                "ui.group.data": object.parentNode.listData,
                "widget.list.popup.selection": me.core.property.get(object.parentNode, "text")
            }, "workspace", "self");
        }
    };
    me.readOnly = {
        get: function (object) {
            return me.core.property.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.basic.readOnly", value);
            me.core.property.set(object.var.selection, "ui.touch.click", value ? null : "dropdown");
        }
    };
    me.text = {
        get: function (object) {
            return me.core.property.get(object.var.selection, "ui.basic.text");
        },
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.basic.text", value);
        }
    };
    me.monitorChange = {
        set: function (object, value) {
            me.core.property.set(object.var.selection, "ui.monitor.change", value);
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
    me.data = {
        get: function (object) {
            return object.listData;
        },
        set: function (object, value) {
            object.listData = value;
        }
    };
};

screens.widget.list.popup = function WidgetListPopup(me) {
    me.element = {
        redirect : {
            "ui.basic.elements": "elements"
        },
        properties : {
            "ui.class.class": "border",
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
        }
    };
    me.back = {
        set: function (object, value) {
            me.core.property.set(object.parentWidget, "back", value);
            me.core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            me.core.property.set(object, "back", value);
        }
    };
    me.selection = {
        set: function (object, value) {
            var childList = me.ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = me.core.property.get(child, "ui.basic.text");
                    if (label === value) {
                        me.core.property.set(child, "ui.class.add", "selected");
                        break;
                    }
                }
            }
        }
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.core.property.set(object.var.container, "ui.basic.elements", value);
                me.core.property.set(object.var.container, "update");
            }
        }
    };
};

screens.widget.list.item = function WidgetListItem(me) {
    me.element = {
        properties : {
            "ui.basic.tag": "span",
            "ui.touch.click": "click",
            "ui.touch.default": "dblclick",
            "ui.class.class": "widget.list.item"
        },
        dependencies : {
            parent: ["widget.list", "widget.list.popup"],
            properties: ["ui.basic.text"]
        }
    };
    me.value = function (object, value) {
        if (typeof value === "string") {
            value = me.core.property.get(object.parentNode.target, value);
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
        get: function (object) {
            return me.core.property.get(object, "ui.class.contains", "selected");
        },
        set: function (object, value) {
            value = me.value(object, value);
            if (value) {
                me.core.property.set(object, "ui.class.add", "selected");
            } else {
                me.core.property.set(object, "ui.class.remove", "selected");
            }
        }
    };
    me.dblclick = {
        set: function (object) {
            me.core.property.set(object, "click");
            /*TODO: call default button on window */
        }
    };
    me.click = {
        set: function (object) {
            if (object.group) {
                me.core.property.set(object, "ui.class.add", "selected");
                var childList = me.ui.node.childList(object.parentNode);
                if (childList) {
                    for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                        var child = childList[childIndex];
                        if (child.group !== object.group || object === child) {
                            continue;
                        }
                        me.core.property.set(child, "ui.class.remove", "selected");
                    }
                }
                var popup = me.ui.node.container(object, "widget.list.popup");
                me.core.property.set(popup, "select", object);
            }
            else {
                me.core.property.set(object, "ui.class.toggle", "selected");
            }
        }
    };
};
