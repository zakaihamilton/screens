/*
 @author Zakai Hamilton
 @component StartupApp
 */

screens.startup.app = function StartupApp(me, { core, ui }) {
    me.firstTime = true;
    me.init = function () {
        core.listener.register(me.start, core.login.id);
        core.broadcast.register(me, {
            startup: "startup.app.startup"
        });
    };
    me.startup = async function () {
        ui.element.create([
            {
                "ui.element.component": "widget.desktop",
                "ui.basic.var": "desktop"
            }
        ]);
        try {
            var progress = ui.modal.launch("progress", {
                "title": "Loading",
                "delay": "1000"
            });
            await core.login.load();
        }
        catch (err) {
            document.body.innerHTML = me.html.replace("__error__", err.message || err);
            throw err;
        }
        finally {
            core.property.set(progress, "close");
        }
        if (!core.login.isSignedIn()) {
            var window = await core.app.launch("login", true);
            if (window) {
                core.property.set(window, "widget.window.show", true);
                core.property.set(window, "widget.window.maximize");
            }
        }
    };
    me.start = async function () {
        if (!me.firstTime) {
            return;
        }
        me.firstTime = false;
        var app = core.startup.app;
        if (!app.name || app.name !== "none") {
            if (app.name && await core.app.available(app.name)) {
                var args = [app.name];
                if (app.params) {
                    args.push(...app.params);
                }
                core.app.launch.apply(null, args).then((window) => {
                    if (window) {
                        core.property.set(window, "widget.window.show", true);
                        core.property.set(window, "widget.window.maximize");
                    }
                });
            }
            else {
                core.app.launch("launcher");
            }
        }
    };
    return "browser";
};
