/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
    };
    me.tasks = function (object) {
        var window = me.widget.window.get(object);
        var parent = me.widget.window.parent(window);
        var isPopup = me.core.property.get(window, "popup");
        if (parent || isPopup) {
            return;
        }
        parent = me.ui.element.bar();
        return parent.var.tasks;
    };
    me.shortcut = function (object, name) {
        var method = method = "core.app." + name;
        var label = name;
        if (name.includes(".")) {
            method = name;
            label = name.split(".").pop();
        }
        return [[
            me.core.string.title(label),
            label,
            label,
            method
        ]];
    };
    me.prepare = function (object) {
        if (me.core.device.isMobile()) {
            me.toggleShortcuts(object);
        }
    };
    me.toggleShortcuts = function (object) {
        var taskbar = me.ui.node.container(object, me.id);
        me.core.property.set([taskbar.var.shortcuts, taskbar.var.tasks], "ui.class.toggle", "collapse");
        var isCollapsed = me.core.property.get(taskbar.var.shortcuts, "ui.class.collapse");
        var name = isCollapsed ? "toggleShortcutsOn" : "toggleShortcuts";
        me.core.property.set(taskbar.var.toggleShortcuts, "ui.basic.src", "" + name);
    };
};

screens.widget.taskbar.task = function WidgetTaskbarTask(me) {
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
                        "ui.basic.var": "icon"
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
        me.core.property.set(window, "showInBackground", false);
        me.widget.window.toggleVisibility(window);
    };
    me.icon = {
        get: function (object) {
            return me.core.property.get(object.var.icon, "ui.basic.src");
        },
        set: function (object, name) {
            return me.core.property.set(object.var.icon, "ui.basic.src", name);
        }
    };
    me.text = {
        get: function (object) {
            return me.core.property.get(object.var.label, "ui.basic.text");
        },
        set: function (object, name) {
            return me.core.property.set(object.var.label, "ui.basic.text", name);
        }
    };
};
