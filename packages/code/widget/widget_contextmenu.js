/*
 @author Zakai Hamilton
 @component WidgetContextMenu
 */

screens.widget.contextmenu = function WidgetContextMenu(me) {
    me.resizable = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return !me.core.property.get(window, "fixed");
        }
    };
    me.minimizable = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return !me.core.property.get(window, "temp") && !me.core.property.get(window, "popup");
        }
    };
    me.maximizable = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return !me.core.property.get(window, "fixed") && !me.core.property.get(window, "popup");
        }
    };
    me.notPopup = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return !me.core.property.get(window, "popup");
        }
    };
    me.notEmbed = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return !me.core.property.get(window, "embed");
        }
    };
    me.switchable = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var parent = me.widget.window.parent(window);
            return !me.core.property.get(window, "temp") && !me.core.property.get(window, "popup") && !me.core.property.get(window, "embed") && !parent;
        }
    };
    me.isChild = {
        get: function (object) {
            var window = me.widget.window.get(object);
            if (me.core.property.get(window, "popup") || me.core.property.get(window, "embed")) {
                return false;
            }
            var parent = me.widget.window.parent(window);
            return parent;
        }
    };
    me.next = {
        set: function (object) {
            var window = me.widget.window.get(object);
            var next = me.ui.node.previous(window, me.widget.window.id);
            me.core.property.set(next, "widget.window.show", true);
            if (next !== window) {
                me.ui.focus.updateOrder(window.parentNode, window, 0);
            }
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.widget.window.get(object);
            me.core.property.set(window, "showInBackground", false);
            var visible = !me.core.property.get(window, "ui.class.contains", "minimize");
            var region = me.ui.rect.absoluteRegion(object);
            var bottomUp = !visible || value === "taskbar";
            var menu = me.widget.menu.create_menu(window, object, region, me.json, bottomUp);
            if (bottomUp) {
                var parent = me.widget.window.parent(window);
                if (!parent) {
                    parent = me.ui.element.workspace();
                }
                var menu_region = me.ui.rect.absoluteRegion(menu);
                var icon_region = me.ui.rect.absoluteRegion(window.var.icon);
                var taskbar_region = me.ui.rect.absoluteRegion(me.ui.element.bar().var.tasks);
                me.core.property.set(menu, {
                    "ui.style.left": icon_region.left + "px",
                    "ui.style.top": taskbar_region.top - menu_region.height + "px"
                });
            }
        }
    };
};
