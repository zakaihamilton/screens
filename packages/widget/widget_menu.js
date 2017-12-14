/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me["ui.element.default"] = {
        "ui.class.class": "horizontal",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal",
            "ui.style.display":"none"
        }
    };
    me.updateTheme = function(object) {
        if(object.var.menu) {
            me.package.core.property.set(object, "ui.property.broadcast", {
                "ui.class.add": "menu"
            });
        }
        else {
            me.package.core.property.set(object, "ui.property.broadcast", {
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
                object.var.menu = me.package.ui.element.create({
                    "ui.element.component": "widget.menu",
                    "ui.style.position": "relative",
                    "ui.group.data": {
                        "ui.data.keyList": ["ui.basic.text", "select", "options"],
                        "ui.data.values": value
                    }
                }, parent);
                me.package.core.property.set(object, "ui.property.broadcast", {
                    "ui.class.add": "menu"
                });
            }
        }
    };
    me.back = {
        set: function (object, value) {
            me.package.core.property.set(object, "ui.style.zIndex", "");
            me.package.core.property.set(object.var.modal, "ui.style.display", "none");
            me.package.core.property.set(object.var.menu, "ui.node.parent");
            me.package.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.package.core.property.set(object, "ui.property.broadcast", {
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
                me.package.core.property.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            me.package.core.property.set(object, "ui.style.zIndex", "10");
            me.package.core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": "widget.menu.item.hover"
            });
            me.package.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.package.core.property.set(item, "ui.class.add", "select");
            me.package.core.property.set(object.var.menu, "ui.node.parent");
            me.package.core.property.set(object.var.modal, "ui.style.display", "initial");
            if (typeof info === "string") {
                me.package.core.property.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = me.package.core.property.get(object, "widget.window.active");
                object.var.menu = me.create_menu(window, object, me.package.ui.rect.absolute_region(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values, bottomUp) {
        var menu = me.package.ui.element.create({
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
        if(bottomUp) {
            me.package.core.property.set(menu, "ui.class.add", "bottom-up");
        }
        if (object.component === me.id) {
            me.package.core.property.set(menu.var.modal, "ui.style.display", "none");
        }
        return menu;
    };
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me["ui.element.default"] = {
        "ui.class.class": "widget.menu.vertical",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal"
        }
    };
    me.back = {
        set: function (object, value) {
            me.package.core.property.set(object.target, "back", value);
            me.package.core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var info = value[1];
            me.package.core.property.set(object, "back", item);
            me.package.core.property.set(object.window, info, me.package.core.property.get(item, "ui.basic.text"));
        }
    };
};

package.widget.menu.item = function WidgetMenuItem(me) {
    me["ui.element.default"] = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click"
    };
    me["ui.element.depends"] = {
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
                value = me.package.core.property.get(object.parentNode.window, value, me.package.core.property.get(object, "ui.basic.text"));
            }
            callback(value);
        }
    };
    me.options = {
        set: function (object, options) {
            if (options) {
                me.handleValue(object, options, "enabled", function (value) {
                    me.package.core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "visible", function (value) {
                    me.package.core.property.set(object, "ui.style.display", value ? "block" : "none");
                });
                me.handleValue(object, options, "state", function (value) {
                    if (value) {
                        me.package.core.property.set(object, "ui.class.add", "checked");
                    } else {
                        me.package.core.property.set(object, "ui.class.remove", "checked");
                    }
                });
                me.handleValue(object, options, "separator", function (value) {
                    if (value) {
                        me.package.core.property.set(object, "ui.class.add", "separator");
                    } else {
                        me.package.core.property.set(object, "ui.class.remove", "separator");
                    }
                });
                me.handleValue(object, options, "header", function (value) {
                    if (value) {
                        me.package.core.property.set(object, "ui.class.add", "header");
                    } else {
                        me.package.core.property.set(object, "ui.class.remove", "header");
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
                me.package.core.property.set(object.parentNode, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            me.package.core.property.set(object.parentNode, "select", [object, object.menu_select]);
        }
    };
};
