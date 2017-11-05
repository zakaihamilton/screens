/*
 @author Zakai Hamilton
 @component AppTheme
 */

package.app.theme = function AppTheme(me) {
    me.launch = function () {
        if (me.the.core.property.get(me.singleton, "ui.node.parent")) {
            me.the.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.the.ui.element.create(__json__, "workspace", "self");
        var current_theme = me.the.core.property.get(me.the.storage.cache.local, "ui-theme-current");
        current_theme = current_theme.charAt(0).toUpperCase() + current_theme.slice(1);
        me.the.core.property.set(me.singleton.var.themeList, "selection", current_theme);
    };
    me.setTheme = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var theme = me.the.core.property.get(window.var.themeList, "selection")[0];
            theme = theme.toLowerCase();
            if(theme === "none") {
                me.the.ui.theme.unload();
            }
            else {
                me.the.ui.theme.load(null, theme);
            }
        }
    };
    me.themeList = {
        get: function(object) {
            var themeList = me.the.ui.theme.themes;
            if(themeList) {
                return themeList.map(function(item) {
                    return [item.charAt(0).toUpperCase() + item.slice(1)];
                });
            }
        }
    };
};
