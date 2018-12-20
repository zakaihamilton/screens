/*
 @author Zakai Hamilton
 @component AppTheme
 */

screens.app.theme = function AppTheme(me) {
    me.init = async function () {
        await me.ui.theme.updateList();
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        var current_theme = me.core.property.get(me.singleton, "ui.theme.theme");
        if (typeof current_theme === "string") {
            current_theme = current_theme.charAt(0).toUpperCase() + current_theme.slice(1);
        }
        else {
            current_theme = "None";
        }
        me.core.property.set(me.singleton.var.themeList, "selection", current_theme);
        return me.singleton;
    };
    me.setTheme = {
        set: function (object) {
            var window = me.widget.window.get(object);
            var theme = me.core.property.get(window.var.themeList, "selection")[0];
            theme = theme.toLowerCase();
            me.core.property.set(object, "ui.theme.theme", theme);
        }
    };
    me.themeList = {
        get: function (object) {
            var themeList = me.ui.theme.themes;
            if (themeList) {
                return themeList.map(function (item) {
                    return [item.charAt(0).toUpperCase() + item.slice(1)];
                });
            }
        }
    };
};
