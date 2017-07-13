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
    me.content = {
        get: function (object) {
            var window = me.window(object);
            var content = me.widget.container.content(window.var.container);
            return content;
        }
    };
    me.windows = {
        get: function (object) {
            var content = document.body;
            if (object !== document.body) {
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
            if (window.static) {
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
                    "ui.property.bubble": {
                        "draw": null
                    },
                    "widget.window.refocus": null
                });
            } else {
                me.set(document.body, "widget.window.refocus");
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
    me.resizable = {
        get: function (object) {
            var window = me.window(object);
            return !window.fixed;
        }
    };
    me.switchable = {
        get: function (object) {
            var window = me.window(object);
            var parent = me.parent(window);
            return !window.temp && !parent;
        }
    };
    me.isChild = {
        get: function (object) {
            var window = me.window(object);
            var parent = me.parent(window);
            console.log("isChild: " + window.window_title + " parent: " + parent);
            return parent;
        }
    };
    me.next = {
        set: function (object) {
            var window = me.window(object);
            var next = me.ui.node.previous(window, me.widget.window.id);
            me.set(next, "widget.window.show", true);
            if(next !== window) {
                me.ui.focus.updateOrder(window.parentNode, window, 0);
            }
        }
    };
    me.popup = me.ui.set.attribute("popup");
    me.temp = me.ui.set.attribute("temp");
    me.static = me.ui.set.attribute("static");
    me.fixed = me.ui.set.attribute("fixed", function (object, value) {
        var maximized = me.set(object, "ui.theme.contains", "maximize");
        me.set(object, "ui.resize.enabled", !value && !maximized);
    });
    me.context_menu = {
        set: function (object, value) {
            var window = me.window(object);
            var visible = !me.set(window, "ui.theme.contains", "minimize");
            var region = me.ui.rect.absolute_region(object);
            var menu = me.widget.menu.create_menu(window, object, region, [
                ["Restore", "widget.window.restore", {
                        "enabled": "widget.window.restore",
                        "visible": "widget.window.resizable"
                    }
                ],
                ["Move", "", {
                        "enabled": false
                    }
                ],
                ["Size", "", {
                        "enabled": false,
                        "visible": "widget.window.resizable"
                    }
                ],
                ["Minimize", "widget.window.minimize", {
                        "enabled": "widget.window.minimize",
                        "visible": "widget.window.resizable"
                    }
                ],
                ["Maximize", "widget.window.maximize", {
                        "enabled": "widget.window.maximize",
                        "visible": "widget.window.resizable"
                    }
                ],
                ["Close", "widget.window.close", {
                        "separator": "widget.window.resizable",
                        "enabled": "widget.window.close"
                    }
                ],
                ["Next", "widget.window.next", {
                        "separator": true,
                        "visible": "widget.window.isChild"
                    }
                ],
                ["Switch To...", "core.app.tasks", {
                        "separator": true,
                        "visible": "widget.window.switchable"
                    }
                ]
            ]);
            if (!visible) {
                var parent = me.parent(window);
                if (!parent) {
                    parent = document.body;
                }
                var menu_region = me.ui.rect.absolute_region(menu);
                var icon_region = me.ui.rect.absolute_region(window.var.icon);
                var icon_icon_region = me.ui.rect.absolute_region(window.var.icon.var.icon);
                me.set(menu, "ui.property.group", {
                    "ui.style.left": icon_icon_region.left + "px",
                    "ui.style.top": region.bottom - menu_region.height - icon_region.height + "px"
                });
            }
        }
    };
    me.switch = function (parent, child) {
        me.update_title(parent);
        me.widget.menu.switch(parent, child);
        me.set(child, "ui.property.broadcast", {
            "ui.theme.toggle": "child"
        });
        me.set(parent, "ui.property.broadcast", {
            "ui.theme.toggle": "parent"
        });
    }
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
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            return !minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
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
                me.set(document.body, "widget.window.refocus");
            }
            me.set(window, "ui.property.bubble", {
                "draw": null
            });
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            return !window.fixed && !maximized && !minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var wasMaximized = me.set(window, "ui.theme.contains", "maximize");
            me.set(window, "ui.property.group", {
                "ui.theme.remove": "minimize",
                "ui.focus.active": true,
                "ui.property.broadcast": {
                    "ui.theme.remove": "restore",
                    "ui.theme.add": "maximize"
                }
            });
            me.set(window.var.icon, "ui.style.display", "none");
            var parent_window = me.parent(window);
            var content = null;
            if (parent_window) {
                me.attach(window, parent_window);
                content = me.get(parent_window, "widget.window.content");
            } else {
                content = document.body;
            }
            if (!wasMaximized) {
                window.restore_region = me.ui.rect.relative_region(window, content);
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
            me.set(window, "ui.property.notify", {
                "draw": null
            });
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
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
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            if (minimized) {
                var maximized = me.set(window, "ui.theme.contains", "maximize");
                if (maximized) {
                    me.set(window, "maximize");
                } else {
                    me.set(window.var.icon, "ui.style.display", "none");
                    me.set(window, "ui.property.group", {
                        "ui.theme.remove": "minimize",
                        "ui.focus.active": true,
                        "ui.property.notify": {
                            "draw": null
                        }
                    });
                }
            } else {
                me.set(window, "unmaximize");
            }
        }
    };
    me.unmaximize = {
        get: function (object) {
            var window = me.window(object);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            return maximized || minimized;
        },
        set: function (object, value) {
            var window = me.window(object);
            var parent_window = me.parent(window);
            var minimized = me.set(window, "ui.theme.contains", "minimize");
            var maximized = me.set(window, "ui.theme.contains", "maximize");
            if (minimized) {
                me.set(window, "ui.property.broadcast", {
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
                    content = document.body;
                }
                me.ui.rect.set_relative_region(window, window.restore_region, content);
                me.set(window, "ui.property.group", {
                    "ui.property.broadcast": {
                        "ui.theme.remove": "maximize",
                        "ui.theme.add": "restore"
                    },
                    "ui.move.enabled": true,
                    "ui.resize.enabled": !window.fixed
                });
            }
            me.set(window, "ui.property.group", {
                "ui.focus.active": true,
                "ui.property.notify": {
                    "draw": null
                }
            });
        }
    };
    me.toggle = {
        set: function (object, value) {
            var window = me.window(object);
            if (me.set(window, "ui.theme.contains", "maximize")) {
                me.set(window, "widget.window.unmaximize");
            } else {
                me.set(window, "widget.window.maximize");
            }
        }
    };
    me.blur = {
        set: function (object) {
            var window = me.window(object);
            if (window.temp && window.parentNode) {
                me.set(window, "close");
            }
        }
    };
    me.visibleWindows = {
        get: function (object, value) {
            var content = document.body;
            if (object !== document.body) {
                content = me.get(object, "widget.window.content");
            }
            var members = me.ui.node.members(content, me.id);
            members = members.filter(function (member) {
                return !me.set(member, "ui.theme.contains", "minimize");
            });
            return members;
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
};
