/*
 @author Zakai Hamilton
 @component MenuContext
 */

package.menu.context = function MenuContext(me) {
    me.resizable = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.get(window, "fixed");
        }
    };
    me.notPopup = {
        get: function (object) {
            var window = me.widget.window.window(object);
            return !me.get(window, "popup");
        }
    };
    me.switchable = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            return !window.temp && !parent;
        }
    };
    me.isChild = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var parent = me.widget.window.parent(window);
            return parent;
        }
    };
    me.next = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var next = me.ui.node.previous(window, me.widget.window.id);
            me.set(next, "widget.window.show", true);
            if(next !== window) {
                me.ui.focus.updateOrder(window.parentNode, window, 0);
            }
        }
    };
    me.show = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            var visible = !me.set(window, "ui.theme.contains", "minimize");
            var region = me.ui.rect.absolute_region(object);
            var menu = me.widget.menu.create_menu(window, object, region, __json__);
            if (!visible) {
                var parent = me.widget.window.parent(window);
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
};
