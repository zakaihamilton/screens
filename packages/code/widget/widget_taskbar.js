/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me) {
    me.element = {
        properties: __json__
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
        var dblClickMethod = null;
        if (name === "launcher") {
            dblClickMethod = "widget.taskbar.toggleShortcuts";
        }
        return [[
            me.core.string.title(label),
            "/packages/res/icons/" + label + ".png",
            label,
            method,
            dblClickMethod
        ]];
    };
    me.toggleShortcuts = function (object) {
        var taskbar = me.ui.node.container(object, me.id);
        me.core.property.set([taskbar.var.shortcuts, taskbar.var.tasks], "ui.class.toggle", "collapse");
    };
};
