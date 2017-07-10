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
    me.redirect = {
        "ui.basic.text": "text",
        "ui.style.background": "background",
        "ui.basic.elements": "elements"
    };
    me.default = __json__;
    me.create = {
        set: function (object) {
            var parent = me.parent(object);
            if (parent === null) {
                parent = document.body;
                if (!parent.var) {
                    parent.var = {};
                }
            }
            if (!parent.var.tray) {
                me.ui.element.create({
                    "ui.basic.var": "tray",
                    "ui.style.bottom": "0px",
                    "ui.style.position": "absolute"
                }, parent);
            }
            object.var.icon = me.ui.element.create({
                "text": "",
                "ui.style.display":"none",
                "ui.basic.src": "/packages/res/icons/default.png",
                "ui.touch.click": "widget.window.context_menu",
                "ui.touch.dblclick": "widget.window.restore",
                "ui.basic.window": object
            }, parent.var.tray);
        }
    };
    me.beforeshow = {
        set: function (object) {
            var parent = me.parent(object);
            if (parent === null) {
                me.set(object.var.close, "ui.theme.add", "main");
            }
            if(!me.set(object, "ui.theme.contains", "maximize")) {
                me.ui.property.broadcast(object, "ui.theme.add", "restore");
            }
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
    me.elements = {
        set: function (object, value) {
            if (value) {
                var window = me.window(object);
                var content = me.widget.container.content(window.var.container);
                me.ui.element.create(value, content, object.context);
            }
        }
    };
    me.is_root = {
        get: function (object) {
            return me.parent(object) === null;
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
    me.close = {
        get: function(object) {
            return true;
        },
        set: function (object, value) {
            var window = me.window(object);
            if(window.static) {
                me.set(window, "minimize", null);
                return;
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(window, parent_window);
            }
            me.set(window.var.icon, "ui.node.parent", null);
            me.set(window, "ui.node.parent", null);
            if (parent_window) {
                me.ui.property.notify(parent_window, "draw", null);
            }
        }
    };
    me.icon = {
        get: function (object) {
            return me.get(object.var.icon, "ui.basic.src");
        },
        set: function (object, value) {
            me.set(object.var.icon, "ui.basic.src", value);
        }
    };
    me.update_title = function (object) {
        var window = me.window(object);
        var child_window = me.ui.node.last(window, me.id);
        if (child_window) {
            if (!me.set(child_window, "ui.theme.contains", "minimize") && me.set(child_window, "ui.theme.contains", "maximize")) {
                me.set(window.var.label, "ui.basic.text", window.window_title + " - " + child_window.window_title);
                return;
            }
        }
        me.set(window.var.label, "ui.basic.text", window.window_title);
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
            me.set(window.var.icon, "ui.basic.text", value);
        }
    };
    me.background = {
        get: function (object) {
            var window = me.window(object);
            var content = me.widget.container.content(window.var.container);
            return me.get(content, "ui.style.background");
        },
        set: function (object, value) {
            var window = me.window(object);
            console.log("window: " + window.component + " container: " + window.var.container);
            var content = me.widget.container.content(window.var.container);
            me.set(content, "ui.style.background", value);
        }
    };
    me.static = me.ui.property.attributeSet("static");
    me.fixed = me.ui.property.attributeSet("fixed", function(object, value) {
        var maximized = me.set(object, "ui.theme.contains", "maximize");
        me.set(object, "ui.rect.resizable", !value && !maximized);
    });
    me.popup = me.ui.property.attributeSet("popup");
    me.context_menu = {
        set: function (object, value) {
            var window = me.window(object);
            var visible = !me.set(window, "ui.theme.contains", "minimize");
            var region = me.ui.rect.absolute_region(object);
            var menu = me.widget.menu.create_menu(window, object, region, [
                ["Restore", "widget.window.restore", {"enabled":"widget.window.restore"}],
                ["Move", ""],
                ["Size", ""],
                ["Minimize", "widget.window.minimize", {"enabled":"widget.window.minimize"}],
                ["Maximize", "widget.window.maximize", {"enabled":"widget.window.maximize"}],
                ["Close", "widget.window.close", {"separator": true, "enabled":"widget.window.close"}],
                ["Switch To...", null, {"separator": true}]
            ]);
            if (!visible) {
                var parent = me.parent(window);
                if (!parent) {
                    parent = document.body;
                }
                var menu_region = me.ui.rect.absolute_region(menu);
                var icon_region = me.ui.rect.absolute_region(window.var.icon);
                var icon_icon_region = me.ui.rect.absolute_region(window.var.icon.var.icon);
                me.set(menu, "ui.style.left", icon_icon_region.left + "px");
                me.set(menu, "ui.style.top", region.bottom - menu_region.height - icon_region.height + "px");
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
        me.set(window.var.close, "ui.node.parent", window.var.header);
        me.widget.menu.attach(parent_window, window);
        me.set(window.var.minimize, "ui.node.parent", window.var.header);
        me.set(window.var.maximize, "ui.node.parent", window.var.header);
        me.ui.property.broadcast(window, "ui.theme.add", "child");
        me.ui.property.broadcast(parent_window, "ui.theme.add", "parent");
    };
    me.detach = function (window, parent_window) {
        me.ui.property.broadcast(parent_window, "ui.theme.remove", "parent");
        me.ui.property.broadcast(window, "ui.theme.remove", "child");
        me.widget.menu.attach(window, parent_window);
        me.set(window.var.close, "ui.node.parent", window.var.title);
        me.set(window.var.label, "ui.node.parent", window.var.title);
        me.set(window.var.minimize, "ui.node.parent", window.var.title);
        me.set(window.var.maximize, "ui.node.parent", window.var.title);
        me.update_title(parent_window);
    };
    me.minimize = {
        get: function(object) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            return !minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            me.set(window, "ui.focus.active", false);
            me.ui.property.broadcast(window, "ui.theme.add", "minimize");
            me.set(window.var.icon, "ui.style.display", "block");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(window, parent_window);
            }
            me.ui.property.notify(window, "draw", null);
        }
    };
    me.maximize = {
        get: function(object) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            return !window.fixed && !maximized && !minimized;
        },
        set: function (object, value) {
            var parent_region = null;
            var window = me.window(object);
            me.set(window, "ui.focus.active", true);
            me.ui.property.broadcast(window, "ui.theme.remove", "minimize");
            me.ui.property.broadcast(window, "ui.theme.remove", "restore");
            me.ui.property.broadcast(window, "ui.theme.add", "maximize");
            me.set(window.var.icon, "ui.style.display", "none");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.attach(window, parent_window);
                var container = parent_window.var.container;
                var content = me.widget.container.content(container);
                parent_region = me.ui.rect.absolute_region(content);
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
    me.show = {
        set: function(object, value) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            if(value && minimized) {
                me.set(window, "restore", null);
            }
            else if(!value && !minimized) {
                me.set(window, "minimize", null);
            }
        }
    };
    me.restore = {
        get: function(object) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            return maximized || minimized;
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
                me.set(window, "ui.rect.resizable", !window.fixed);
            } else {
                me.ui.property.broadcast(window, "ui.theme.remove", "minimize");
                if (me.set(window, "ui.theme.contains", "maximize") && parent_window) {
                    me.attach(window, parent_window);
                }
            }
            me.set(window.var.icon, "ui.style.display", "none");
            me.set(window, "ui.focus.active", true);
            me.ui.property.notify(window, "draw", null);
        }
    };
    me.toggle = {
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
