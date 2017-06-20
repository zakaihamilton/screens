/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.basic.tag": "div",
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
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            if (typeof info === "string") {
                me.ui.element.set(object, info, item);
            } else if (Array.isArray(info)) {
                me.create_menu(object, item, info);
            }
        }
    };
    me.create_menu = function (object, item, values) {
        var region = me.ui.rect.absolute_region(item);
        var menu = me.ui.element.create({
            "ui.element.component": "widget.menu.popup",
            "ui.style.position": "absolute",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.top + region.height + "px",
            "ui.basic.window": object.window,
            "ui.group.data": {
                "ui.data.keys": ["ui.basic.text", "select"],
                "ui.data.values": values
            }
        }, me.ui.element.body());
        me.ui.element.set(menu, "ui.modal.forward", object);
        return menu;
    };
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me.default = {
        "ui.basic.tag": "div",
    };
    me.container = {
        "ui.modal.popup": "widget.menu.popup.close"
    };
    me.class = ["widget.menu.vertical"];
    me.close = {
        set: function (object, value) {
            me.ui.modal.close(object);
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            me.ui.element.set(object, "close", item);
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
    me.click = {
        set: function (object) {
            me.ui.element.set(object.parentNode, "select", [object, object.menu_select]);
        }
    };
};
