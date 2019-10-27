/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me, { core }) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
        core.property.set(me, "core.network.online", () => {
            me.widget.toast.show(me.id, "Online");
        });
        core.property.set(me, "core.network.offline", () => {
            me.widget.toast.show(me.id, "Offline");
        });
    };
    me.tasks = function (object) {
        var window = me.widget.window.get(object);
        var parent = me.widget.window.parent(window);
        var isPopup = core.property.get(window, "popup");
        if (parent || isPopup) {
            return;
        }
        parent = me.ui.element.bar();
        if (!parent || !parent.var) {
            return;
        }
        return parent.var.tasks;
    };
    me.shortcuts = function (object, list) {
        let items = [];
        for (let name of list) {
            let item = me.shortcut(object, name);
            items.push(item);
        }
        me.ui.element.create(items, object);
    };
    me.shortcut = function (object, name) {
        var method = method = "core.app." + name;
        var label = name;
        if (name.includes(".")) {
            method = name;
            label = name.split(".").pop();
        }
        let title = core.string.title(label);
        let image = label;
        let onclick = function (object) {
            me.core.property.set(object, method);
            if (method !== "widget.taskbar.toggleShortcuts") {
                me.expandShortcuts(object, false);
            }
        };
        return {
            "ui.basic.tag": "div",
            "ui.class.class": "widget.taskbar.shortcut",
            "ui.touch.click": onclick,
            "ui.basic.var": label,
            "ui.attribute.title": title,
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "img",
                    "ui.basic.src": image
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.text": title,
                    "ui.basic.display": method !== "widget.taskbar.toggleShortcuts"
                }
            ]
        };
    };
    me.prepare = function (object) {
        me.toggleShortcuts(object);
    };
    me.expandShortcuts = function (object, expand) {
        var taskbar = me.ui.node.container(object, me.id);
        var shortcuts = taskbar.var.shortcuts;
        core.property.set(shortcuts, "ui.class.collapse", !expand);
        var isCollapsed = core.property.get(shortcuts, "ui.class.collapse");
        var name = isCollapsed ? "toggleShortcutsOn" : "toggleShortcuts";
        var image = me.ui.node.findByTag(shortcuts.var.toggleShortcuts, "img");
        core.property.set(image, "ui.basic.src", name);
    };
    me.toggleShortcuts = function (object) {
        var taskbar = me.ui.node.container(object, me.id);
        var isCollapsed = core.property.get(taskbar.var.shortcuts, "ui.class.collapse");
        me.expandShortcuts(object, isCollapsed);
    };
    return "browser";
};

screens.widget.taskbar.task = function WidgetTaskbarTask(me, { core }) {
    me.init = function () {
        me.element = {
            redirect: {
                "ui.basic.text": "text"
            },
            properties: {
                "ui.class.class": "item",
                "ui.basic.window": null,
                "ui.node.parent": "@widget.taskbar.tasks",
                "ui.basic.elements": [
                    {
                        "ui.basic.tag": "img",
                        "ui.touch.click": "widget.contextmenu.show(taskbar)",
                        "ui.class.class": "icon",
                        "ui.basic.var": "icon",
                    },
                    {
                        "ui.basic.tag": "div",
                        "ui.touch.click": "click",
                        "ui.class.class": "label",
                        "ui.basic.var": "label"
                    }
                ]
            },
            extend: ["ui.drag.icon"]
        };
    };
    me.click = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window, "showInBackground", false);
        me.widget.window.toggleVisibility(window);
    };
    me.icon = {
        get: function (object) {
            return core.property.get(object.var.icon, "ui.basic.src");
        },
        set: function (object, name) {
            return core.property.set(object.var.icon, "ui.basic.src", name);
        }
    };
    me.text = {
        get: function (object) {
            return core.property.get(object.var.label, "ui.basic.text");
        },
        set: function (object, name) {
            return core.property.set(object.var.label, "ui.basic.text", name);
        }
    };
    return "browser";
};
