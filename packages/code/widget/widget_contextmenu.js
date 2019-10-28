/*
 @author Zakai Hamilton
 @component WidgetContextMenu
 */

screens.widget.contextmenu = function WidgetContextMenu(me, { core, widget, ui }) {
    me.resizable = {
        get: function (object) {
            var window = widget.window.get(object);
            return !core.property.get(window, "fixed");
        }
    };
    me.minimizable = {
        get: function (object) {
            var window = widget.window.get(object);
            return !core.property.get(window, "temp") && !core.property.get(window, "popup");
        }
    };
    me.maximizable = {
        get: function (object) {
            var window = widget.window.get(object);
            return !core.property.get(window, "fixed") && !core.property.get(window, "popup");
        }
    };
    me.notPopup = {
        get: function (object) {
            var window = widget.window.get(object);
            return !core.property.get(window, "popup");
        }
    };
    me.notEmbed = {
        get: function (object) {
            var window = widget.window.get(object);
            return !core.property.get(window, "embed");
        }
    };
    me.switchable = {
        get: function (object) {
            var window = widget.window.get(object);
            var parent = widget.window.parent(window);
            return !core.property.get(window, "temp") && !core.property.get(window, "popup") && !core.property.get(window, "embed") && !parent;
        }
    };
    me.isChild = {
        get: function (object) {
            var window = widget.window.get(object);
            if (core.property.get(window, "popup") || core.property.get(window, "embed")) {
                return false;
            }
            var parent = widget.window.parent(window);
            return parent;
        }
    };
    me.next = {
        set: function (object) {
            var window = widget.window.get(object);
            var next = ui.node.previous(window, widget.window.id);
            core.property.set(next, "widget.window.show", true);
            if (next !== window) {
                ui.focus.updateOrder(window.parentNode, window, 0);
            }
        }
    };
    me.show = {
        set: function (object, value) {
            var window = widget.window.get(object);
            var title = core.property.get(window, "title");
            core.property.set(window, "showInBackground", false);
            var visible = !core.property.get(window, "ui.class.contains", "minimize");
            var region = ui.rect.absoluteRegion(object);
            var bottomUp = !visible || value === "taskbar";
            var menu = widget.menu.create_menu(window, object, region, me.json, [title], bottomUp);
            if (bottomUp) {
                var parent = widget.window.parent(window);
                if (!parent) {
                    parent = ui.element.workspace();
                }
                var menu_region = ui.rect.absoluteRegion(menu);
                var icon_region = ui.rect.absoluteRegion(window.var.icon);
                var taskbar_region = ui.rect.absoluteRegion(ui.element.bar().var.tasks);
                core.property.set(menu, {
                    "ui.style.left": icon_region.left + "px",
                    "ui.style.top": taskbar_region.top - menu_region.height + "px"
                });
            }
        }
    };
};
