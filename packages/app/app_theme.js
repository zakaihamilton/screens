/*
 @author Zakai Hamilton
 @component AppTheme
 */

package.app.theme = function AppTheme(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "desktop", "self");
        var current_theme = me.get(me.storage.cache.local, "ui-theme-current");
        current_theme = current_theme.charAt(0).toUpperCase() + current_theme.slice(1);
        me.set(me.singleton.var.themeList, "selection", current_theme);
    };
    me.setTheme = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var theme = me.get(window.var.themeList, "selection")[0];
            theme = theme.toLowerCase();
            if(theme === "none") {
                me.ui.theme.unload();
            }
            else {
                me.ui.theme.load(null, theme);
            }
        }
    };
    me.themeList = {
        get: function(object) {
            var themeList = me.ui.theme.themes;
            if(themeList) {
                return themeList.map(function(item) {
                    return [item.charAt(0).toUpperCase() + item.slice(1)];
                });
            }
        }
    };
};
