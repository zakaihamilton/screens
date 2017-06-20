/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.elements" : {
            "ui.basic.var":"modal",
            "ui.style.display":"none",
            "ui.element.component":"widget.modal"
        }
    };
    me.class = ["widget.menu.horizontal"];
    me.items = {
        set: function (object, value) {
            if (!object.menu) {
                object.menu = me.ui.element.create({
                    "ui.element.component": "widget.menu",
                    "ui.style.position": "absolute",
                    "ui.basic.window": object,
                    "ui.group.data": {
                        "ui.data.keys": ["ui.basic.text", "select"],
                        "ui.data.values": value
                    }
                }, object.content);
            }
        }
    };
    me.back = {
        set: function (object, value) {
            me.ui.element.set(object.modal, "ui.style.display", "none");
            me.ui.element.set(object.menu, "ui.node.parent", null);
            me.ui.element.broadcast(object, "ui.theme.remove", "select");
            me.ui.element.broadcast(object, "ui.event.move", null);
            object.selected_item = null;
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            if(item === object.selected_item) {
                me.ui.element.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            me.ui.element.broadcast(object, "ui.event.move", "focus");
            me.ui.element.broadcast(object, "ui.theme.remove", "select");
            me.ui.element.set(item, "ui.theme.add", "select");
            me.ui.element.set(object.menu, "ui.node.parent", null);
            if (typeof info === "string") {
                me.ui.element.set(object, info, item);
            } else if (Array.isArray(info)) {
                me.create_menu(object, item, info);
            }
        }
    };
    me.create_menu = function (object, item, values) {
        var region = me.ui.rect.relative_region(item);
        me.ui.element.set(object.modal, "ui.style.display", "initial");
        var menu = me.ui.element.create({
            "ui.basic.var":"menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.position": "absolute",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.top + region.height + "px",
            "ui.basic.window": object.window,
            "ui.group.data": {
                "ui.data.keys": ["ui.basic.text", "select"],
                "ui.data.values": values
            }
        }, object);
        me.ui.element.set(me.ui.element.to_object(menu).modal, "ui.style.display", "none");
        return menu;
    };
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.elements" : {
            "ui.basic.var":"modal",
            "ui.element.component":"widget.modal"
        }
    };
    me.class = ["widget.menu.vertical"];
    me.back = {
        set: function (object, value) {
            me.ui.element.set(object.parentNode, "back", value);
            me.ui.element.set(object, "ui.node.parent", null);
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            me.ui.element.set(object, "back", item);
            me.ui.element.set(object, info, item);
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
    me.select = {
        get: function (object) {
            return object.menu_select;
        },
        set: function (object, value) {
            object.menu_select = value;
            if (!Array.isArray(value)) {
                var enabled = me.ui.element.get(object.parentNode, value);
                me.ui.element.set(object, "ui.basic.enabled", enabled);
            }
        }
    };
    me.focus = {
        set: function (object, value) {
            if(object.parentNode.selected_item !== object) {
                me.ui.element.set(object.parentNode, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            me.ui.element.set(object.parentNode, "select", [object, object.menu_select]);
        }
    };
};
