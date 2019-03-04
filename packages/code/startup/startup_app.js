/*
 @author Zakai Hamilton
 @component StartupApp
 */

screens.startup.app = function StartupApp(me) {
    me.firstTime = true;
    me.init = function () {
        me.core.startup.register(me);
        me.core.listener.register(me.ready, me.core.login.id);
    };
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
            if (me.core.network.isOnline()) {
                await me.core.login.load();
            }
            else {
                me.ready();
            }
        }
        catch (err) {
            document.body.innerHTML = me.html.replace("__error__", err.message || err);
            throw err;
        }
        finally {
            me.core.property.set(progress, "close");
        }
        if (!me.core.login.isSignedIn() && me.core.network.isOnline()) {
            var window = await me.core.app.launch("login", true);
            if (window) {
                me.core.property.set(window, "widget.window.show", true);
                me.core.property.set(window, "widget.window.maximize");
            }
        }
    };
    me.ready = async function () {
        if (me.firstTime) {
            me.firstTime = false;
            await me.start();
        }
    };
    me.start = async function () {
        var app = me.core.startup.app;
        if (!app.name || app.name !== "none") {
            if (app.name && await me.core.app.available(app.name)) {
                var args = [app.name];
                if (app.params) {
                    args.push(...app.params);
                }
                me.core.app.launch.apply(null, args).then((window) => {
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
    };
    return "browser";
};
