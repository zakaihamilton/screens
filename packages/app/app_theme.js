/*
 @author Zakai Hamilton
 @component AppTheme
 */

package.app.theme = function AppTheme(me) {
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.package.ui.element.create(__json__, "workspace", "self");
        var current_theme = me.package.core.property.get(me.package.storage.cache.local, "ui-theme-current");
        current_theme = current_theme.charAt(0).toUpperCase() + current_theme.slice(1);
        me.package.core.property.set(me.singleton.var.themeList, "selection", current_theme);
    };
    me.setTheme = {
        set: function(object) {
            var window = me.package.widget.window.window(object);
            var theme = me.package.core.property.get(window.var.themeList, "selection")[0];
            theme = theme.toLowerCase();
            if(theme === "none") {
                me.package.ui.theme.unload();
            }
            else {
                me.package.ui.theme.load(null, theme);
            }
        }
    };
    me.themeList = {
        get: function(object) {
            var themeList = me.package.ui.theme.themes;
            if(themeList) {
                return themeList.map(function(item) {
                    return [item.charAt(0).toUpperCase() + item.slice(1)];
                });
            }
        }
    };
};
