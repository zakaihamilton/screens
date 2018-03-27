/*
 @author Zakai Hamilton
 @component AppLogin
 */

package.app.login = function AppLogin(me) {
    me.init = function() {
        me.core.listener.register(me.signin, me.lib.google.id);
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        return me.singleton;
    };
    me.attachGoogle = {
        set: function(object, value) {
            var widget = document.getElementById(value);
            var window = me.widget.window(object);
            var content = me.core.property.get(window, "widget.window.content");
            me.core.property.set(widget, "ui.node.parent", content);
            me.core.property.set(widget, "ui.property.style", {
                "visibility":"",
                "position":"absolute",
                "left":"18px",
                "width":"200px",
                "top":"50px",
                "textAlign":"center"
            });
            me.core.property.set(widget, "lib.google.attachSignIn", () => {
              me.core.property.set(window.var.userName, "ui.basic.text", "@lib.google.currentName");
            });
        }
    };
    me.signin = function() {
        var state = me.lib.google.signInState();
        var window = me.singleton;
        if(state) {
            me.core.property.set(window.var.userName, "ui.basic.text", "@lib.google.currentName");
            if(me.core.startup.app.name !== "login") {
                me.core.property.set(me.singleton, "close");
                me.startup.app.start();
            }
        }
        else {
            me.core.property.set(window.var.userName, "ui.basic.text", "");
        }
    };
    me.signout = function(object, value) {
        var window = me.singleton;
        me.core.property.set(object, "lib.google.signout");
    };
};
