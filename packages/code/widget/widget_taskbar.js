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
            label + ".png",
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
        me.core.property.set(taskbar.var.toggleShortcuts, "ui.basic.src", "" + name + ".png");
    };
};
