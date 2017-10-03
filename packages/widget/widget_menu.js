/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.class.class": "horizontal",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal",
            "ui.style.display":"none"
        }
    };
    me.updateTheme = function(object) {
        if(object.var.menu) {
            me.set(object, "ui.property.broadcast", {
                "ui.class.add": "menu"
            });
        }
        else {
            me.set(object, "ui.property.broadcast", {
                "ui.class.remove": "menu"
            });
        }
    };
    me.switch = function (source, target) {
        var target_menu = target.var.menu;
        target.var.menu = source.var.menu;
        source.var.menu = target_menu;
        me.updateTheme(source);
        me.updateTheme(target);
    };
    me.items = {
        set: function (object, value) {
            if (!object.var.menu) {
                var parent = object;
                if (object.var.header) {
                    parent = object.var.header;
                }
                object.var.menu = me.ui.element.create({
                    "ui.element.component": "widget.menu",
                    "ui.style.position": "relative",
                    "ui.group.data": {
                        "ui.data.keyList": ["ui.basic.text", "select", "options"],
                        "ui.data.values": value
                    }
                }, parent);
                me.set(object, "ui.property.broadcast", {
                    "ui.class.add": "menu"
                });
            }
        }
    };
    me.back = {
        set: function (object, value) {
            me.set(object, "ui.style.zIndex", "");
            me.set(object.var.modal, "ui.style.display", "none");
            me.set(object.var.menu, "ui.node.parent");
            me.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.set(object, "ui.property.broadcast", {
                "ui.touch.over": null
            });
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
            me.set(object, "ui.style.zIndex", "10");
            me.set(object, "ui.property.broadcast", {
                "ui.touch.over": "widget.menu.item.hover"
            });
            me.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.set(item, "ui.class.add", "select");
            me.set(object.var.menu, "ui.node.parent");
            me.set(object.var.modal, "ui.style.display", "initial");
            if (typeof info === "string") {
                me.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = me.get(object, "widget.window.active");
                object.var.menu = me.create_menu(window, object, me.ui.rect.absolute_region(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values) {
        var menu = me.ui.element.create({
            "ui.basic.var": "menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.bottom + "px",
            "ui.basic.window": window,
            "ui.basic.target": object,
            "ui.group.data": {
                "ui.data.keyList": ["ui.basic.text", "select", "options"],
                "ui.data.values": values
            }
        });
        if (object.component === me.id) {
            me.set(menu.var.modal, "ui.style.display", "none");
        }
        return menu;
    };
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me.default = {
        "ui.class.class": "widget.menu.vertical",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal"
        }
    };
    me.back = {
        set: function (object, value) {
            me.set(object.target, "back", value);
            me.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            me.set(object, "back", item);
            me.set(object.window, info, me.get(item, "ui.basic.text"));
        }
    };
};

package.widget.menu.item = function WidgetMenuItem(me) {
    me.default = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click"
    };
    me.depends = {
        parent: ["widget.menu", "widget.menu.popup"],
        properties: ["ui.basic.text"]
    };
    me.handleValue = function (object, values, key, callback) {
        if (key in values) {
            var value = values[key];
            if (typeof value === "string" || typeof value === "function") {
                if(value === "select") {
                    value = object.menu_select;
                }
                value = me.get(object.parentNode.window, value, me.get(object, "ui.basic.text"));
            }
            callback(value);
        }
    };
    me.options = {
        set: function (object, options) {
            if (options) {
                me.handleValue(object, options, "enabled", function (value) {
                    me.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "visible", function (value) {
                    me.set(object, "ui.style.display", value ? "block" : "none");
                });
                me.handleValue(object, options, "state", function (value) {
                    if (value) {
                        me.set(object, "ui.class.add", "checked");
                    } else {
                        me.set(object, "ui.class.remove", "checked");
                    }
                });
                me.handleValue(object, options, "separator", function (value) {
                    if (value) {
                        me.set(object, "ui.class.add", "separator");
                    } else {
                        me.set(object, "ui.class.remove", "separator");
                    }
                });
            }
        }
    };
    me.select = {
        get: function (object) {
            return object.menu_select;
        },
        set: function (object, value) {
            object.menu_select = value;
        }
    };
    me.hover = {
        set: function (object, value) {
            if (object.parentNode.selected_item !== object && object.menu_select) {
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
