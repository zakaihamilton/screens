/*
 @author Zakai Hamilton
 @component StartupApp
 */

screens.startup.app = function StartupApp(me) {
    me.run = async function () {
        me.ui.element.create([
            {
                "ui.element.component": "widget.desktop",
                "ui.basic.var": "desktop"
            }
        ]);
        try {
            var progress = me.ui.modal.launch("progress", {
                "title": "Login",
                "delay": "1000"
            });
            await me.lib.google.load();
        }
        catch(err) {
            document.body.innerHTML = __html__.replace("__error__", err.message || err);
        }
        finally {
            me.core.property.set(progress, "close");
        }
        if (me.lib.google.isSignedIn()) {
            me.start();
        }
        else {
            var window = await me.core.app.launch("login", true);
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
                me.core.app.apply(null, args).then((window) => {
                    if (window) {
                        me.core.property.set(window, "widget.window.show", true);
                        me.core.property.set(window, "widget.window.maximize");
                    }
                });
            }
            else {
                me.core.app.launch("launcher");
            }
        }
    }
};
