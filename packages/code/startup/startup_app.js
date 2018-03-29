/*
 @author Zakai Hamilton
 @component StartupApp
 */

screens.startup.app = function StartupApp(me) {
    me.run = function (task) {
        me.lock(task, (task) => {
            me.ui.class.useStylesheet(() => {
                me.ui.element([
                    {
                        "ui.element.component": "widget.desktop",
                        "ui.basic.var": "desktop"
                    }
                ]);
                if(me.lib.google.isSignedIn()) {
                    me.start();
                }
                else {
                    me.core.app.launch(function (window) {
                        if (window) {
                            me.core.property.set(window, "widget.window.show", true);
                            me.core.property.set(window, "widget.window.maximize");
                        }
                    }, "login");
                }
                me.unlock(task);
            }, "widget");
        });
    };
    me.start = function() {
        var app = me.core.startup.app;
        if (!app.name || app.name !== "none") {
            if (app.name) {
                me.core.app.launch(function (window) {
                    if (window) {
                        me.core.property.set(window, "widget.window.show", true);
                        me.core.property.set(window, "widget.window.maximize");
                    }
                }, app.name, app.params);
            }
            else {
                me.core.app.launch(null, "launcher");
            }
        }
    }
};
