/*
 @author Zakai Hamilton
 @component MenuContext
 */

package.menu.context = function MenuContext(me) {
    me.resizable = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.core.property.get(window, "fixed");
        }
    };
    me.maximizable = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.core.property.get(window, "fixed") && !me.core.property.get(window, "popup");
        }
    };
    me.notPopup = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.core.property.get(window, "popup");
        }
    };
    me.notEmbed = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.core.property.get(window, "embed");
        }
    };
    me.switchable = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            return !me.core.property.get(window, "temp") && !me.core.property.get(window, "popup") && !me.core.property.get(window, "embed") && !parent;
        }
    };
    me.isChild = {
        get: function (object) {
            var window = me.widget.window.window(object);
            if(me.core.property.get(window, "popup") || me.core.property.get(window, "embed")) {
                return false;
            }
            var parent = me.widget.window.parent(window);
            return parent;
        }
    };
    me.next = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var next = me.ui.node.previous(window, me.widget.window.id);
            me.core.property.set(next, "widget.window.show", true);
            if(next !== window) {
                me.ui.focus.updateOrder(window.parentNode, window, 0);
            }
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            var visible = !me.core.property.get(window, "ui.class.contains", "minimize");
            var region = me.ui.rect.absolute_region(object);
            var bottomUp = !visible || value === "taskbar";
            var menu = me.widget.menu.create_menu(window, object, region, __json__, bottomUp);
            var padding = 0;
            if (bottomUp) {
                var parent = me.widget.window.parent(window);
                if(!parent) {
                    parent = me.ui.element.workspace();
                }
                padding = -6;
                var menu_region = me.ui.rect.absolute_region(menu);
                var icon_region = me.ui.rect.absolute_region(window.var.icon);
                var icon_icon_region = me.ui.rect.absolute_region(window.var.icon.var.icon);
                me.core.property.set(menu, "ui.property.group", {
                    "ui.style.left": icon_icon_region.left + "px",
                    "ui.style.top": region.bottom - menu_region.height - icon_region.height + padding + "px"
                });
            }
        }
    };    
};
