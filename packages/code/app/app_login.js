/*
 @author Zakai Hamilton
 @component AppLogin
 */

package.app.login = function AppLogin(me) {
    me.init = function(task) {
        me.lock(task, (task) => {
            me.include({
                "lib":[
                    "googleauth",
                    "facebookauth"
                ]
            }, function(info) {
                if(info.complete) {
                    me.unlock(task);
                }
            });
        });
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        me.singleton.isEnabled = false;
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
                "left":"10%",
                "bottom":"100px",
                "textAlign":"center"
            });
            me.core.property.set(widget, "lib.googleauth.attachSignIn", () => {
              me.core.property.set(window.var.userName, "ui.basic.text", "@lib.googleauth.currentName");
              me.core.property.set(window.var.signout, "ui.basic.show", true);
            });
        }
    };
    me.signout = function(object, value) {
        var window = me.widget.window(object);
        me.core.property.set(object, "lib.googleauth.signout");
        me.core.property.set(window.var.userName, "ui.basic.text", "");
        me.core.property.set(object, "ui.basic.show", false);
    };
    me.checkFBLoginState = function() {
        me.lib.facebookauth.status((response) => {
            console.log("fb status: " + JSON.stringify(response));
        });
    };
};
