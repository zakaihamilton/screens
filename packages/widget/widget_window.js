/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.require("widget.window", "browser");

package.widget.window = function WidgetWindow(me) {
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
    me.init = function () {
        me.popup = me.ui.property.themedPropertySet("popup");
        me.temp = me.ui.property.themedPropertySet("temp");
        me.static = me.ui.property.themedPropertySet("static");
        me.fixed = me.ui.property.themedPropertySet("fixed", function (object, name, value) {
            var maximized = me.get(object, "ui.theme.contains", "maximize");
            me.set(object, "ui.resize.enabled", !value && !maximized);
        });
    };
    me.storeRegion = function (object) {
        var window = me.window(object);
        var parent_window = me.parent(window);
        var content = null;
        if (parent_window) {
            content = me.get(parent_window, "widget.window.content");
        } else {
            content = me.ui.element.desktop();
        }
        window.restore_region = me.ui.rect.relative_region(window, content);
    };
    me.mainClass = {
        get: function (object) {
            var window = me.window(object);
            var parent = me.parent(window);
            if (parent === null) {
                return "main";
            } else {
                return null;
            }
        }
    };
    me.visible = {
        get: function (object) {
            var window = me.window(object);
            var hasParent = me.get(window, "ui.node.parent");
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            return !minimized && hasParent;
        }
    };
    me.parent = function (object) {
        if (!object) {
            return null;
        }
        var parent = object.parentNode;
        while (parent) {
            if (parent === me.ui.element.desktop()) {
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
    me.content = {
        get: function (object) {
            var window = me.window(object);
            var content = me.widget.container.content(window.var.container);
            return content;
        }
    };
    me.windows = {
        get: function (object) {
            var content = me.ui.element.desktop();
            if (object !== me.ui.element.desktop()) {
                content = me.get(object, "widget.window.content");
            }
            return me.ui.node.members(content, me.id);
        }
    };
    me.elements = {
        get: function (object) {
            var content = me.get(object, "widget.window.content");
            return me.ui.node.childList(content);
        },
        set: function (object, value) {
            if (value) {
                var content = me.get(object, "widget.window.content");
                me.ui.element.create(value, content, object.context);
            }
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
        get: function (object) {
            return true;
        },
        set: function (object, value) {
            var window = me.window(object);
            if (me.get(window, "static")) {
                me.set(window, "minimize");
                return;
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(parent_window);
            }
            me.set(window.var.icon, "ui.node.parent");
            me.set(window, "ui.node.parent");
            if (parent_window) {
                me.set(parent_window, "ui.property.group", {
                    "widget.window.refocus": null
                });
                me.set(parent_window, "update");
            } else {
                me.set(me.ui.element.desktop(), "widget.window.refocus");
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
        var title = window.window_title;
        if (window.child_window) {
            title += " - [" + window.child_window.window_title + "]";
        }
        me.set(window.var.label, "ui.basic.text", title);
    };
    me.label = {
        get: function (object) {
            var window = me.window(object);
            return me.get(window.var.label, "ui.basic.text");
        }
    };
    me.key = {
        get: function (object) {
            var window = me.window(object);
            if (!window.window_key) {
                return me.get(window, "title");
            }
            return window.window_key;
        },
        set: function (object, value) {
            var window = me.window(object);
            window.window_key = value;
        }
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
            var content = me.get(object, "widget.window.content");
            return me.get(content, "ui.style.background");
        },
        set: function (object, value) {
            var content = me.get(object, "widget.window.content");
            me.set(content, "ui.style.background", value);
        }
    };
    me.switch = function (parent, child) {
        me.update_title(parent);
        me.widget.menu.switch(parent, child);
        me.set(child, "ui.property.trickle", {
            "ui.theme.toggle": "child"
        });
        me.set(parent, "ui.property.trickle", {
            "ui.theme.toggle": "parent"
        });
    };
    me.attach = function (window, parent_window) {
        if (parent_window.child_window) {
            me.set(parent_window.child_window, "unmaximize");
            me.set(window, "ui.focus.active", true);
        }
        parent_window.child_window = window;
        me.switch(parent_window, window);
        me.set([
            window.var.close,
            window.var.menu,
            window.var.minimize,
            window.var.maximize
        ], "ui.node.parent", window.var.header);
    };
    me.detach = function (parent_window) {
        if (parent_window && parent_window.child_window) {
            var window = parent_window.child_window;
            parent_window.child_window = null;
            me.set(window.var.menu, "ui.node.parent", parent_window.var.header);
            me.switch(parent_window, window);
            me.set([
                window.var.close,
                window.var.label,
                window.var.minimize,
                window.var.maximize
            ], "ui.node.parent", window.var.title);
        }
    };
    me.minimize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            return !minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            if (minimized) {
                return;
            }
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            if (!maximized) {
                me.storeRegion(window);
            }
            me.set(window, "ui.property.group", {
                "ui.theme.add": "minimize",
                "ui.focus.active": false
            });
            me.set(window.var.icon, "ui.style.display", "block");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(parent_window);
                me.set(parent_window, "widget.window.refocus");
            } else {
                me.set(me.ui.element.desktop(), "widget.window.refocus");
            }
            me.set(window, "ui.property.bubble", {
                "update": null
            });
            me.set(window, "update");
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            return !me.get(window, "fixed") && !maximized && !minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var wasMinimized = me.get(window, "ui.theme.contains", "minimize");
            var wasMaximized = me.get(window, "ui.theme.contains", "maximize");
            if (wasMaximized && !wasMinimized) {
                return;
            }
            if (me.get(window, "fixed")) {
                return;
            }
            me.set(window, "ui.property.group", {
                "ui.theme.remove": "minimize",
                "ui.focus.active": true,
                "ui.property.trickle": {
                    "ui.theme.remove": "restore",
                    "ui.theme.add": "maximize"
                }
            });
            me.set(window.var.icon, "ui.style.display", "none");
            var parent_window = me.parent(window);
            if (parent_window) {
                me.attach(window, parent_window);
            }
            if (!wasMaximized) {
                me.storeRegion(window);
                me.set(window, "ui.property.group", {
                    "ui.style.left": "0px",
                    "ui.style.top": "0px",
                    "ui.style.width": "",
                    "ui.style.height": "",
                    "ui.style.bottom": "0px",
                    "ui.style.right": "0px",
                    "ui.move.enabled": false,
                    "ui.resize.enabled": false
                });
            }
            me.set(window, "update");
            me.set(parent_window, "update");
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            if (value) {
                if (parent_window && parent_window.child_window && parent_window.child_window !== window) {
                    me.set(window, "maximize");
                } else if (minimized) {
                    me.set(window, "unmaximize");
                } else {
                    me.set(window, "ui.focus.active", true);
                }
            } else if (!minimized) {
                me.set(window, "minimize");
            }
        }
    };
    me.restore = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            if (!minimized && !maximized) {
                return;
            }
            if (minimized) {
                if (maximized) {
                    me.set(window, "maximize");
                } else {
                    me.set(window.var.icon, "ui.style.display", "none");
                    me.set(window, "ui.property.group", {
                        "ui.theme.remove": "minimize",
                        "ui.focus.active": true
                    });
                    var parent_window = me.parent(window);
                    var content = null;
                    if (parent_window) {
                        content = me.get(parent_window, "widget.window.content");
                    } else {
                        content = me.ui.element.desktop();
                    }
                    me.ui.rect.set_relative_region(window, window.restore_region, content);
                    me.set(window, "update");
                    me.set(parent_window, "update");
                }
            } else {
                me.set(window, "unmaximize");
            }
        }
    };
    me.unmaximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            if (!maximized && !minimized) {
                return;
            }
            if (minimized) {
                me.set(window, "ui.property.trickle", {
                    "ui.theme.remove": "minimize"
                });
                me.set(window.var.icon, "ui.style.display", "none");
            }
            if (maximized) {
                var content = null;
                if (parent_window) {
                    me.detach(parent_window);
                    content = me.get(parent_window, "widget.window.content");
                } else {
                    content = me.ui.element.desktop();
                }
                me.ui.rect.set_relative_region(window, window.restore_region, content);
                me.set(window, "ui.property.group", {
                    "ui.property.trickle": {
                        "ui.theme.remove": "maximize",
                        "ui.theme.add": "restore"
                    },
                    "ui.move.enabled": true,
                    "ui.resize.enabled": !me.get(window, "fixed")
                });
            }
            me.set(window, "ui.property.group", {
                "ui.focus.active": true
            });
            me.set(window, "update");
            me.set(parent_window, "update");
        }
    };
    me.toggle = {
        set: function (object, value) {
            var window = me.window(object);
            if (me.get(window, "ui.theme.contains", "maximize")) {
                me.set(window, "widget.window.unmaximize");
            } else {
                me.set(window, "widget.window.maximize");
            }
        }
    };
    me.blur = {
        set: function (object) {
            var window = me.window(object);
            if (me.get(window, "temp") && window.parentNode) {
                me.set(window, "close");
            }
        }
    };
    me.region = {
        get: function (object) {
            var window = me.window(object);
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            if (maximized || minimized) {
                return window.restore_region;
            } else {
                var parent_window = me.parent(window);
                var content = null;
                if (parent_window) {
                    content = me.get(parent_window, "widget.window.content");
                } else {
                    content = me.ui.element.desktop();
                }
                return me.ui.rect.relative_region(window, content);
            }
        },
        set: function (object, value) {
            var window = me.window(object);
            var maximized = me.get(window, "ui.theme.contains", "maximize");
            var minimized = me.get(window, "ui.theme.contains", "minimize");
            var parent_window = me.parent(window);
            var content = null;
            if (parent_window) {
                content = me.get(parent_window, "widget.window.content");
            } else {
                content = me.ui.element.desktop();
            }
            if (!maximized && !minimized) {
                me.ui.rect.set_relative_region(window, value, content);
            }
            window.restore_region = value;
        }
    };
    me.store = {
        get: function (object) {
            var options = {
                "region": me.get(object, "region")
            };
            var keys = ["maximize", "restore", "minimize"];
            keys.map(function (key) {
                var enabled = me.get(object, "ui.theme.contains", key);
                if (enabled) {
                    options[key] = null;
                }
            });
            return JSON.stringify(options);
        },
        set: function (object, value) {
            var options = JSON.parse(value);
            for (var optionKey in options) {
                var optionValue = options[optionKey];
                me.set(object, optionKey, optionValue);
            }
        }
    };
    me.update = {
        set: function (object) {
            var window = me.window(object);
            me.set(window.var.container, "update");
            me.set(window, "storage.cache.store", me.get(window, "store"));
        }
    };
    me.visibleWindows = {
        get: function (object, value) {
            var content = me.ui.element.desktop();
            if (object !== me.ui.element.desktop()) {
                content = me.get(object, "widget.window.content");
            }
            var members = me.ui.node.members(content, me.id);
            members = members.filter(function (member) {
                return !me.get(member, "ui.theme.contains", "minimize");
            });
            return members;
        }
    };
    me.active = {
        get: function (object) {
            var windows = me.get(object, "widget.window.visibleWindows");
            if (windows && windows.length) {
                var last = windows[windows.length - 1];
                if (last) {
                    return last;
                }
            }
            var window = me.window(object);
            return window;
        }
    };
    me.refocus = {
        set: function (object, value) {
            var windows = me.get(object, "widget.window.visibleWindows");
            if (windows && windows.length) {
                var last = windows[windows.length - 1];
                if (last) {
                    me.set(last, "ui.focus.active", true);
                }
            }
        }
    };
    me.childMenuList = {
        get: function (object) {
            var isFirst = true;
            var window = me.window(object);
            var parent = me.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.get(window, "widget.window.windows");
            windows.sort(function (a, b) {
                var a_title = me.get(a, "title");
                var b_title = me.get(b, "title");
                return a_title === b_title ? 0 : +(a_title > b_title) || -1;
            });
            var items = windows.map(function (child) {
                var result = [
                    me.get(child, "title"),
                    function () {
                        me.set(child, "widget.window.show", true);
                    },
                    {
                        "state": function () {
                            return me.get(child, "ui.focus.active");
                        },
                        "separator": isFirst
                    }
                ];
                isFirst = false;
                return result;
            });
            return items;
        }
    };
    me.cascade = {
        set: function (object) {

        }
    };
    me.clientRegion = {
        get: function(object) {
            var window = me.window(object);
            var content = me.get(window, "widget.window.content");
            var region = me.ui.rect.relative_region(content);
            return region;
        }
    };
    me.alignToLeft = {
        set: function (object) {
            var window = me.window(object);
            me.set(window, "unmaximize");
            var parent = me.parent(window);
            var content = null;
            if (parent) {
                content = me.get(parent, "widget.window.content");
            }
            else {
                content = me.ui.element.desktop();
            }
            var parent_region = me.ui.rect.relative_region(content);
            parent_region.width /= 2;
            parent_region.width -= 2;
            parent_region.height -= 2;
            me.ui.rect.set_relative_region(window, parent_region, content);
            me.set(window, "update");
            me.set(parent, "update");
        }
    };
    me.alignToRight = {
        set: function (object) {
            var window = me.window(object);
            me.set(window, "unmaximize");
            var parent = me.parent(window);
            var content = null;
            if (parent) {
                content = me.get(parent, "widget.window.content");
            }
            else {
                content = me.ui.element.desktop();
            }
            var parent_region = me.ui.rect.relative_region(content);
            parent_region.width /= 2;
            parent_region.left += parent_region.width;
            parent_region.width -= 2;
            parent_region.height -= 2;
            me.ui.rect.set_relative_region(window, parent_region, content);
            me.set(window, "update");
            me.set(parent, "update");
        }
    };
    me.sideBySide = {
        set: function (object) {
            var window = me.window(object);
            var parent = me.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.get(window, "widget.window.visibleWindows");
            if (windows && windows.length > 1) {
                var left = windows[windows.length - 1];
                var right = windows[windows.length - 2];
                me.set(left, "alignToLeft");
                me.set(right, "alignToRight");
            }
        }
    };
    me.arrangeIcons = {
        set: function (object) {

        }
    };
};
