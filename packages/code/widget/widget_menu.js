/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

screens.widget.menu = function WidgetMenu(me) {
    me.properties = {
        "ui.class.class": "horizontal",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal",
            "ui.style.display": "none"
        }
    };
    me.updateTheme = function (object) {
        if (object.var.menu) {
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.class.add": "menu"
            });
        }
        else {
            me.core.property.set(object, "ui.property.broadcast", {
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
                object.var.menu = me.ui.element({
                    "ui.element.component": "widget.menu",
                    "ui.style.position": "relative",
                    "ui.group.data": {
                        "ui.data.keyList": ["ui.basic.text", "select", "options", "properties"],
                        "ui.data.values": value
                    }
                }, parent);
                me.core.property.set(object, "ui.property.broadcast", {
                    "ui.class.add": "menu"
                });
            }
        }
    };
    me.back = {
        set: function (object, value) {
            me.core.property.set(object, "ui.style.zIndex", "");
            me.core.property.set(object.var.modal, "ui.style.display", "none");
            me.core.property.set(object.var.menu, "ui.node.parent");
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.core.property.set(object, "ui.property.broadcast", {
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
                me.core.property.set(object, "back", item);
                return;
            }
            object.selected_item = item;
            me.core.property.set(object, "ui.style.zIndex", "10");
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.touch.over": "widget.menu.item.hover"
            });
            me.core.property.set(object, "ui.property.broadcast", {
                "ui.class.remove": "select"
            });
            me.core.property.set(item, "ui.class.add", "select");
            me.core.property.set(object.var.menu, "ui.node.parent");
            me.core.property.set(object.var.modal, "ui.style.display", "initial");
            if (typeof info === "string") {
                me.core.property.set(object, info, item);
            } else if (Array.isArray(info)) {
                var window = me.core.property.get(object, "widget.window.active");
                object.var.menu = me.create_menu(window, object, me.ui.rect.absolute_region(item), info);
            }
        }
    };
    me.create_menu = function (window, object, region, values, bottomUp) {
        var menu = me.ui.element({
            "ui.basic.var": "menu",
            "ui.element.component": "widget.menu.popup",
            "ui.style.left": region.left + "px",
            "ui.style.top": region.bottom + "px",
            "ui.basic.window": window,
            "ui.basic.target": object,
            "values":values
        });
        if (bottomUp) {
            me.core.property.set(menu, "ui.class.add", "bottom-up");
        }
        if (object.component === me.id) {
            me.core.property.set(menu.var.modal, "ui.style.display", "none");
        }
        return menu;
    };
};

screens.widget.menu.popup = function WidgetMenuPopup(me) {
    me.properties = {
        "ui.class.class": "widget.menu.vertical",
        "ui.basic.elements": {
            "ui.basic.var": "modal",
            "ui.element.component": "widget.modal"
        }
    };
    me.values = function(object, values) {
        me.core.property.set(object, "ui.group.data", {
            "ui.data.keyList": ["ui.basic.text", "select", "options", "properties"],
            "ui.data.values": values
        });
    }
    me.back = {
        set: function (object, value) {
            me.core.property.set(object.target, "back", value);
            me.core.property.set(object, "ui.node.parent");
        }
    };
    me.select = {
        set: function (object, value) {
            var item = value[0];
            var method = value[1];
            me.core.property.set(object, "back", item);
            me.core.property.set(object.window, method, me.core.property.get(item, "ui.basic.text"));
        }
    };
};

screens.widget.menu.item = function WidgetMenuItem(me) {
    me.properties = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click"
    };
    me.dependencies = {
        parent: ["widget.menu", "widget.menu.popup"],
        properties: ["ui.basic.text"]
    };
    me.handleValue = function (object, values, key, callback) {
        if (key in values) {
            var value = values[key];
            if (typeof value === "string" || typeof value === "function") {
                if (value === "select") {
                    value = object.menu_select;
                }
                value = me.core.property.get(object.parentNode.window, value, me.core.property.get(object, "ui.basic.text"));
            }
            callback(value);
        }
    };
    me.options = {
        set: function (object, options) {
            if (options) {
                me.handleValue(object, options, "enabled", (value) => {
                    me.core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "visible", (value) => {
                    me.core.property.set(object, "ui.style.display", value ? "block" : "none");
                });
                me.handleValue(object, options, "state", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "checked");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "checked");
                    }
                });
                me.handleValue(object, options, "mark", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "mark");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "mark");
                    }
                });
                me.handleValue(object, options, "separator", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "separator");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "separator");
                    }
                });
                me.handleValue(object, options, "header", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "header");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "header");
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
                me.core.property.set(object.parentNode, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            me.core.property.set(object.parentNode, "select", [object, object.menu_select]);
        }
    };
};

screens.widget.menu.list = function WidgetMenuList(me) {
    me.filterMinCount = 15;
    me.properties = {
        "ui.basic.tag": "div",
        "ui.class.class": "widget.menu.vertical",
        "ui.class.add": "list",
        "ui.basic.elements": [
            {
                "ui.basic.tag":"div",
                "ui.basic.var": "headers"
            },
            {
                "ui.basic.tag":"div",
                "ui.class.class":"widget.menu.progress.bar",
                "ui.basic.var":"progress"
            },
            {
                "ui.basic.tag": "div",
                "ui.basic.var": "members"
            }
        ]
    };
    me.work = function(object, state) {
        me.log("menu state: " + state);
        me.core.property.set(object.var.progress, "ui.style.display", state ? "block" : "none");
    };
    me.use = function (object, name) {
        if (!object.lists) {
            object.lists = [];
        }
        var list = object.lists[name];
        if (!list) {
            list = me.ui.element({
                "ui.element.component": "widget.menu.list"
            }, object);
            object.lists[name] = list;
        }
        if (!list.var.filter) {
            if (list.var.members.childNodes.length >= me.filterMinCount) {
                me.ui.element({
                    "ui.element.component":"widget.input",
                    "ui.basic.type": "search",
                    "ui.basic.text": "",
                    "ui.basic.var": "filter",
                    "ui.attribute.placeholder": "Filter",
                    "ui.style.width":"80%",
                    "ui.key.up":"widget.menu.list.filter",
                    "core.event.search":"widget.menu.list.filter"
                }, list.var.headers, list);
            }
        }
        return list.var.members;
    };
    me.filter = function(object) {
        var filterText = me.core.property.get(object, "ui.basic.text");
        var list = me.ui.node.container(object, "widget.menu.list");
        var members = list.var.members;
        var child = members.firstChild;
        while(child) {
            var childText = me.core.property.get(child, "ui.basic.text");
            if(!filterText || childText.toUpperCase().includes(filterText.toUpperCase())) {
                me.ui.mark.widget(child, filterText);
                child.style.display = "";
            }
            else {
                child.style.display = "none";
            }
            child = child.nextSibling;
        }
    };
};

screens.widget.menu.listItem = function WidgetMenuListItem(me) {
    me.properties = {
        "ui.basic.tag": "span",
        "ui.touch.click": "click"
    };
    me.dependencies = {
        parent: ["widget.menu", "widget.menu.popup"],
        properties: ["ui.basic.text", "group"]
    };
    me.container = function (object, parent, properties) {
        return me.widget.menu.list.use(parent, properties["group"]);
    };
    me.promise = function(object, info) {
        if(!info) {
            return;
        }
        var parent = me.ui.node.container(object, me.widget.menu.list.id);
        me.core.property.set(parent, "ui.work.state", true);
        info.promise.then((items) => {
            me.core.property.set(parent, "ui.work.state", false);
            items = info.callback(items);
            me.core.property.set(me.parentMenu(object), "values", items);
        });
    };
    me.handleValue = function (object, values, key, callback) {
        var parentMenu = me.parentMenu(object);
        if (key in values) {
            var value = values[key];
            if (typeof value === "string" || typeof value === "function") {
                if (value === "select") {
                    value = object.menu_select;
                }
                value = me.core.property.get(parentMenu.window, value, me.core.property.get(object, "ui.basic.text"));
            }
            callback(value);
        }
    };
    me.options = {
        set: function (object, options) {
            if (options) {
                me.handleValue(object, options, "enabled", (value) => {
                    me.core.property.set(object, "ui.basic.enabled", value);
                });
                me.handleValue(object, options, "visible", (value) => {
                    me.core.property.set(object, "ui.style.display", value ? "block" : "none");
                });
                me.handleValue(object, options, "state", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "checked");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "checked");
                    }
                });
                me.handleValue(object, options, "mark", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "mark");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "mark");
                    }
                });
                me.handleValue(object, options, "separator", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "separator");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "separator");
                    }
                });
                me.handleValue(object, options, "header", (value) => {
                    if (value) {
                        me.core.property.set(object, "ui.class.add", "header");
                    } else {
                        me.core.property.set(object, "ui.class.remove", "header");
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
    me.parentMenu = function (object) {
        var parent = object.parentNode;
        parent = me.ui.node.container(object, "widget.menu.popup");
        return parent;
    };
    me.hover = {
        set: function (object, value) {
            var parentMenu = me.parentMenu(object);
            if (parentMenu.selected_item !== object && object.menu_select) {
                me.ui.mark.widget(object, null);
                me.core.property.set(parentMenu, "select", [object, object.menu_select]);
            }
        }
    };
    me.click = {
        set: function (object) {
            var parentMenu = me.parentMenu(object);
            me.ui.mark.widget(object, null);
            me.core.property.set(parentMenu, "select", [object, object.menu_select]);
        }
    };
};
