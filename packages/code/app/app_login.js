/*
 @author Zakai Hamilton
 @component AppLogin
 */

package.app.login = function AppLogin(me) {
    me.init = function(task) {
        me.lock(task, (task) => {
            me.include("lib.googleauth", function(info) {
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
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        me.singleton.isEnabled = false;
        return me.singleton;
    };
    me.attach = {
        set: function(object, value) {
            var widget = document.getElementById(value);
            var content = me.core.property.get(object, "widget.window.content");
            me.core.property.set(widget, "ui.node.parent", content);
            me.core.property.set(widget, "ui.property.style", {
                "visibility":"",
                "position":"absolute",
                "left":"30%",
                "bottom":"50px"
            });
            me.core.property.set(widget, "lib.googleauth.attachSignIn", () => {
                
            });
        }
    };
};
