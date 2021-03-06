/*
 @author Zakai Hamilton
 @component WidgetList
 */

screens.widget.list = function WidgetList(me, { core, ui }) {
    me.element = {
        dependencies: {
            properties: ["ui.element.count"]
        },
        redirect: {
            "ui.basic.elements": "elements"
        },
        properties: {
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
                core.property.set(object.var.container, "empty");
                core.property.set(object.var.container, "ui.basic.elements", value);
                core.property.notify(object.var.container, "update");
            }
        }
    };
    me.refresh = {
        set: function (object) {
            core.property.set(object.var.container, "empty");
            core.property.set(object, "elements", object.listElements);
            core.property.notify(object.var.container, "update");
        }
    };
    me.selection = {
        get: function (object) {
            var selection = [];
            var childList = ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var state = core.property.get(child, "state");
                    var label = core.property.get(child, "ui.basic.text");
                    if (state) {
                        selection.push(label);
                        break;
                    }
                }
            }
            return selection;
        },
        set: function (object, value) {
            var childList = ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = core.property.get(child, "ui.basic.text");
                    core.property.set(child, "state", value === label);
                }
            }
        }
    };
};

screens.widget.list.dropdown = function WidgetDropDownList(me, { core, ui }) {
    me.element = {
        dependencies: {
            properties: ["ui.element.count", "ui.basic.text"]
        },
        redirect: {
            "ui.basic.text": "text",
            "ui.basic.readOnly": "readOnly",
            "ui.basic.elements": "elements",
            "ui.group.data": "data",
            "ui.monitor.change": "monitorChange"
        },
        properties: {
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
                var label = core.property.get(value, "ui.basic.text");
                core.property.set(object, "ui.basic.text", label);
                core.property.set(object, "onChange", label);
            }
        }
    };
    me.dropdown = {
        set: function (object) {
            var region = ui.rect.absoluteRegion(object.parentNode);
            object.var.list = ui.element.create({
                "ui.element.component": "widget.list.popup",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.style.width": region.width + "px",
                "ui.style.height": "200px",
                "ui.basic.parentWidget": object.parentNode,
                "ui.basic.elements": object.parentNode.listElements,
                "ui.group.data": object.parentNode.listData,
                "widget.list.popup.selection": core.property.get(object.parentNode, "text")
            }, "workspace", "self");
        }
    };
    me.readOnly = {
        get: function (object) {
            return core.property.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            core.property.set(object.var.selection, "ui.basic.readOnly", value);
            core.property.set(object.var.selection, "ui.touch.click", value ? null : "dropdown");
        }
    };
    me.text = {
        get: function (object) {
            return core.property.get(object.var.selection, "ui.basic.text");
        },
        set: function (object, value) {
            core.property.set(object.var.selection, "ui.basic.text", value);
        }
    };
    me.monitorChange = {
        set: function (object, value) {
            core.property.set(object.var.selection, "ui.monitor.change", value);
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

screens.widget.list.popup = function WidgetListPopup(me, { core, ui }) {
    me.element = {
        redirect: {
            "ui.basic.elements": "elements"
        },
        properties: {
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
            core.property.set(object.parentWidget, "back", value);
            core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            core.property.set(object, "back", value);
        }
    };
    me.selection = {
        set: function (object, value) {
            var childList = ui.node.childList(object.var.container);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = core.property.get(child, "ui.basic.text");
                    if (label === value) {
                        core.property.set(child, "ui.class.add", "selected");
                        break;
                    }
                }
            }
        }
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                core.property.set(object.var.container, "ui.basic.elements", value);
                core.property.set(object.var.container, "update");
            }
        }
    };
};

screens.widget.list.item = function WidgetListItem(me, { core, ui }) {
    me.element = {
        properties: {
            "ui.basic.tag": "span",
            "ui.touch.click": "click",
            "ui.touch.default": "dblclick",
            "ui.class.class": "widget.list.item"
        },
        dependencies: {
            parent: ["widget.list", "widget.list.popup"],
            properties: ["ui.basic.text"]
        }
    };
    me.value = function (object, value) {
        if (typeof value === "string") {
            value = core.property.get(object.parentNode.target, value);
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
            return core.property.get(object, "ui.class.contains", "selected");
        },
        set: function (object, value) {
            value = me.value(object, value);
            if (value) {
                core.property.set(object, "ui.class.add", "selected");
            } else {
                core.property.set(object, "ui.class.remove", "selected");
            }
        }
    };
    me.dblclick = {
        set: function (object) {
            core.property.set(object, "click");
            /*TODO: call default button on window */
        }
    };
    me.click = {
        set: function (object) {
            if (object.group) {
                core.property.set(object, "ui.class.add", "selected");
                var childList = ui.node.childList(object.parentNode);
                if (childList) {
                    for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                        var child = childList[childIndex];
                        if (child.group !== object.group || object === child) {
                            continue;
                        }
                        core.property.set(child, "ui.class.remove", "selected");
                    }
                }
                var popup = ui.node.container(object, "widget.list.popup");
                core.property.set(popup, "select", object);
            }
            else {
                core.property.set(object, "ui.class.toggle", "selected");
            }
        }
    };
};
