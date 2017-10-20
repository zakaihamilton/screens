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
        "ui.class.class": "border",
        "ui.basic.elements": [
            {
                "ui.basic.var": "container",
                "ui.element.component": "widget.container"
            }
        ]
    };
    me.elements = {
        get: function (object) {
            return object.listElements;
        },
        set: function (object, value) {
            if (value) {
                object.listElements = value;
                me.set(object.var.container, "ui.basic.elements", value);
                me.notify(object.var.container, "update");
            }
        }
    };
    me.refresh = {
        set: function(object) {
            me.set(object.var.container, "empty");
            me.set(object, "elements", object.listElements);
            me.notify(object.var.container, "update");
        }
    };
    me.selection = {
        get: function (object, value) {
            var selection = [];
            var content = me.widget.container.content(object.var.container);
            var childList = me.ui.node.childList(content);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var state = me.get(child, "state");
                    var label = me.get(child, "ui.basic.text");
                    if(state) {
                        selection.push(label);
                        break;
                    }
                }
            }
            return selection;
        },
        set: function(object, value) {
            var content = me.widget.container.content(object.var.container);
            var childList = me.ui.node.childList(content);
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = me.get(child, "ui.basic.text");
                    me.set(child, "state", value === label);
                }
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
        "ui.basic.readOnly": "readOnly",
        "ui.basic.elements": "elements",
        "ui.group.data": "data",
        "ui.monitor.change":"monitorChange"
    };
    me.default = {
        "ui.class.class": "group",
        "ui.basic.elements": [
            {
                "ui.element.component":"widget.input",
                "ui.basic.text": "",
                "ui.basic.type":"text",
                "ui.basic.var": "selection",
                "ui.class.class": "selection",
                "ui.basic.readOnly":true,
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
            if(value) {
                var label = me.get(value, "ui.basic.text");
                me.set(object, "ui.basic.text", label);
                me.set(object, "onChange", label);
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
                "ui.group.data":object.parentNode.listData,
                "widget.list.popup.selection":me.get(object.parentNode, "text"),
                "ui.var.parentList":object.parentNode
            });
        }
    };
    me.readOnly = {
        get: function (object) {
            return me.get(object.var.selection, "ui.basic.readOnly");
        },
        set: function (object, value) {
            me.set(object.var.selection, "ui.basic.readOnly", value);
            me.set(object.var.selection, "ui.touch.click", value ? null : "dropdown");
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
    me.monitorChange = {
        set: function (object, value) {
            me.set(object.var.selection, "ui.monitor.change", value);
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
        get: function(object) {
            return object.listData;
        },
        set: function(object, value) {
            object.listData = value;
        }
    };
};

package.widget.list.popup = function WidgetListPopup(me) {
    me.redirect = {
        "ui.basic.elements": "elements"
    };
    me.default = {
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
            me.set(object.var.parentList, "back", value);
            me.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            me.set(object, "back", value);
        }
    };
    me.selection = {
        set: function(object, value) {
            var childList = me.ui.node.childList(me.widget.container.content(object.var.container));
            if (childList) {
                for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                    var child = childList[childIndex];
                    var label = me.get(child, "ui.basic.text");
                    if(label === value) {
                        me.set(child, "ui.class.add", "selected");
                        break;
                    }
                }
            }
        }
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.set(object.var.container, "ui.basic.elements", value);
                me.set(object.var.container, "update");
            }
        }
    };
};

package.widget.list.item = function WidgetListItem(me) {
    me.default = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click",
        "ui.touch.default": "dblclick",
        "ui.class.class": "widget.list.item"
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
        get: function (object) {
            return me.get(object, "ui.class.contains", "selected");
        },
        set: function (object, value) {
            value = me.value(object, value);
            if (value) {
                me.set(object, "ui.class.add", "selected");
            } else {
                me.set(object, "ui.class.remove", "selected");
            }
        }
    };
    me.dblclick = {
        set: function(object) {
            me.set(object, "click");
            /*TODO: call default button on window */
        }
    };
    me.click = {
        set: function (object) {
            if (object.group) {
                me.set(object, "ui.class.add", "selected");
                var childList = me.ui.node.childList(object.parentNode);
                if (childList) {
                    for (var childIndex = 0; childIndex < childList.length; childIndex++) {
                        var child = childList[childIndex];
                        if (child.group !== object.group || object === child) {
                            continue;
                        }
                        me.set(child, "ui.class.remove", "selected");
                    }
                }
                var popup = me.ui.node.container(object, "widget.list.popup");
                me.set(popup, "select", object);
            }
            else {
                me.set(object, "ui.class.toggle", "selected");
            }
        }
    };
};
