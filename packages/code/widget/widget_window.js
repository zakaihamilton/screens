/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

screens.widget.window = function WidgetWindow(me) {
    me.element = {
        dependencies: {
            properties: ["title"]
        },
        extend: ["ui.focus"],
        redirect: {
            "ui.basic.text": "text",
            "ui.style.background": "background",
            "ui.basic.elements": "elements",
            "ui.basic.html": "html"
        },
        draw: function (object) {
            if (!object.delayTimer) {
                me.core.property.set(object, "ui.focus.active", !object.showInBackground);
            }
            me.core.property.set(object, "update");
        },
        properties: __json__
    };
    me.init = function () {
        me.ui.property.themedProperties(me, {
            "popup": null,
            "embed": function (object, value) {
                var maximized = me.core.property.get(object, "ui.class.contains", "maximize");
                me.core.property.set(object, "ui.move.enabled", !value && !maximized);
                me.core.property.set(object, "ui.style.position", value ? "relative" : "absolute");
                if (value) {
                    me.core.property.set(object.var.icon, "ui.node.parent");
                }
                else {
                    me.core.property.set(object, "ui.arrange.center");
                    me.core.property.set(object.var.icon, "ui.node.parent", "@widget.taskbar.tasks");
                }
            },
            "temp": null,
            "static": null,
            "transparent": null,
            "nobar": function (object, value) {
                if (value) {
                    me.core.property.set(object.var.icon, "ui.node.parent");
                }
                else {
                    me.core.property.set(object.var.icon, "ui.node.parent", "@widget.taskbar.tasks");
                }
            },
            "fixed": function (object, value) {
                var maximized = me.core.property.get(object, "ui.class.contains", "maximize");
                me.core.property.set(object, "ui.resize.enabled", !value && !maximized);
            }
        });
    };
    me.storeRegion = function (object) {
        var window = me.get(object);
        var parent_window = me.parent(window);
        var content = null;
        if (parent_window) {
            content = me.core.property.get(parent_window, "widget.window.content");
        } else {
            content = me.ui.element.workspace();
        }
        window.restore_region = me.ui.rect.relativeRegion(window, content);
    };
    me.mainClass = {
        get: function (object) {
            var window = me.get(object);
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
            var window = me.get(object);
            var hasParent = me.core.property.get(window, "ui.node.parent");
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            return !minimized && hasParent;
        }
    };
    me.parent = function (object) {
        if (!object) {
            return null;
        }
        var parent = object;
        while (parent) {
            if (parent.parentWidget) {
                parent = parent.parentWidget;
            }
            else {
                parent = parent.parentNode;
            }
            if (!parent) {
                break;
            }
            if (parent === me.ui.element.workspace()) {
                return null;
            }
            if (parent.window) {
                return parent.window;
            }
            if (parent.component === me.id) {
                return parent;
            }
        }
        return null;
    };
    me.mainWindow = function (object) {
        var window = me.get(object);
        var parent = me.parent(window);
        if (parent) {
            return parent;
        }
        return window;
    };
    me.get = function (object) {
        var window = object;
        if (window) {
            if (window.window) {
                window = window.window;
            }
            if (window.component !== me.id) {
                if (window.component !== me.id) {
                    window = me.parent(window);
                }
            }
        }
        return window;
    };
    me.content = function (object) {
        var window = me.get(object);
        return window.var.container;
    };
    me.windows = {
        get: function (object) {
            var content = me.ui.element.workspace();
            if (object !== me.ui.element.workspace()) {
                content = me.core.property.get(object, "widget.window.content");
            }
            return me.ui.node.members(content, me.id);
        }
    };
    me.app = {
        get: function (object) {
            var window = me.get(object);
            return window.app_component;
        },
        set: function (object, app_component) {
            var window = me.get(object);
            if (typeof app_component === "string") {
                app_component = me[app_component];
            }
            window.app_component = app_component;
        }
    };
    me.child = function (object) {
        var window = me.get(object);
        if (window && window.child_window) {
            return window.child_window;
        }
        return window;
    };
    me.method = function (object, method) {
        var window = me.child(object);
        if (window.app_component) {
            return window.app_component.id + "." + method;
        }
    };
    me.exportData = {
        get: function (object) {
            var window = me.child(object);
            if (window.app_component) {
                return me.core.property.has(window, window.app_component.id + ".exportData");
            }
        },
        set: function (object, data) {
            var window = me.child(object);
            if (window.app_component) {
                me.core.property.set(window, window.app_component.id + ".exportData", data);
            }
        }
    };
    me.importData = {
        get: function (object) {
            var window = me.child(object);
            if (window.app_component) {
                return me.core.property.has(window, window.app_component.id + ".importData");
            }
        },
        set: function (object, data) {
            var window = me.child(object);
            if (window.app_component) {
                me.core.property.set(window, window.app_component.id + ".importData", data);
                me.core.property.set(window, "show", true);
            }
        }
    };
    me.elements = {
        get: function (object) {
            var content = me.core.property.get(object, "widget.window.content");
            return me.ui.node.childList(content);
        },
        set: function (object, value) {
            if (value) {
                var content = me.core.property.get(object, "widget.window.content");
                me.ui.element.create(value, content, object.context);
            }
        }
    };
    me.html = {
        get: function (object) {
            var content = me.core.property.get(object, "widget.window.content");
            return content.innerHTML;
        },
        set: function (object, value) {
            if (value) {
                var content = me.core.property.get(object, "widget.window.content");
                content.innerHTML = value;
                me.ui.theme.updateElements(object);
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
            var window = me.get(object);
            var isStatic = me.core.property.get(window, "static");
            if (isStatic) {
                me.core.property.set(window, "minimize");
                return;
            }
            var isEmbed = me.core.property.get(window, "embed");
            if (isEmbed) {
                me.core.property.set(window, "restore");
                return;
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.detachFromParent(parent_window);
            }
            me.core.property.set(window.var.icon, "ui.node.parent");
            me.core.property.set(window, "ui.node.parent");
            if (parent_window) {
                me.core.property.set(parent_window, {
                    "widget.window.refocus": null
                });
                me.core.property.notify(parent_window, "update");
            } else {
                me.core.property.set(me.ui.element.workspace(), "widget.window.refocus");
            }
            if (window.delayTimer) {
                clearTimeout(window.delayTimer);
                window.delayTimer = null;
            }
            if (window.app_component) {
                me.core.property.set(window, window.app_component.id + ".close");
            }
        }
    };
    me.icon = {
        get: function (object) {
            return me.core.property.get(object.var.icon, "ui.basic.src");
        },
        set: function (object, value) {
            me.core.property.set(object.var.icon, "ui.basic.src", value);
        }
    };
    me.update_title = function (object) {
        var window = me.get(object);
        var title = me.core.property.get(window, "widget.window.title");
        var name = me.core.property.get(window, "widget.window.name");
        var label = title;
        if (title) {
            if (name) {
                label += " - " + name;
            }
        }
        else {
            label = name;
        }
        if (window.child_window) {
            label += " - " + me.core.property.get(window.child_window, "widget.window.name");
        }
        me.core.property.set(window.var.label, "ui.basic.text", label);
        me.core.property.set(window.var.icon, "ui.basic.text", label);
    };
    me.label = {
        get: function (object) {
            var window = me.get(object);
            me.update_title(window);
            return me.core.property.get(window.var.label, "ui.basic.text");
        }
    };
    me.key = {
        get: function (object) {
            var window = me.get(object);
            return window.window_key;
        },
        set: function (object, value) {
            var window = me.get(object);
            window.window_key = value;
        }
    };
    me.name = {
        get: function (object) {
            var window = me.get(object);
            return window.window_name;
        },
        set: function (object, name) {
            var window = me.get(object);
            window.window_name = name;
            me.update_title(window);
            var parent_window = me.parent(window);
            if (parent_window) {
                me.update_title(parent_window);
            }
            me.updateStorage(window);
        }
    };
    me.title = {
        get: function (object) {
            var window = me.get(object);
            return window.window_title;
        },
        set: function (object, value) {
            var window = me.get(object);
            window.window_title = value;
            me.update_title(window);
            var parent_window = me.parent(window);
            if (parent_window) {
                me.update_title(parent_window);
            }
            me.updateStorage(window);
        }
    };
    me.background = {
        get: function (object) {
            var content = me.core.property.get(object, "widget.window.content");
            return me.core.property.get(content, "ui.style.background");
        },
        set: function (object, value) {
            var content = me.core.property.get(object, "widget.window.content");
            me.core.property.set(content, "ui.style.background", value);
        }
    };
    me.updateParentChild = function (parent, child) {
        me.update_title(parent);
        me.update_title(child);
        me.widget.menu.updateTheme(child);
        me.widget.menu.updateTheme(parent);
        var isChild = parent && parent.child_window === child;
        var property = isChild ? "ui.class.add" : "ui.class.remove";
        var properties = {};
        properties[property] = "child";
        me.core.property.set(child, "ui.property.broadcast", properties);
        properties[property] = "parent";
        me.core.property.set(parent, "ui.property.broadcast", properties);
    };
    me.siblings = {
        set: function (object, properties) {
            var window = me.get(object);
            var parent_window = me.parent(window);
            var content = me.ui.element.workspace();
            if (parent_window) {
                content = me.core.property.get(parent_window, "widget.window.content");
            }
            var members = me.ui.node.members(content, me.id);
            members.map(function (member) {
                if (member === window) {
                    return;
                }
                for (var key in properties) {
                    me.core.property.set(member, key, properties[key]);
                }
            });
        }
    };
    me.attachToParent = function (window, parent_window) {
        if (parent_window.child_window) {
            me.core.property.set(parent_window.child_window, "unmaximize");
        }
        me.core.property.set(window, "siblings", {
            "conceal": true
        });
        parent_window.child_window = window;
        me.updateParentChild(parent_window, window);
        me.core.property.set([
            window.var.close,
            parent_window.var.menu,
            window.var.minimize,
            window.var.maximize
        ], "ui.node.parent", parent_window.var.header);
    };
    me.detachFromParent = function (parent_window) {
        if (parent_window && parent_window.child_window) {
            var window = parent_window.child_window;
            parent_window.child_window = null;
            me.core.property.set(window.var.menu, "ui.node.parent", parent_window.var.header);
            me.core.property.set(window, "siblings", {
                "conceal": false
            });
            me.core.property.set([
                window.var.close,
                window.var.label,
                window.var.minimize,
                window.var.maximize
            ], "ui.node.parent", window.var.title);
            me.updateParentChild(parent_window, window);
        }
    };
    me.minimize = {
        get: function (object) {
            var window = me.get(object);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var embed = me.core.property.get(window, "ui.class.contains", "embed");
            return !minimized && !embed;
        },
        set: function (object, value) {
            var window = me.get(object);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            if (minimized) {
                return;
            }
            var parent_window = me.parent(window);
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            if (!maximized) {
                me.storeRegion(window);
            }
            me.core.property.set(window, {
                "ui.class.add": "minimize",
                "ui.focus.active": false
            });
            if (!me.core.property.get(window, "popup")) {
                me.core.property.set(window.var.icon, "ui.class.add", "minimize");
            }
            if (parent_window) {
                if (parent_window.child_window && parent_window.child_window !== window) {
                    return;
                }
                if (maximized) {
                    me.detachFromParent(parent_window);
                }
                me.core.property.set(parent_window, "widget.window.refocus");
            } else {
                me.core.property.set(me.ui.element.workspace(), "widget.window.refocus");
            }
            me.core.property.notify(parent_window, "update");
            me.core.property.notify(window, "update");
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.get(object);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.core.property.get(window, "ui.class.contains", "embed");
            return !me.core.property.get(window, "fixed") && !me.core.property.get(window, "popup") && !maximized && !minimized && !embed;
        },
        set: function (object, value) {
            var window = me.get(object);
            var wasMinimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var wasMaximized = me.core.property.get(window, "ui.class.contains", "maximize");
            if (wasMaximized && !wasMinimized) {
                return;
            }
            if (me.core.property.get(window, "fixed") || me.core.property.get(window, "popup")) {
                return;
            }
            if (me.core.property.get(window, "embed")) {
                me.core.property.set(window, "restore");
                return;
            }
            me.core.property.set(window, {
                "ui.class.remove": "minimize",
                "ui.focus.active": !window.showInBackground,
                "ui.property.broadcast": {
                    "ui.class.remove": "restore",
                    "ui.class.add": "maximize"
                }
            });
            if (!me.core.property.get(window, "popup")) {
                me.core.property.set(window.var.icon, "ui.class.remove", "minimize");
            }
            var parent_window = me.parent(window);
            if (parent_window) {
                me.attachToParent(window, parent_window);
            }
            if (!wasMaximized) {
                me.storeRegion(window);
                me.core.property.set(window, {
                    "ui.property.style": {
                        "left": "0px",
                        "top": "0px",
                        "width": "",
                        "height": "",
                        "bottom": "0px",
                        "right": "0px"
                    },
                    "ui.move.enabled": false,
                    "ui.resize.enabled": false
                });
            }
            me.core.property.set([window, parent_window, window.child_window], "ui.property.broadcast", {
                "update": null
            });
        }
    };
    me.fixRegion = function (object) {
        var window = me.get(object);
        var region = me.ui.rect.absoluteRegion(window);
        var workspace_region = me.ui.rect.absoluteRegion(me.ui.element.workspace());
        var update = false;
        var fixed = me.core.property.get(window, "fixed");
        if (region.left <= workspace_region.left || region.left >= workspace_region.right) {
            me.core.property.set(window, "ui.style.left", "0px");
        }
        if (region.top <= workspace_region.top || region.top >= workspace_region.bottom) {
            me.core.property.set(window, "ui.style.top", "0px");
        }
        if (region.right >= workspace_region.right && !fixed) {
            me.core.property.set(window, "ui.style.width", workspace_region.right - workspace_region.left);
        }
        if (region.bottom >= workspace_region.bottom && !fixed) {
            me.core.property.set(window, "ui.style.height", workspace_region.bottom - workspace_region.top);
        }
    };
    me.delay = {
        get: function (object) {
            var window = me.get(object);
            return window.delay;
        },
        set: function (object, value) {
            var window = me.get(object);
            window.delay = value;
            clearTimeout(window.delayTimer);
            if (value) {
                me.core.property.set(window, "ui.basic.show", false);
                me.core.property.set(window.var.icon, "ui.node.parent");
                window.delayTimer = setTimeout(() => {
                    window.delayTimer = null;
                    me.core.property.set(window, "ui.basic.show", true);
                    me.core.property.set(window.var.icon, "ui.node.parent", "@widget.taskbar.tasks");
                    me.core.property.set(window, "update");
                    me.core.property.set(window, "ui.focus.active", !window.showInBackground);
                }, value);
            }
            else {
                window.delayTimer = null;
            }
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.get(object);
            var parent_window = me.parent(window);
            var fixed = me.core.property.get(window, "widget.window.fixed");
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            if (value) {
                if (parent_window && parent_window.child_window && parent_window.child_window !== window) {
                    me.core.property.set(window, "maximize");
                } else if (minimized) {
                    me.core.property.set(window, "restore");
                } else if (!me.core.property.get(window, "embed")) {
                    me.core.property.set(window, "ui.focus.active", !window.showInBackground);
                }
                me.fixRegion(window);
            } else if (!minimized) {
                me.core.property.set(window, "minimize");
            }
        }
    };
    me.restore = {
        get: function (object) {
            var window = me.get(object);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.core.property.get(window, "ui.class.contains", "embed");
            return maximized || minimized || embed;
        },
        set: function (object, value) {
            var window = me.get(object);
            var parent_window = me.parent(window);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            var embed = me.core.property.get(window, "ui.class.contains", "embed");
            if (!minimized && !maximized && !embed) {
                if (parent_window && parent_window.child_window) {
                    var child_maximized = me.core.property.get(parent_window.child_window, "ui.class.contains", "maximize");
                    if (child_maximized) {
                        me.core.property.set(parent_window.child_window, "unmaximize");
                        me.core.property.set(window, "ui.focus.active", !window.showInBackground);
                    }
                }
                return;
            }
            if (embed) {
                if (parent_window) {
                    parent_window.focus_window = null;
                }
                me.core.property.set(window, {
                    "ui.node.parent": me.ui.element.workspace(),
                    "widget.window.embed": false,
                    "ui.focus.active": !window.showInBackground
                });
                me.core.property.set(window.var.icon, "ui.node.parent", "@widget.taskbar.tasks");
                me.core.property.set(window.var.icon, "widget.icon.type", "list");
                me.core.property.set([window, parent_window, window.child_window], "ui.property.broadcast", {
                    "update": null
                });
            }
            else if (minimized) {
                if (maximized) {
                    me.core.property.set(window, "maximize");
                } else {
                    if (!me.core.property.get(window, "popup")) {
                        me.core.property.set(window.var.icon, "ui.class.remove", "minimize");
                    }
                    me.core.property.set(window, {
                        "ui.class.remove": "minimize",
                        "ui.focus.active": !window.showInBackground
                    });
                    var content = null;
                    if (parent_window) {
                        content = me.core.property.get(parent_window, "widget.window.content");
                    } else {
                        content = me.ui.element.workspace();
                    }
                    me.ui.rect.setRelativeRegion(window, window.restore_region, content);
                    me.core.property.set([window, parent_window, window.child_window], "ui.property.broadcast", {
                        "update": null
                    });
                }
            } else {
                me.core.property.set(window, "unmaximize");
            }
        }
    };
    me.unmaximize = {
        get: function (object) {
            var window = me.get(object);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.get(object);
            var parent_window = me.parent(window);
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            if (!maximized && !minimized) {
                return;
            }
            if (minimized) {
                me.core.property.set(window, "ui.property.broadcast", {
                    "ui.class.remove": "minimize",
                    "ui.focus.active": !window.showInBackground
                });
                if (!me.core.property.get(window, "popup")) {
                    me.core.property.set(window.var.icon, "ui.class.remove", "minimize");
                }
            }
            if (maximized) {
                var content = null;
                if (parent_window) {
                    me.detachFromParent(parent_window);
                    content = me.core.property.get(parent_window, "widget.window.content");
                } else {
                    content = me.ui.element.workspace();
                }
                me.ui.rect.setRelativeRegion(window, window.restore_region, content);
                me.core.property.set(window, {
                    "ui.property.broadcast": {
                        "ui.class.remove": "maximize",
                        "ui.class.add": "restore"
                    },
                    "ui.move.enabled": true,
                    "ui.resize.enabled": !me.core.property.get(window, "fixed")
                });
            }
            me.core.property.set([window, parent_window, window.child_window], "ui.property.broadcast", {
                "update": null
            });
        }
    };
    me.toggleSize = {
        set: function (object, value) {
            var window = me.get(object);
            if (me.core.property.get(window, "ui.class.contains", "minimize")) {
                me.core.property.set(window, "widget.window.restore");
            }
            else {
                if (me.core.property.get(window, "ui.class.contains", "maximize")) {
                    me.core.property.set(window, "widget.window.unmaximize");
                } else {
                    me.core.property.set(window, "widget.window.maximize");
                }
            }
        }
    };
    me.taskbarClick = function (object) {
        var window = me.get(object);
        me.core.property.set(window, "showInBackground", false);
        me.toggleVisibility(window);
    };
    me.toggleVisibility = function (object, value) {
        var window = me.get(object);
        if (me.core.property.get(window, "ui.focus.active")) {
            if (me.core.property.get(window, "ui.class.contains", "minimize")) {
                me.core.property.set(window, "widget.window.restore");
            }
            else {
                me.core.property.set(window, "widget.window.minimize");
            }
        }
        else {
            me.core.property.set(window, "widget.window.show", true);
        }
    };
    me.seeThrough = {
        get: function (object) {
            var window = me.get(object);
            var seeThrough = me.core.property.get(window, "ui.class.contains", "see-through");
            return seeThrough;
        },
        set: function (object, value) {
            var window = me.get(object);
            me.core.property.set(window, "ui.class.toggle", "see-through");
        }
    };
    me.fullscreen = {
        get: function (object) {
            var window = me.get(object);
            var fullscreen = me.core.property.get(window, "ui.class.contains", "fullscreen");
            return fullscreen;
        },
        set: function (object, value) {
            var window = me.get(object);
            var fullscreen = me.core.property.get(window, "ui.class.contains", "fullscreen");
            var list = [];
            while (window) {
                list.push(window);
                if (window.child_window) {
                    list.push(window.child_window);
                }
                var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
                if (!maximized) {
                    break;
                }
                window = me.parent(window);
            }
            if (!window) {
                var workspace = me.ui.element.workspace();
                list.push(workspace);
            }
            list = list.filter(function (item, pos, self) {
                return self.indexOf(item) === pos;
            });
            me.core.property.set(list, "ui.property.broadcast", {
                "ui.class.fullscreen": !fullscreen
            });
            me.core.property.set(list, "ui.property.broadcast", {
                "update": null
            });
        }
    };
    me.region = {
        get: function (object) {
            var window = me.get(object);
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            if (maximized || minimized) {
                return window.restore_region;
            } else {
                var parent_window = me.parent(window);
                var content = null;
                if (parent_window) {
                    content = me.core.property.get(parent_window, "widget.window.content");
                } else {
                    content = me.ui.element.workspace();
                }
                return me.ui.rect.relativeRegion(window, content);
            }
        },
        set: function (object, value) {
            var window = me.get(object);
            var maximized = me.core.property.get(window, "ui.class.contains", "maximize");
            var minimized = me.core.property.get(window, "ui.class.contains", "minimize");
            var parent_window = me.parent(window);
            var content = null;
            if (parent_window) {
                content = me.core.property.get(parent_window, "widget.window.content");
            } else {
                content = me.ui.element.workspace();
            }
            if (!maximized && !minimized) {
                me.ui.rect.setRelativeRegion(window, value, content);
            }
            window.restore_region = value;
        }
    };
    me.store = {
        get: function (object) {
            var window = me.get(object);
            if (!me.core.property.get(window, "embed")) {
                var options = {
                    "order": me.core.property.get(window, "order"),
                    "name": me.core.property.get(window, "name")
                };
                if (!me.core.property.get(window, "fixed")) {
                    options["region"] = me.core.property.get(window, "region");
                }
                var keys = ["maximize", "restore", "minimize"];
                keys.map(function (key) {
                    var enabled = me.core.property.get(window, "ui.class.contains", key);
                    if (enabled) {
                        options[key] = null;
                    }
                });
                return JSON.stringify(options);
            }
        },
        set: function (object, value) {
            var window = me.get(object);
            if (!me.core.property.get(window, "embed")) {
                var options = JSON.parse(value);
                for (var optionKey in options) {
                    var optionValue = options[optionKey];
                    if (optionKey === "title") {
                        continue;
                    }
                    if (optionKey === "maximize" || optionKey === "restore") {
                        var parent = me.parent(window);
                        if (parent) {
                            var windows = me.core.property.get(parent, "widget.window.visibleWindows");
                            if (windows && windows.length > 1 && window !== windows[windows.length - 1]) {
                                continue;
                            }
                        }
                    }
                    me.core.property.set(window, optionKey, optionValue);
                }
                me.fixRegion(window);
            }
        }
    };
    me.resize = function (object) {
        var window = me.get(object);
        if (window.app_component) {
            me.core.property.set(window, window.app_component.id + ".resize");
        }
    };
    me.update = {
        set: function (object) {
            var window = me.get(object);
            me.resize(object);
            me.core.property.notify(window.var.container, "update");
            if (window.app_component) {
                me.core.property.set(window, window.app_component.id + ".update");
            }
            me.core.property.set(window, "storage.local.store", me.core.property.get(window, "store"));
        }
    };
    me.updateStorage = function (object) {
        var window = me.get(object);
        me.core.property.set(window, "storage.local.store", me.core.property.get(window, "store"));
    };
    me.findWindowByKey = function (object, key) {
        var windows = me.core.property.get(object, "widget.window.visibleWindows");
        var result = null;
        windows.map(function (window) {
            var label = me.core.property.get(window, "key");
            if (label === key) {
                result = window;
            }
        });
        return result;
    };
    me.order = {
        get: function (object) {
            return me.core.property.get(object, "widget.window.visibleWindows").map(function (window) {
                return me.core.property.get(window, "key");
            });
        },
        set: function (object, keys) {
            if (keys) {
                keys.map(function (key) {
                    var window = me.findWindowByKey(object, key);
                    if (window) {
                        me.core.property.set(window, "ui.focus.active", !window.showInBackground);
                    }
                });
            }
        }
    };
    me.visibleWindows = {
        get: function (object, value) {
            var content = me.ui.element.workspace();
            if (object !== me.ui.element.workspace()) {
                content = me.core.property.get(object, "widget.window.content");
            }
            var members = me.ui.node.members(content, me.id);
            members = members.filter(function (member) {
                return !me.core.property.get(member, "ui.class.contains", "minimize");
            });
            return members;
        }
    };
    me.active = {
        get: function (object) {
            var windows = me.core.property.get(object, "widget.window.visibleWindows");
            if (windows && windows.length) {
                var last = windows[windows.length - 1];
                if (last) {
                    return last;
                }
            }
            var window = me.get(object);
            return window;
        }
    };
    me.refocus = {
        set: function (object, value) {
            var windows = me.core.property.get(object, "widget.window.visibleWindows");
            if (windows && windows.length) {
                var window = windows[windows.length - 1];
                me.core.property.set(window, "ui.focus.active", !window.showInBackground);
            }
        }
    };
    me.childMenuList = {
        get: function (object) {
            var window = me.mainWindow(object);
            var parent = me.parent(window);
            if (parent) {
                window = parent;
            }
            var windows = me.core.property.get(window, "widget.window.windows");
            windows.sort(function (a, b) {
                var a_key = me.core.property.get(a, "key");
                var b_key = me.core.property.get(b, "key");
                return a_key === b_key ? 0 : +(a_key > b_key) || -1;
            });
            var items = windows.map(function (child) {
                var result = [
                    me.core.property.get(child, "label"),
                    function () {
                        me.core.property.set(child, "widget.window.show", true);
                    },
                    {
                        "state": function () {
                            return me.core.property.get(child, "ui.focus.active");
                        }
                    },
                    {
                        "group": "windows"
                    }
                ];
                return result;
            });
            return items;
        }
    };
    me.clientRegion = {
        get: function (object) {
            var window = me.get(object);
            var content = me.core.property.get(window, "widget.window.content");
            var region = me.ui.rect.relativeRegion(content);
            return region;
        }
    };
    me.conceal = {
        get: function (object) {
            var window = me.get(object);
            return me.core.property.get(window.var.container, "ui.style.display") === "none";
        },
        set: function (object, value) {
            var window = me.get(object);
            me.core.property.set(window.var.container, "ui.style.display", value ? "none" : "");
            if (!value) {
                me.core.property.notify(window, "update");
            }
        }
    };
    me.showInBackground = {
        get: function (object) {
            var window = me.get(object);
            return window.showInBackground;
        },
        set: function (object, value) {
            var window = me.get(object);
            window.showInBackground = value;
        }
    };
    me.focus = {
        set: function (object) {
            var window = me.get(object);
            me.core.property.set(window.var.icon, "ui.class.add", "focus");
        }
    };
    me.blur = {
        set: function (object) {
            var window = me.get(object);
            me.core.property.set(window.var.icon, "ui.class.remove", "focus");
            if (me.core.property.get(window, "temp") && window.parentNode) {
                me.core.property.set(window, "close");
            }
        }
    };
    me.alwaysOnTop = {
        get: function (object) {
            var window = me.get(object);
            return window.alwaysOnTop;
        },
        set: function (object, value) {
            var window = me.get(object);
            if (typeof value === "string") {
                value = !window.alwaysOnTop;
            }
            window.alwaysOnTop = value;
            me.ui.focus.updateOrder(window.parentNode, window);
        }
    };
    me.tasks = function () {
        var windows = me.ui.node.members(me.ui.element.workspace(), me.widget.window.id);
        var items = windows.reverse().map((window) => {
            var label = me.core.property.get(window, "label");
            if (label === "Task List" || label === "Launcher") {
                return null;
            }
            return { label, window };
        });
        return items;
    };
    me.exportMenuList = function (object, method) {
        var window = me.widget.window.mainWindow(object);
        var tasks = me.widget.window.tasks();
        var items = tasks.filter(task => {
            return me.core.property.get(task.window, "importData");
        }).map(task => {
            if (task.window === window) {
                return null;
            }
            return [
                task.label,
                () => {
                    me.core.property.set(window, method, task.window);
                }
            ];
        });
        items = items.filter(Boolean);
        if (!items.length) {
            return null;
        }
        var menu = [{
            "text": "Export",
            "select": items,
            "options": {
                "separator": true
            }
        }];
        return menu;
    };
    return "browser";
};
