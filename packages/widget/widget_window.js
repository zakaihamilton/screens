/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.widget.window = function WidgetWindow(me) {
    me.require = {platform: "browser"};
    me.depends = {
        properties: ["title"]
    };
    me.extend = ["ui.move", "ui.focus"];
    me.default = {
        "ui.basic.tag": "div",
        "ui.style.width": "150px",
        "ui.style.height": "150px"
    };
    me.class = ["widget.window.border"];
    me.create = function (object) {
        var path = me.ui.element.to_path(object);
        me.ui.element.create([{
                "ui.theme.class": "widget.window.left_bottom",
                "ui.resize.element": path
            },
            {
                "ui.theme.class": "widget.window.right_bottom",
                "ui.resize.element": path
            },
            {
                "ui.theme.class": "widget.window.left_top",
                "ui.resize.element": path
            },
            {
                "ui.theme.class": "widget.window.right_top",
                "ui.resize.element": path
            },
            {
                "ui.theme.class": "widget.window.margin",
                "ui.basic.elements": [
                    {
                        "ui.theme.class": "widget.window.content",
                        "ui.basic.context": path,
                        "ui.basic.var": "content"
                    },
                    {
                        "ui.theme.class": "widget.window.title"
                    },
                    {
                        "ui.basic.context": path,
                        "ui.basic.var": "close",
                        "ui.theme.class": "widget.window.close",
                        "ui.event.click": "widget.window.menu",
                        "ui.event.dblclick": "widget.window.close",
                        "ui.basic.window": path
                    },
                    {
                        "ui.basic.context": path,
                        "ui.basic.var": "title_label",
                        "ui.basic.text": "Default",
                        "ui.theme.class": "widget.window.label",
                        "ui.focus.focus": "focus",
                        "ui.focus.blur": "blur",
                        "ui.move.element": path
                    },
                    {
                        "ui.basic.context": path,
                        "ui.basic.var": "minimize",
                        "ui.theme.class": "widget.window.action",
                        "ui.event.click": "widget.window.minimize",
                        "ui.style.right": "21px",
                        "ui.basic.window": path,
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.window.minimize",
                        }
                    },
                    {
                        "ui.basic.context": path,
                        "ui.basic.var": "maximize",
                        "ui.theme.class": "widget.window.action",
                        "ui.event.click": "widget.window.maximize",
                        "ui.style.right": "1px",
                        "ui.basic.window": path,
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.window.maximize",
                        }
                    },
                    {
                        "ui.basic.context": path,
                        "ui.basic.var": "restore",
                        "ui.theme.class": "widget.window.action",
                        "ui.event.click": "widget.window.restore",
                        "ui.style.right": "1px",
                        "ui.style.display": "none",
                        "ui.basic.window": path,
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.window.restore",
                        }
                    }
                ]
            }
        ], object);
        var parent = me.parent(object);
        if (parent === document.body) {
            me.ui.element.set(object.close, "ui.theme.add", "main");
        }
        if (!parent.tray) {
            me.ui.element.create({
                "ui.basic.var": "tray",
                "ui.style.overflow": "hidden",
                "ui.style.left": "50px",
                "ui.style.bottom": "0px",
                "ui.style.position": "absolute"
            }, parent);
        }
        object.icon = me.ui.element.create({
            "text": "",
            "ui.style.float": "left",
            "ui.basic.src": "/packages/res/icons/default.png",
            "ui.event.click": "widget.window.menu",
            "ui.event.dblclick": "widget.window.restore",
            "ui.style.display": "none",
            "ui.basic.window": path
        }, parent.tray);
    };
    me.is_root = {
        get: function (object) {
            return me.parent(object) === document.body;
        }
    };
    me.parent = function (object) {
        var parent = object.parentNode;
        while (parent) {
            if (parent === document.body) {
                return parent;
            }
            if (parent.component === me.id) {
                return parent;
            }
            parent = parent.parentNode;
        }
        ;
    };
    me.parent_region = function (object) {
        var parent = object.parentNode;
        while (parent) {
            if (parent === document.body) {
                return me.ui.rect.viewport();
            }
            if (parent.component === me.id) {
                console.log("parent: " + JSON.stringify(parent) + " parent.client:" + parent.content);
                return me.ui.rect.absolute_region(parent.content);
            }
            parent = parent.parentNode;
        }
        ;
    };
    me.draw = function (object) {
        console.log("draw position: " + object.style.position)
        if (object.style.position !== "absolute") {
            console.log("object.title: " + object.title_label);
            me.ui.element.set(object.title_label, "ui.style.right", "20px");
            me.ui.element.set(object.minimize, "ui.style.right", "1px");
            me.ui.element.set(object.maximize, "ui.style.display", "none");
            me.ui.element.set(object.restore, "ui.style.display", "none");
        }
    };
    me.close = {
        get: function (object) {
            var window = me.ui.element.to_object(object.window);
            return me.is_visible(window.close);
        },
        set: function (object, value) {
            var window = me.ui.element.to_object(object.window);
            me.ui.element.set(window.menu, "close", null);
            me.ui.element.set(window.icon, "ui.node.parent", null);
            me.ui.element.set(window, "ui.node.parent", null);
            window.menu = null;
        }
    };
    me.icon = {
        get: function (object) {
            return me.ui.element.get(object.icon, "ui.basic.src");
        },
        set: function (object, value) {
            me.ui.element.set(object.icon, "ui.basic.src", value);
        }
    };
    me.title = {
        get: function (object) {
            return me.ui.element.get(object.title_label, "ui.basic.text");
        },
        set: function (object, value) {
            console.log("window title: " + value + " object: " + object.title);
            me.ui.element.set(object.title_label, "ui.basic.text", value);
            me.ui.element.set(object.icon, "ui.basic.text", value);
        }
    };
    me.background = {
        get: function (object) {
            return me.ui.element.get(object.content, "ui.style.background");
        },
        set: function (object, value) {
            me.ui.element.set(object.content, "ui.style.background", value);
        }
    };
    me.menu = {
        set: function (object, value) {
            var window = me.ui.element.to_object(object.window);
            if (!window) {
                return;
            }
            if (window.menu) {
                me.ui.element.set(window.menu, "close", null);
                window.menu = null;
                return;
            }
            var region = me.ui.rect.absolute_region(object);
            window.menu = me.ui.element.create({
                "ui.element.component": "widget.menu",
                "ui.style.position": "fixed",
                "ui.style.left": region.left + "px",
                "ui.style.top": region.bottom + "px",
                "ui.basic.window": object.window,
                "ui.group.data": {
                    "ui.data.keys": ["ui.basic.text", "select"],
                    "ui.data.values": [
                        ["Restore", "widget.window.restore"],
                        ["Move", ""],
                        ["Size", ""],
                        ["Minimize", "widget.window.minimize"],
                        ["Maximize", "widget.window.maximize"],
                        ["Close", "widget.window.close"],
                        ["Switch To"]]
                }
            }, me.ui.element.body());
            var menu_region = me.ui.rect.absolute_region(window.menu);
            if (!me.ui.rect.in_view_bounds(menu_region)) {
                me.ui.element.set(window.menu, "ui.style.top", "");
                me.ui.element.set(window.menu, "ui.style.bottom", "100px");
            }
        }
    };
    me.is_visible = function (object) {
        if (object) {
            var is_visible = me.ui.element.get(object, "ui.style.display");
            console.log("object: " + object + " visible: " + is_visible);
            return is_visible !== "none";
        }
    };
    me.minimize = {
        get: function (object) {
            var window = me.ui.element.to_object(object.window);
            return me.is_visible(window.minimize) && me.is_visible(window);
        },
        set: function (object, value) {
            var window = me.ui.element.to_object(object.window);
            me.ui.element.set(window, "ui.style.display", "none");
            me.ui.element.set(window.icon, "ui.style.display", "block");
        }
    };
    me.maximize = {
        get: function (object) {
            var window = me.ui.element.to_object(object.window);
            return me.is_visible(window.maximize);
        },
        set: function (object, value) {
            var window = me.ui.element.to_object(object.window);
            me.ui.element.set(window, "ui.style.display", "block");
            me.ui.element.set(window.icon, "ui.style.display", "none");
            me.ui.element.set(window.restore, "ui.style.display", "block");
            me.ui.element.set(window.maximize, "ui.style.display", "none");
            window.restore_region = me.ui.rect.absolute_region(window);
            me.ui.rect.set_absolute_region(window, me.parent_region(window));
            window.style.width = "";
            window.style.height = "";
            window.style.bottom = "-1px";
            window.style.right = "-1px";
            me.ui.element.set(window, "ui.basic.draggable", false);
        }
    };
    me.restore = {
        get: function (object) {
            var window = me.ui.element.to_object(object.window);
            return me.is_visible(window.restore) || !me.is_visible(window);
        },
        set: function (object, value) {
            var window = me.ui.element.to_object(object.window);
            if (window.menu) {
                me.ui.element.set(window.menu, "close", null);
                window.menu = null;
            }
            if (!me.is_visible(window)) {
                me.ui.element.set(window, "ui.style.display", "block");
                me.ui.element.set(window.icon, "ui.style.display", "none");
            } else {
                me.ui.element.set(window.restore, "ui.style.display", "none");
                me.ui.element.set(window.maximize, "ui.style.display", "block");
                me.ui.rect.set_absolute_region(window, window.restore_region);
                me.ui.element.set(window, "ui.basic.draggable", true);
            }
            me.ui.element.set(window, "ui.focus.active", true);
        }
    };
};
