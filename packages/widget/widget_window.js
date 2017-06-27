/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.widget.window = function WidgetWindow(me) {
    me.require = {platform: "browser"};
    me.depends = {
        properties: ["title"]
    };
    me.extend = ["ui.focus"];
    me.default = {
        "ui.basic.tag": "div",
        "ui.style.width": "150px",
        "ui.style.height": "150px",
        "ui.style.position": "absolute",
        "ui.style.left": "100px",
        "ui.style.top": "100px",
        "ui.rect.movable": true,
        "ui.rect.resizable": true
    };
    me.class = ["widget.window.border"];
    me.create = {
        set: function (object) {
            me.ui.element.create([{
                    "ui.theme.class": "widget.window.bottom-left",
                    "ui.rect.resize": object
                },
                {
                    "ui.theme.class": "widget.window.bottom-right",
                    "ui.rect.resize": object
                },
                {
                    "ui.theme.class": "widget.window.top-left",
                    "ui.rect.resize": object
                },
                {
                    "ui.theme.class": "widget.window.top-right",
                    "ui.rect.resize": object
                },
                {
                    "ui.theme.class": "widget.window.margin",
                    "ui.basic.elements": [
                        {
                            "ui.theme.class": "widget.window.content",
                            "ui.basic.var": "content"
                        },
                        {
                            "ui.theme.class": "widget.window.title",
                            "ui.basic.var": "title_back"
                        },
                        {
                            "ui.theme.class": "widget.window.header",
                            "ui.basic.var": "header"
                        },
                        {
                            "ui.element.component": "widget.scrollbar.horizontal"
                        },
                        {
                            "ui.element.component": "widget.scrollbar.vertical"
                        },
                        {
                            "ui.basic.var": "close",
                            "ui.theme.class": "widget.window.close",
                            "ui.event.click": "widget.window.context_menu",
                            "ui.event.dblclick": "widget.window.close",
                        },
                        {
                            "ui.basic.var": "title_label",
                            "ui.basic.text": "",
                            "ui.theme.class": "widget.window.label",
                            "ui.rect.move": object,
                            "ui.event.dblclick": "widget.window.toggle"
                        },
                        {
                            "ui.basic.var": "minimize",
                            "ui.theme.class": "widget.window.action",
                            "ui.event.click": "widget.window.minimize",
                            "ui.style.right": "19px",
                            "ui.basic.elements": {
                                "ui.theme.class": "widget.window.minimize"
                            }
                        },
                        {
                            "ui.basic.var": "maximize",
                            "ui.theme.class": "widget.window.action",
                            "ui.event.click": "widget.window.toggle",
                            "ui.style.right": "0px",
                            "ui.basic.elements": {
                                "ui.theme.class": "widget.window.maximize"
                            }
                        }
                    ]
                }
            ], object);
            var parent = me.parent(object);
            if (parent === null) {
                me.set(object.close, "ui.theme.add", "main");
                parent = document.body;
            }
            if (!parent.tray) {
                me.ui.element.create({
                    "ui.basic.var": "tray",
                    "ui.style.bottom": "0px",
                    "ui.style.position": "absolute"
                }, parent);
            }
            object.icon = me.ui.element.create({
                "text": "",
                "ui.style.float": "left",
                "ui.basic.src": "/packages/res/icons/default.png",
                "ui.event.click": "widget.window.context_menu",
                "ui.event.dblclick": "widget.window.restore",
                "ui.style.display": "none",
                "ui.basic.window": object
            }, parent.tray);
            me.ui.property.broadcast(object, "ui.theme.add", "restore");
        }
    };
    me.parent = function (object) {
        var parent = object.parentNode;
        while (parent) {
            if (parent === document.body) {
                return null;
            }
            if (parent.window) {
                return parent.window;
            }
            if (parent.component === me.id) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    };
    me.window = function (object) {
        var window = object;
        if (window) {
            if (window.window) {
                window = window.window;
            }
            if (window.component !== me.id) {
                window = me.parent(window);
            }
        }
        return window;
    };
    me.is_root = {
        get: function (object) {
            return me.parent(object) === null;
        }
    };
    me.close = {
        get: function (object) {
            var window = me.window(object);
            var enabled = me.is_visible(window.close) && !me.set(window, "ui.theme.contains", "minimize");
            var options = {"enabled": enabled, "separator": true};
            return options;
        },
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(window, parent_window);
            }
            me.set(window.icon, "ui.node.parent", null);
            me.set(window, "ui.node.parent", null);
            if (parent_window) {
                me.ui.property.notify(parent_window, "draw", null);
            }
        }
    };
    me.icon = {
        get: function (object) {
            return me.get(object.icon, "ui.basic.src");
        },
        set: function (object, value) {
            me.set(object.icon, "ui.basic.src", value);
        }
    };
    me.update_title = function (object) {
        var window = me.window(object);
        var child_window = me.ui.node.last(window, me.id);
        if (child_window) {
            if (!me.set(child_window, "ui.theme.contains", "minimize") && me.set(child_window, "ui.theme.contains", "maximize")) {
                me.set(window.title_label, "ui.basic.text", window.window_title + " - " + child_window.window_title);
                return;
            }
        }
        me.set(window.title_label, "ui.basic.text", window.window_title);
    };
    me.title = {
        get: function (object) {
            var window = me.window(object);
            return window.window_title;
        },
        set: function (object, value) {
            var window = me.window(object);
            window.window_title = value;
            me.update_title(window);
            var parent_window = me.parent(window);
            if (parent_window) {
                me.update_title(parent_window);
            }
            me.set(window.icon, "ui.basic.text", value);
        }
    };
    me.background = {
        get: function (object) {
            var window = me.window(object);
            return me.get(window.content, "ui.style.background");
        },
        set: function (object, value) {
            var window = me.window(object);
            me.set(window.content, "ui.style.background", value);
        }
    };
    me.context_menu = {
        set: function (object, value) {
            var window = me.window(object);
            var visible = !me.set(window, "ui.theme.contains", "minimize");
            var region = me.ui.rect.relative_region(object);
            var menu = me.widget.menu.create_menu(window, object, region, [
                ["Restore", "widget.window.restore"],
                ["Move", ""],
                ["Size", ""],
                ["Minimize", "widget.window.minimize"],
                ["Maximize", "widget.window.maximize"],
                ["Close", "widget.window.close"],
                ["Switch To", undefined, {"separator": true}]
            ], object.parentNode);
            if (!visible) {
                var body_region = me.ui.rect.viewport();
                var icon_region = me.ui.rect.absolute_region(window.icon);
                var icon_icon_region = me.ui.rect.absolute_region(window.icon.icon);
                me.set(menu, "ui.style.left", icon_icon_region.left + "px");
                me.set(menu, "ui.style.top", "");
                me.set(menu, "ui.style.bottom", body_region.bottom - icon_region.top + "px");
            }
        }
    };
    me.is_visible = function (object) {
        if (object) {
            var is_visible = me.get(object, "ui.style.display");
            return is_visible !== "none";
        }
    };
    me.attach = function (window, parent_window) {
        me.update_title(parent_window);
        me.widget.menu.attach(parent_window, window);
        me.ui.property.broadcast(window, "ui.theme.add", "child");
        me.ui.property.broadcast(parent_window, "ui.theme.add", "parent");
    };
    me.detach = function (window, parent_window) {
        me.ui.property.broadcast(parent_window, "ui.theme.remove", "parent");
        me.ui.property.broadcast(window, "ui.theme.remove", "child");
        me.widget.menu.attach(window, parent_window);
        me.update_title(parent_window);
    };
    me.minimize = {
        get: function (object) {
            var window = me.window(object);
            var enabled = !me.set(window, "ui.theme.contains", "minimize");
            var options = {"enabled": enabled};
            return options;
        },
        set: function (object, value) {
            var window = me.window(object);
            me.ui.property.broadcast(window, "ui.theme.add", "minimize");
            me.set(window.icon, "ui.style.display", "block");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(window, parent_window);
            }
            me.ui.property.notify(window, "draw", null);
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.window(object);
            var enabled = !me.set(window, "ui.theme.contains", "maximize") && !me.set(window, "ui.theme.contains", "minimize");
            var options = {"enabled": enabled};
            return options;
        },
        set: function (object, value) {
            var parent_region = null;
            var window = me.window(object);
            me.set(window, "ui.focus.active", true);
            me.ui.property.broadcast(window, "ui.theme.remove", "minimize");
            me.ui.property.broadcast(window, "ui.theme.remove", "restore");
            me.ui.property.broadcast(window, "ui.theme.add", "maximize");
            me.set(window.icon, "ui.style.display", "none");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.attach(window, parent_window);
                parent_region = me.ui.rect.absolute_region(parent_window.content);
            } else {
                parent_window = document.body;
                parent_region = me.ui.rect.absolute_region(parent_window);
            }
            window.restore_region = me.ui.rect.relative_region(window, parent_window);
            me.ui.rect.set_absolute_region(window, parent_region);
            window.style.width = "";
            window.style.height = "";
            window.style.bottom = "0px";
            window.style.right = "0px";
            me.set(window, "ui.rect.movable", false);
            me.set(window, "ui.rect.resizable", false);
            me.ui.property.notify(window, "draw", null);
        }
    };
    me.restore = {
        get: function (object) {
            var window = me.window(object);
            var enabled = me.set(window, "ui.theme.contains", "maximize") || me.set(window, "ui.theme.contains", "minimize");
            var options = {"enabled": enabled};
            return options;
        },
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            if (!me.set(window, "ui.theme.contains", "minimize")) {
                me.ui.property.broadcast(window, "ui.theme.remove", "maximize");
                me.ui.property.broadcast(window, "ui.theme.add", "restore");
                if (parent_window) {
                    me.detach(window, parent_window);
                }
                me.ui.rect.set_relative_region(window, window.restore_region, parent_window);
                me.set(window, "ui.rect.movable", true);
                me.set(window, "ui.rect.resizable", true);
            } else {
                me.ui.property.broadcast(window, "ui.theme.remove", "minimize");
                if (me.set(window, "ui.theme.contains", "maximize") && parent_window) {
                    me.attach(window, parent_window);
                }
            }
            me.set(window.icon, "ui.style.display", "none");
            me.set(window, "ui.focus.active", true);
            me.ui.property.notify(window, "draw", null);
        }
    };
    me.toggle = {
        get: function (object) {
            return true;
        },
        set: function (object, value) {
            var window = me.window(object);
            if (me.set(window, "ui.theme.contains", "maximize")) {
                me.set(window, "widget.window.restore");
            } else {
                me.set(window, "widget.window.maximize");
            }
        }
    };
};
