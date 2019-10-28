/*
 @author Zakai Hamilton
 @component AppLogin
 */

screens.app.login = function AppLogin(me, { core, ui, startup }) {
    me.init = function () {
        core.listener.register(me.signin, core.login.id);
    };
    me.launch = function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
        me.autoLogin = args.length ? args[0] : false;
        me.signin();
        return me.singleton;
    };
    me.signin = function () {
        if (!core.property.get(me.singleton, "ui.node.parent")) {
            return;
        }
        var state = core.login.signInState();
        var status = core.login.status;
        var window = me.singleton;
        core.property.set(window.var.status, "ui.basic.text", status);
        core.property.set(window.var.signin, "ui.basic.hide", "@core.login.isSignedIn");
        core.property.set(window.var.userName, "ui.basic.text", "@core.login.userName");
        core.property.set([
            window.var.signout,
            window.var.disconnect,
            window.var.userNameLabel,
            window.var.userName
        ], "ui.basic.show", "@core.login.isSignedIn");
        if (state && me.autoLogin) {
            if (core.startup.app.name !== "login") {
                core.property.set(me.singleton, "close");
                startup.app.start();
            }
        }
    };
};
