/*
 @author Zakai Hamilton
 @component AppLogin
 */

screens.app.login = function AppLogin(me) {
    me.init = function() {
        me.core.listener.register(me.signin, me.lib.google.id);
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        me.signin();
        return me.singleton;
    };
    me.signin = function() {
        if (!me.core.property.get(me.singleton, "ui.node.parent")) {
            return;
        }
        var state = me.lib.google.signInState();
        var status = me.lib.google.status;
        var window = me.singleton;
        me.core.property.set(window.var.status, "ui.basic.text", status);
        me.core.property.set(window.var.signin, "ui.basic.hide", "@lib.google.isSignedIn");
        me.core.property.set(window.var.userName, "ui.basic.text", "@lib.google.currentName");
        me.core.property.set([
            window.var.signout,
            window.var.disconnect,
            window.var.userNameLabel,
            window.var.userName
        ], "ui.basic.show", "@lib.google.isSignedIn");
        if(state) {
            if(me.core.startup.app.name !== "login") {
                me.core.property.set(me.singleton, "close");
                me.startup.app.start();
            }
        }
    };
};
