/*
 @author Zakai Hamilton
 @component StartupApp
 */

screens.startup.app = function StartupApp(me) {
    me.run = async function () {
        await me.ui.class.useStylesheet("widget");
        me.ui.element([
            {
                "ui.element.component": "widget.desktop",
                "ui.basic.var": "desktop"
            }
        ]);
        if (me.lib.google.isSignedIn()) {
            me.start();
        }
        else {
            var window = await me.core.app("login");
            if (window) {
                me.core.property.set(window, "widget.window.show", true);
                me.core.property.set(window, "widget.window.maximize");
            }
        }
    };
    me.start = function () {
        var app = me.core.startup.app;
        if (!app.name || app.name !== "none") {
            if (app.name) {
                var args = [app.name];
                if (app.params) {
                    args.push(...app.params);
                }
                me.core.app.apply.apply(null, args).then((window) => {
                    if (window) {
                        me.core.property.set(window, "widget.window.show", true);
                        me.core.property.set(window, "widget.window.maximize");
                    }
                });
            }
            else {
                me.core.app("launcher");
            }
        }
    }
};
