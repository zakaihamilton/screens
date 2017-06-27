/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.style.display": "none",
            "ui.element.component": "widget.modal"
        }
    };
    me.class = ["widget.menu.horizontal"];
    me.attach = function(source, target) {
        if(source.var.menu) {
            var parent = target;
            if(target.var.header) {
                parent = target.var.header;
            }
            parent.appendChild(source.var.menu);
            target.var.menu = source.var.menu;
            source.var.menu = null;
            me.ui.property.broadcast(target, "ui.theme.add", "menu");
            me.ui.property.broadcast(source, "ui.theme.remove", "menu");
        }
    };
    me.items = {
        set: function (object, value) {
            if (!object.var.menu) {
                var parent = object;
                if(object.var.header) {
                    parent = object.var.header;
                }
                object.var.menu = me.ui.element.create({
                    "ui.element.component": "widget.menu",
                    "ui.style.position": "relative",
                    "ui.group.data": {
                        "ui.data.keys": ["ui.basic.text", "select", "options"],
                        "ui.data.values": value
                    }
                }, parent);
                me.ui.property.broadcast(object, "ui.theme.add", "menu");
            }
        }
    };
    me.back = {
        set: function (object, value) {
            me.set(object, "ui.style.z-index", "");
            me.set(object.var.modal, "ui.style.display", "none");
            me.set(object.var.menu, "ui.node.parent", null);
            me.ui.property.broadcast(object, "ui.theme.remove", "select");
            me.ui.property.broadcast(object, "ui.event.move", null);
            object.selected_item = null;
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            if (item === object.selected_item) {
                me.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            me.set(object, "ui.style.z-index", "1");
            me.ui.property.broadcast(object, "ui.event.move", "focus");
            me.ui.property.broadcast(object, "ui.theme.remove", "select");
            me.set(item, "ui.theme.add", "select");
            me.set(object.var.menu, "ui.node.parent", null);
            me.set(object.var.modal, "ui.style.display", "initial");
            if (typeof info === "string") {
                me.set(object, info, item);
            } else if (Array.isArray(info)) {
                me.create_menu(null, object, me.ui.rect.relative_region(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values, parent=object) {
        var menu = me.ui.element.create({
            "ui.basic.var": "menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.position": "absolute",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.bottom + "px",
            "ui.basic.window": window,
            "ui.group.data": {
                "ui.data.keys": ["ui.basic.text", "select", "options"],
                "ui.data.values": values
            }
        }, parent);
        if(object.component === "widget.menu") {
            me.set(menu.var.modal, "ui.style.display", "none");
        }
        return menu;
    };
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal"
        }
    };
    me.class = ["widget.menu.vertical"];
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

package.widget.menu.item = function WidgetMenuItem(me) {
    me.default = {
        "ui.basic.tag": "a",
        "ui.event.click": "click",
        "ui.basic.href": "#"
    };
    me.depends = {
        parent: ["widget.menu", "widget.menu.popup"],
        properties: ["ui.basic.text"]
    };
    me.options = {
        set: function (object, value) {
            if (value) {
                if ("enabled" in value) {
                    me.set(object, "ui.basic.enabled", value["enabled"]);
                }
                if ("state" in value) {
                    if (value["state"]) {
                        me.set(object, "ui.theme.add", "checked");
                    } else {
                        me.set(object, "ui.theme.remove", "checked");
                    }
                }
                if ("separator" in value) {
                    if (value["separator"]) {
                        me.set(object, "ui.theme.add", "separator");
                    } else {
                        me.set(object, "ui.theme.remove", "separator");
                    }
                }
            }
        }
    };
    me.select = {
        get: function (object) {
            return object.menu_select;
        },
        set: function (object, value) {
            object.menu_select = value;
            if (value && !Array.isArray(value)) {
                var options = me.get(object.parentNode, value);
                if (options) {
                    me.set(object, "options", options);
                }
            }
        }
    };
    me.focus = {
        set: function (object, value) {
            if (object.parentNode.selected_item !== object) {
                me.set(object.parentNode, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            me.set(object.parentNode, "select", [object, object.menu_select]);
        }
    };
};
