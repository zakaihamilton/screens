/*
 @author Zakai Hamilton
 @component WidgetTree
 */

screens.widget.tree = function WidgetTree(me, { core, ui }) {
    me.element = {
        dependencies: {
            properties: ["ui.element.count", "widget.tree.collapse"]
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
    me.clear = {
        set: function (object) {
            ui.node.empty(object.var.container);
        }
    };
    me.collapse = {
        get: function (object) {
            return object.isCollapsed;
        },
        set: function (object, value) {
            object.isCollapsed = value;
        }
    };
    me.elements = {
        get: function (object) {
            return ui.node.childList(object.var.container);
        },
        set: function (object, value) {
            if (value) {
                object.treeElements = value;
                core.property.set(object.var.container, "ui.basic.elements", value);
                core.property.notify(object.var.container, "update");
            }
        }
    };
    me.refresh = {
        set: function (object) {
            core.property.set(object.var.container, "empty");
            core.property.set(object, "elements", object.treeElements);
            core.property.notify(object.var.container, "update");
        }
    };
    me.selection = {
        get: function (object) {
            return object.var.container.selected;
        }
    };
};

screens.widget.tree.dropdown = function WidgetDropDownList(me, { core, ui }) {
    me.element = {
        dependencies: {
            properties: ["ui.element.count", "ui.basic.text", "widget.tree.collapse"]
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
            object.var.tree = ui.element.create({
                "ui.element.component": "widget.tree.popup",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.style.width": region.width + "px",
                "ui.style.height": "100px",
                "ui.basic.elements": object.parentNode.treeElements,
                "ui.group.data": object.parentNode.treeData,
                "widget.tree.popup.selection": core.property.get(object.parentNode, "text"),
                "ui.basic.window": object.parentNode
            });
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
            return object.treeElements;
        },
        set: function (object, value) {
            object.treeElements = value;
        }
    };
    me.data = {
        get: function (object) {
            return object.treeData;
        },
        set: function (object, value) {
            object.treeData = value;
        }
    };
};
screens.widget.tree.popup = function WidgetListPopup(me, { core, ui }) {
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
            core.property.set(object.window, "back", value);
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

screens.widget.tree.list = function WidgetTreeList(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "ul",
            "ui.class.class": "widget.tree.list"
        }
    };
};

screens.widget.tree.item = function WidgetTreeItem(me, { core, ui, widget }) {
    me.element = {
        properties: {
            "ui.basic.tag": "li",
            "ui.class.class": "widget.tree.item",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "container",
                    "ui.class.class": "widget.tree.item.container",
                    "ui.basic.elements": [
                        {
                            "ui.basic.var": "input",
                            "ui.basic.tag": "input",
                            "ui.basic.type": "checkbox",
                            "ui.class.class": "widget.tree.item.original",
                            "ui.basic.elementId": "@ui.basic.ref",
                            "ui.monitor.change": "update"
                        },
                        {
                            "ui.basic.tag": "label",
                            "ui.basic.htmlFor": "@ui.basic.ref",
                            "ui.class.class": "widget.tree.item.icon",
                            "ui.basic.var": "icon"
                        },
                        {
                            "ui.basic.var": "label",
                            "ui.class.class": "widget.tree.item.label",
                            "ui.touch.click": "click",
                            "ui.touch.default": "dblclick"
                        }
                    ]
                }
            ]
        },
        redirect: {
            "ui.basic.elements": "elements",
            "ui.basic.text": "text"
        },
        dependencies: {
            parent: ["widget.tree", "widget.tree.popup", "widget.tree.item", "widget.tree.list"],
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
    me.elements = {
        get: function (object) {
            return ui.node.childList(object.var.list);
        },
        set: function (object, value) {
            if (value) {
                if (!object.var.list) {
                    object.var.list = ui.element.create({
                        "ui.element.component": "widget.tree.list",
                        "ui.basic.var": "list"
                    }, object, object.context);
                }
                core.property.set(object.var.icon, "ui.class.add", "parent");
                ui.element.create(value, object.var.list, object.context);
                core.property.set(object, "update");
            }
        }
    };
    me.dblclick = {
        set: function (object) {
            core.property.set(object, "click");
            /*TODO: call default button on window */
        }
    };
    me.select = {
        set: function (object) {
            var container = ui.node.container(object, widget.container.id);
            if (container.selected) {
                core.property.set(container.selected, "ui.property.broadcast", {
                    "ui.class.remove": "selected"
                });
            }
            container.selected = object;
            core.property.set(object, "ui.property.broadcast", {
                "ui.class.add": "selected"
            });
            core.property.set(object.var.list, "ui.property.broadcast", {
                "ui.class.remove": "selected"
            });
            var popup = ui.node.container(object, "widget.tree.popup");
            core.property.set(popup, "select", object);
        }
    };
    me.click = {
        set: function (object) {
            var item = ui.node.container(object, me.id);
            core.property.set(item, "select");
        }
    };
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function (object, value) {
            object.var.label.innerHTML = value;
        }
    };
    me.update = {
        set: function (object) {
            var item = ui.node.container(object, me.id);
            if (item) {
                core.property.set(item.var.list, "ui.style.display", item.var.input.checked ? "block" : "none");
            }
            core.property.notify(ui.node.container(object, widget.container.id), "update");
        }
    };
    me.state = {
        get: function (object) {
            return object.var.input.checked;
        },
        set: function (object, value) {
            object.var.input.checked = value;
        }
    };
};
