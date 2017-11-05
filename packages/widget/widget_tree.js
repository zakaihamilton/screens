/*
 @author Zakai Hamilton
 @component WidgetTree
 */

package.widget.tree = function WidgetTree(me) {
    me["ui.element.depends"] = {
        properties: ["ui.element.count", "widget.tree.collapse"]
    };
    me["core.property.redirect"] = {
        "ui.basic.elements": "elements"
    };
    me["ui.element.default"] = {
        "ui.class.class": "border",
        "ui.basic.elements": [
            {
                "ui.basic.var": "container",
                "ui.element.component": "widget.container"
            }
        ]
    };
    me.clear = {
        set: function (object, value) {
            var content = me.package.widget.container.content(object.var.container);
            me.package.ui.node.empty(content);
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
            var content = me.package.widget.container.content(object.var.container);
            return me.package.ui.node.childList(content);
        },
        set: function (object, value) {
            if (value) {
                object.treeElements = value;
                var content = me.package.widget.container.content(object.var.container);
                me.package.core.property.set(content, "ui.basic.elements", value);
                me.package.core.property.notify(object.var.container, "update");
            }
        }
    };
    me.refresh = {
        set: function (object) {
            me.package.core.property.set(object.var.container, "empty");
            me.package.core.property.set(object, "elements", object.treeElements);
            me.package.core.property.notify(object.var.container, "update");
        }
    };
    me.selection = {
        get: function (object) {
            return object.var.container.selected;
        }
    };
};
package.widget.tree.dropdown = function WidgetDropDownList(me) {
    me["ui.element.depends"] = {
        properties: ["ui.element.count", "ui.basic.text", "widget.tree.collapse"]
    };
    me["core.property.redirect"] = {
        "ui.basic.text": "text",
        "ui.basic.readOnly": "readOnly",
        "ui.basic.elements": "elements",
        "ui.group.data": "data",
        "ui.monitor.change": "monitorChange"
    };
    me["ui.element.default"] = {
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
    };
    me.back = {
        set: function (object, value) {
            if (value) {
                var label = me.package.core.property.get(value, "ui.basic.text");
                me.package.core.property.set(object, "ui.basic.text", label);
                me.package.core.property.set(object, "onChange", label);
            }
        }
    };
    me.dropdown = {
        set: function (object, value) {
            var region = me.package.ui.rect.absolute_region(object.parentNode);
            object.var.tree = me.package.ui.element.create({
                "ui.element.component": "widget.tree.popup",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.style.width": region.width + "px",
                "ui.style.height": "100px",
                "ui.basic.elements": object.parentNode.treeElements,
                "ui.group.data": object.parentNode.treeData,
                "widget.tree.popup.selection": me.package.core.property.get(object.parentNode, "text"),
                "ui.var.parentList": object.parentNode
            });
        }
    };
    me.readOnly = {
        get: function (object) {
            return me.package.core.property.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            me.package.core.property.set(object.var.selection, "ui.basic.readOnly", value);
            me.package.core.property.set(object.var.selection, "ui.touch.click", value ? null : "dropdown");
        }
    };
    me.text = {
        get: function (object) {
            return me.package.core.property.get(object.var.selection, "ui.basic.text");
        },
        set: function (object, value) {
            me.package.core.property.set(object.var.selection, "ui.basic.text", value);
        }
    };
    me.monitorChange = {
        set: function (object, value) {
            me.package.core.property.set(object.var.selection, "ui.monitor.change", value);
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
package.widget.tree.popup = function WidgetListPopup(me) {
    me["core.property.redirect"] = {
        "ui.basic.elements": "elements"
    };
    me["ui.element.default"] = {
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
    };
    me.back = {
        set: function (object, value) {
            me.package.core.property.set(object.var.parentList, "back", value);
            me.package.core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            me.package.core.property.set(object, "back", value);
        }
    };
    me.selection = {
        set: function (object, value) {
            var childList = me.package.ui.node.childList(me.package.widget.container.content(object.var.container));
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = me.package.core.property.get(child, "ui.basic.text");
                    if (label === value) {
                        me.package.core.property.set(child, "ui.class.add", "selected");
                        break;
                    }
                }
            }
        }
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.package.core.property.set(object.var.container, "ui.basic.elements", value);
                me.package.core.property.set(object.var.container, "update");
            }
        }
    };
};

package.widget.tree.list = function WidgetTreeList(me) {
    me["ui.element.default"] = {
        "ui.basic.tag": "ul",
        "ui.class.class": "widget.tree.list"
    };
};

package.widget.tree.item = function WidgetTreeItem(me) {
    me["ui.element.default"] = {
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
    };
    me["core.property.redirect"] = {
        "ui.basic.elements": "elements",
        "ui.basic.text": "text"
    };
    me["ui.element.depends"] = {
        parent: ["widget.tree", "widget.tree.popup", "widget.tree.item", "widget.tree.list"],
        properties: ["ui.basic.text"]
    };
    me.value = function (object, value) {
        if (typeof value === "string") {
            value = me.package.core.property.get(object.parentNode.target, value);
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
            return me.package.ui.node.childList(object.var.list);
        },
        set: function (object, value) {
            if (value) {
                if (!object.var.list) {
                    object.var.list = me.package.ui.element.create({
                        "ui.element.component": "widget.tree.list",
                        "ui.basic.var": "list"
                    }, object, object.context);
                }
                me.package.core.property.set(object.var.icon, "ui.class.add", "parent");
                me.package.ui.element.create(value, object.var.list, object.context);
                me.package.core.property.set(object, "update");
            }
        }
    };
    me.dblclick = {
        set: function (object) {
            me.package.core.property.set(object, "click");
            /*TODO: call default button on window */
        }
    };
    me.select = {
        set: function(object) {
            var container = me.package.ui.node.container(object, me.package.widget.container.id);
            if(container.selected) {
                me.package.core.property.set(container.selected, "ui.property.broadcast", {
                    "ui.class.remove" : "selected"
                });
            }
            container.selected = object;
            me.package.core.property.set(object, "ui.property.broadcast", {
                "ui.class.add" : "selected"
            });
            me.package.core.property.set(object.var.list, "ui.property.broadcast", {
                "ui.class.remove" : "selected"
            });
            var popup = me.package.ui.node.container(object, "widget.tree.popup");
            me.package.core.property.set(popup, "select", object);
        }
    };
    me.click = {
        set: function (object) {
            var item = me.package.ui.node.container(object, me.id);
            me.package.core.property.set(item, "select");
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
            var item = me.package.ui.node.container(object, me.id);
            if(item) {
                me.package.core.property.set(item.var.list, "ui.style.display", item.var.input.checked ? "block" : "none");
            }
            me.package.core.property.notify(me.package.ui.node.container(object, me.package.widget.container.id), "update");
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
