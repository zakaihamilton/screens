/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.require("widget.window", "browser");

package.widget.window = function WidgetWindow(me) {
    me["ui.element.depends"] = {
        properties: ["title"]
    };
    me.extend = ["ui.focus"];
    me["core.property.redirect"] = {
        "ui.basic.text": "text",
        "ui.style.background": "background",
        "ui.basic.elements": "elements"
    };
    me["ui.element.default"] = __json__;
    me.init = function () {
        me.popup = me.package.ui.property.themedPropertySet("popup");
        me.embed = me.package.ui.property.themedPropertySet("embed", function(object, value) {
            var maximized = me.package.core.property.get(object, "ui.class.contains", "maximize");
            me.package.core.property.set(object, "ui.move.enabled", !value && !maximized);
            me.package.core.property.set(object, "ui.style.position", value ? "relative" : "absolute");
            if(!value) {
                me.package.core.property.set(object, "ui.arrange.center");
            }
        });
        me.temp = me.package.ui.property.themedPropertySet("temp");
        me.static = me.package.ui.property.themedPropertySet("static");
        me.fixed = me.package.ui.property.themedPropertySet("fixed", function (object, value) {
            var maximized = me.package.core.property.get(object, "ui.class.contains", "maximize");
            me.package.core.property.set(object, "ui.resize.enabled", !value && !maximized);
        });
    };
    me.draw = {
        set: function(object) {
            var isEmbed = me.package.core.property.get(object, "embed");
            if(!isEmbed) {
                me.package.core.property.set(object, "ui.focus.active", true);
            }
        }
    };
    me.storeRegion = function (object) {
        var window = me.window(object);
        var parent_window = me.parent(window);
        var content = null;
        if (parent_window) {
            content = me.package.core.property.get(parent_window, "widget.window.content");
        } else {
            content = me.package.ui.element.workspace();
        }
        window.restore_region = me.package.ui.rect.relative_region(window, content);
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
            var hasParent = me.package.core.property.get(window, "ui.node.parent");
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            return !minimized && hasParent;
        }
    };
    me.parent = function (object) {
        if (!object) {
            return null;
        }
        var parent = object.parentNode;
        while (parent) {
            if (parent === me.package.ui.element.workspace()) {
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
    me.mainWindow = function(object) {
        var window = me.window(object);
        for(;;) {
            var isPopup = me.package.core.property.get(window, "popup");
            var isEmbed = me.package.core.property.get(window, "embed");
            if(!isPopup && !isEmbed) {
                break;
            }
            window = me.parent(window);
        }
        return window;
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
            var content = me.package.widget.container.content(window.var.container);
            return content;
        }
    };
    me.windows = {
        get: function (object) {
            var content = me.package.ui.element.workspace();
            if (object !== me.package.ui.element.workspace()) {
                content = me.package.core.property.get(object, "widget.window.content");
            }
            return me.package.ui.node.members(content, me.id);
        }
    };
    me.elements = {
        get: function (object) {
            var content = me.package.core.property.get(object, "widget.window.content");
            return me.package.ui.node.childList(content);
        },
        set: function (object, value) {
            if (value) {
                var content = me.package.core.property.get(object, "widget.window.content");
                me.package.ui.element.create(value, content, object.context);
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
            if (me.package.core.property.get(window, "static")) {
                me.package.core.property.set(window, "minimize");
                return;
            }
            if (me.package.core.property.get(window, "embed")) {
                me.package.core.property.set(window, "restore");
                return;
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detach(parent_window);
            }
            me.package.core.property.set(window.var.icon, "ui.node.parent");
            me.package.core.property.set(window, "ui.node.parent");
            if (parent_window) {
                me.package.core.property.set(parent_window, "ui.property.group", {
                    "widget.window.refocus": null
                });
                me.package.core.property.notify(parent_window, "update");
            } else {
                me.package.core.property.set(me.package.ui.element.workspace(), "widget.window.refocus");
            }
        }
    };
    me.icon = {
        get: function (object) {
            return me.package.core.property.get(object.var.icon, "ui.basic.src");
        },
        set: function (object, value) {
            me.package.core.property.set(object.var.icon, "ui.basic.src", value);
        }
    };
    me.update_title = function (object) {
        var window = me.window(object);
        var title = window.window_title;
        if (window.child_window) {
            title += " - [" + window.child_window.window_title + "]";
        }
        me.package.core.property.set(window.var.label, "ui.basic.text", title);
    };
    me.label = {
        get: function (object) {
            var window = me.window(object);
            return me.package.core.property.get(window.var.label, "ui.basic.text");
        }
    };
    me.key = {
        get: function (object) {
            var window = me.window(object);
            if (!window.window_key) {
                return me.package.core.property.get(window, "title");
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
            me.package.core.property.set(window.var.icon, "ui.basic.text", value);
        }
    };
    me.background = {
        get: function (object) {
            var content = me.package.core.property.get(object, "widget.window.content");
            return me.package.core.property.get(content, "ui.style.background");
        },
        set: function (object, value) {
            var content = me.package.core.property.get(object, "widget.window.content");
            me.package.core.property.set(content, "ui.style.background", value);
        }
    };
    me.switch = function (parent, child) {
        me.update_title(parent);
        me.package.widget.menu.switch(parent, child);
        me.package.core.property.set(child, "ui.property.broadcast", {
            "ui.class.toggle": "child"
        });
        me.package.core.property.set(parent, "ui.property.broadcast", {
            "ui.class.toggle": "parent"
        });
    };
    me.siblings = {
        set: function(object, properties) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var content = me.package.ui.element.workspace();
            if(parent_window) {
                content = me.package.core.property.get(parent_window, "widget.window.content");
            }
            var members = me.package.ui.node.members(content, me.id);
            members.map(function(member) {
                if(member === window) {
                    return;
                }
                for (var key in properties) {
                    me.package.core.property.set(member, key, properties[key]);
                }
            });
        }
    };
    me.attach = function (window, parent_window) {
        if (parent_window.child_window) {
            me.package.core.property.set(parent_window.child_window, "unmaximize");
        }
        me.package.core.property.set(window, "siblings", {
            "conceal":true
        });
        parent_window.child_window = window;
        me.switch(parent_window, window);
        me.package.core.property.set([
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
            me.package.core.property.set(window.var.menu, "ui.node.parent", parent_window.var.header);
            me.switch(parent_window, window);
            me.package.core.property.set(window, "siblings", {
                "conceal":false
            });
            me.package.core.property.set([
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
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var embed = me.package.core.property.get(window, "ui.class.contains", "embed");
            return !minimized && !embed;
        },
        set: function (object, value) {
            var window = me.window(object);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            if (minimized) {
                return;
            }
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            if (!maximized) {
                me.storeRegion(window);
            }
            me.package.core.property.set(window, "ui.property.group", {
                "ui.class.add": "minimize",
                "ui.focus.active": false
            });
            if(!me.package.core.property.get(window, "popup")) {
                me.package.core.property.set(window.var.icon, "ui.class.add", "minimize");
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                if(maximized) {
                    me.detach(parent_window);
                }
                me.package.core.property.set(parent_window, "widget.window.refocus");
            } else {
                me.package.core.property.set(me.package.ui.element.workspace(), "widget.window.refocus");
            }
            me.package.core.property.notify(parent_window, "update");
            me.package.core.property.notify(window, "update");
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.package.core.property.get(window, "ui.class.contains", "embed");
            return !me.package.core.property.get(window, "fixed") && !me.package.core.property.get(window, "popup") && !maximized && !minimized && !embed;
        },
        set: function (object, value) {
            var window = me.window(object);
            var wasMinimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var wasMaximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            if (wasMaximized && !wasMinimized) {
                return;
            }
            if (me.package.core.property.get(window, "fixed") || me.package.core.property.get(window, "popup")) {
                return;
            }
            if(me.package.core.property.get(window, "embed")) {
                me.package.core.property.set(window, "restore");
                return;
            }
            me.package.core.property.set(window, "ui.property.group", {
                "ui.class.remove": "minimize",
                "ui.focus.active": true,
                "ui.property.broadcast": {
                    "ui.class.remove": "restore",
                    "ui.class.add": "maximize"
                }
            });
            if(!me.package.core.property.get(window, "popup")) {
                me.package.core.property.set(window.var.icon, "ui.class.remove", "minimize");
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.attach(window, parent_window);
            }
            if (!wasMaximized) {
                me.storeRegion(window);
                me.package.core.property.set(window, "ui.property.group", {
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
            me.package.core.property.notify(window, "update");
            me.package.core.property.notify(parent_window, "update");
            me.package.core.property.notify(window.child_window, "update");
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            if (value) {
                if (parent_window && parent_window.child_window && parent_window.child_window !== window) {
                    me.package.core.property.set(window, "maximize");
                } else if (minimized) {
                    me.package.core.property.set(window, "restore");
                } else if(!me.package.core.property.get(window, "embed")) {
                    me.package.core.property.set(window, "ui.focus.active", true);
                }
                var region = me.package.ui.rect.absolute_region(window);
                if(region.left < 0) {
                    me.package.core.property.set(window, "ui.style.left", "0px");
                }
                if(region.top < 0) {
                    me.package.core.property.set(window, "ui.style.top", "0px");
                }
                if(region.left < 0 || region.top < 0) {
                    me.package.core.property.notify(window, "update");
                }
            } else if (!minimized) {
                me.package.core.property.set(window, "minimize");
            }
        }
    };
    me.restore = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.package.core.property.get(window, "ui.class.contains", "embed");
            return maximized || minimized || embed;
        },
        set: function (object, value) {
            var window = me.window(object);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.package.core.property.get(window, "ui.class.contains", "embed");
            if (!minimized && !maximized && !embed) {
                return;
            }
            if(embed) {
                var parent_window = me.parent(window);
                if(parent_window) {
                    parent_window.focus_window = null;
                }
                me.package.core.property.set(window, "ui.property.group", {
                    "ui.node.parent":me.package.ui.element.workspace(),
                    "widget.window.embed":false,
                    "ui.focus.active": true
                });
                me.package.core.property.set(window.var.icon, "ui.node.parent", "@widget.tray.tray");
                me.package.core.property.set(window.var.icon, "widget.icon.type", "@widget.tray.type(widget.tray.tray,)");
                me.package.core.property.notify(window, "update");
            }
            else if (minimized) {
                if (maximized) {
                    me.package.core.property.set(window, "maximize");
                } else {
                    if(!me.package.core.property.get(window, "popup")) {
                        me.package.core.property.set(window.var.icon, "ui.class.remove", "minimize");
                    }
                    me.package.core.property.set(window, "ui.property.group", {
                        "ui.class.remove": "minimize",
                        "ui.focus.active": true
                    });
                    var parent_window = me.parent(window);
                    var content = null;
                    if (parent_window) {
                        content = me.package.core.property.get(parent_window, "widget.window.content");
                    } else {
                        content = me.package.ui.element.workspace();
                    }
                    me.package.ui.rect.set_relative_region(window, window.restore_region, content);
                    me.package.core.property.notify(window, "update");
                    me.package.core.property.notify(parent_window, "update");
                }
            } else {
                me.package.core.property.set(window, "unmaximize");
            }
        }
    };
    me.unmaximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            if (!maximized && !minimized) {
                return;
            }
            if (minimized) {
                me.package.core.property.set(window, "ui.property.broadcast", {
                    "ui.class.remove": "minimize",
                    "ui.focus.active": true
                });
                if(!me.package.core.property.get(window, "popup")) {
                    me.package.core.property.set(window.var.icon, "ui.class.remove", "minimize");
                }
            }
            if (maximized) {
                var content = null;
                if (parent_window) {
                    me.detach(parent_window);
                    content = me.package.core.property.get(parent_window, "widget.window.content");
                } else {
                    content = me.package.ui.element.workspace();
                }
                me.package.ui.rect.set_relative_region(window, window.restore_region, content);
                me.package.core.property.set(window, "ui.property.group", {
                    "ui.property.broadcast": {
                        "ui.class.remove": "maximize",
                        "ui.class.add": "restore"
                    },
                    "ui.move.enabled": true,
                    "ui.resize.enabled": !me.package.core.property.get(window, "fixed")
                });
            }
            me.package.core.property.notify(window, "update");
            me.package.core.property.notify(parent_window, "update");
            me.package.core.property.notify(window.child_window, "update");
        }
    };
    me.toggleSize = {
        set: function (object, value) {
            var window = me.window(object);
            if (me.package.core.property.get(window, "ui.class.contains", "minimize")) {
                me.package.core.property.set(window, "widget.window.restore");
            }
            else {
                if (me.package.core.property.get(window, "ui.class.contains", "maximize")) {
                    me.package.core.property.set(window, "widget.window.unmaximize");
                } else {
                    me.package.core.property.set(window, "widget.window.maximize");
                }
            }
        }
    };
    me.toggleVisibility = {
        set: function (object, value) {
            var window = me.window(object);
            if( me.package.core.property.get(window, "ui.focus.active")) {
                if (me.package.core.property.get(window, "ui.class.contains", "minimize")) {
                    me.package.core.property.set(window, "widget.window.restore");
                }
                else {
                    me.package.core.property.set(window, "widget.window.minimize");
                }
            }
            else {
                me.package.core.property.set(window, "widget.window.show", true);
            }
        }
    };
    me.seeThrough = {
        get: function(object) {
            var window = me.window(object);
            var seeThrough = me.package.core.property.get(window, "ui.class.contains", "see-through");
            return seeThrough;
        },
        set: function(object, value) {
            var window = me.window(object);
            me.package.core.property.set(window, "ui.class.toggle", "see-through");
        }
    };
    me.blur = {
        set: function (object) {
            var window = me.window(object);
            if (me.package.core.property.get(window, "temp") && window.parentNode) {
                me.package.core.property.set(window, "close");
            }
        }
    };
    me.region = {
        get: function (object) {
            var window = me.window(object);
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            if (maximized || minimized) {
                return window.restore_region;
            } else {
                var parent_window = me.parent(window);
                var content = null;
                if (parent_window) {
                    content = me.package.core.property.get(parent_window, "widget.window.content");
                } else {
                    content = me.package.ui.element.workspace();
                }
                return me.package.ui.rect.relative_region(window, content);
            }
        },
        set: function (object, value) {
            var window = me.window(object);
            var maximized = me.package.core.property.get(window, "ui.class.contains", "maximize");
            var minimized = me.package.core.property.get(window, "ui.class.contains", "minimize");
            var parent_window = me.parent(window);
            var content = null;
            if (parent_window) {
                content = me.package.core.property.get(parent_window, "widget.window.content");
            } else {
                content = me.package.ui.element.workspace();
            }
            if (!maximized && !minimized) {
                me.package.ui.rect.set_relative_region(window, value, content);
            }
            window.restore_region = value;
        }
    };
    me.store = {
        get: function (object) {
            var options = {
                "region": me.package.core.property.get(object, "region"),
                "titleOrder": me.package.core.property.get(object, "titleOrder")
            };
            var keys = ["maximize", "restore", "minimize"];
            keys.map(function (key) {
                var enabled = me.package.core.property.get(object, "ui.class.contains", key);
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
                me.package.core.property.set(object, optionKey, optionValue);
            }
        }
    };
    me.update = {
        set: function (object) {
            var window = me.window(object);
            me.package.core.property.notify(window.var.container, "update");
            me.package.core.property.set(window, "storage.cache.store", me.package.core.property.get(window, "store"));
        }
    };
    me.findWindowByTitle = function (object, title) {
        var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
        var result = null;
        windows.map(function (window) {
            var label = me.package.core.property.get(window, "title");
            if (label === title) {
                result = window;
            }
        });
        return result;
    };
    me.titleOrder = {
        get: function (object) {
            return me.package.core.property.get(object, "widget.window.visibleWindows").map(function (window) {
                return me.package.core.property.get(window, "title");
            });
        },
        set: function (object, titles) {
            if (titles) {
                titles.map(function (title) {
                    var window = me.findWindowByTitle(object, title);
                    if (window) {
                        me.package.core.property.set(window, "ui.focus.active", true);
                    }
                });
            }
        }
    };
    me.visibleWindows = {
        get: function (object, value) {
            var content = me.package.ui.element.workspace();
            if (object !== me.package.ui.element.workspace()) {
                content = me.package.core.property.get(object, "widget.window.content");
            }
            var members = me.package.ui.node.members(content, me.id);
            members = members.filter(function (member) {
                return !me.package.core.property.get(member, "ui.class.contains", "minimize");
            });
            return members;
        }
    };
    me.active = {
        get: function (object) {
            var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
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
            var windows = me.package.core.property.get(object, "widget.window.visibleWindows");
            if (windows && windows.length) {
                var last = windows[windows.length - 1];
                if (last) {
                    me.package.core.property.set(last, "ui.focus.active", true);
                }
            }
        }
    };
    me.childMenuList = {
        get: function (object) {
            var isFirst = true;
            var window = me.mainWindow(object);
            var parent = me.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.package.core.property.get(window, "widget.window.windows");
            windows.sort(function (a, b) {
                var a_title = me.package.core.property.get(a, "title");
                var b_title = me.package.core.property.get(b, "title");
                return a_title === b_title ? 0 : +(a_title > b_title) || -1;
            });
            var items = windows.map(function (child) {
                var result = [
                    me.package.core.property.get(child, "title"),
                    function () {
                        me.package.core.property.set(child, "widget.window.show", true);
                    },
                    {
                        "state": function () {
                            return me.package.core.property.get(child, "ui.focus.active");
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
    me.clientRegion = {
        get: function (object) {
            var window = me.window(object);
            var content = me.package.core.property.get(window, "widget.window.content");
            var region = me.package.ui.rect.relative_region(content);
            return region;
        }
    };
    me.conceal = {
        get: function(object) {
            var window = me.window(object);
            return me.package.core.property.get(window.var.container, "ui.style.display") === "none";
        },
        set: function(object, value) {
            var window = me.window(object);
            me.package.core.property.set(window.var.container, "ui.style.display", value ? "none" : "");
            if(!value) {
                me.package.core.property.notify(window, "update");
            }
        }
    };
    me.focus = {
        set: function(object) {
            var window = me.window(object);
            me.package.core.property.set(window.var.icon, "ui.class.add", "focus");
        }
    };
    me.blur = {
        set: function(object) {
            var window = me.window(object);
            me.package.core.property.set(window.var.icon, "ui.class.remove", "focus");
        }
    };
    me.alwaysOnTop = {
        get: function(object) {
            var window = me.window(object);
            return window.alwaysOnTop;
        },
        set: function(object, value) {
            var window = me.window(object);
            window.alwaysOnTop = value;
            if(value) {
                me.package.core.property.set(window, "ui.style.zIndex", 999);
            }
            else {
                me.package.ui.focus.updateOrder(window.parentNode, window);                
            }
        }
    };
    me.alwaysOnTopToggle = {
        get: function(object) {
            var window = me.window(object);
            return window.alwaysOnTop;
        },
        set: function(object, value) {
            var window = me.window(object);
            me.package.core.property.set(window, "alwaysOnTop", !window.alwaysOnTop);
        }
    };
};
