/*
 @author Zakai Hamilton
 @component AppTheme
 */

screens.app.theme = function AppTheme(me) {
    me.init = function(task) {
        me.lock((task) => {
            me.ui.theme.updateList(() => {
                me.unlock(task);
            });
        });
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        var current_theme = me.core.property.get(me.storage.local.local, "ui-theme-current");
        current_theme = current_theme.charAt(0).toUpperCase() + current_theme.slice(1);
        me.core.property.set(me.singleton.var.themeList, "selection", current_theme);
        return me.singleton;
    };
    me.setTheme = {
        set: function(object) {
            var window = me.widget.window(object);
            var theme = me.core.property.get(window.var.themeList, "selection")[0];
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
