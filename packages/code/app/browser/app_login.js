/*
 @author Zakai Hamilton
 @component AppLogin
 */

screens.app.login = function AppLogin(me, packages) {
    me.init = function () {
        me.core.listener.register(me.signin, me.core.login.id);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
        me.autoLogin = args.length ? args[0] : false;
        me.signin();
        return me.singleton;
    };
    me.signin = function () {
        if (!me.core.property.get(me.singleton, "ui.node.parent")) {
            return;
        }
        var state = me.core.login.signInState();
        var status = me.core.login.status;
        var window = me.singleton;
        me.core.property.set(window.var.status, "ui.basic.text", status);
        me.core.property.set(window.var.signin, "ui.basic.hide", "@core.login.isSignedIn");
        me.core.property.set(window.var.userName, "ui.basic.text", "@core.login.userName");
        me.core.property.set([
            window.var.signout,
            window.var.disconnect,
            window.var.userNameLabel,
            window.var.userName
        ], "ui.basic.show", "@core.login.isSignedIn");
        if (state && me.autoLogin) {
            if (me.core.startup.app.name !== "login") {
                me.core.property.set(me.singleton, "close");
                me.startup.app.start();
            }
        }
    };
};
