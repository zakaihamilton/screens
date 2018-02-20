/*
 @author Zakai Hamilton
 @component AppMain
 */

package.require("app.main", "browser");
package.app.main = function (me) {
    me.readyFlags = {
        browser:false,
        client:false
    };
    me.setStartupApp = function(callback, appName) {
        me.appName = appName;
    };
    me.setStartupArgs = function(callback, appArgs) {
        me.appArgs = appArgs;
    };
    me.client = function () {
        me.core.console.log("client is ready");
        me.readyFlags.client = true;
        if(me.readyFlags.browser) {
            me.ready();
        }
    };
    me.browser = function () {
        me.core.console.log("browser is ready");
        me.readyFlags.browser = true;
        if(me.readyFlags.client) {
            me.ready();
        }
    };
    me.ready = function () {
        me.core.console.log("starting applications");
        me.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        if(!me.appName || me.appName !== "none") {
            me.include("app.progman", function(info) {
                if(info.complete) {
                    me.core.message.send("app.progman.launch");
                    if(me.appName) {
                        me.core.app.launch(function(window) {
                            if(window) {
                                me.core.property.set(window, "widget.window.show", true);
                                me.core.property.set(window, "widget.window.maximize");
                            }
                        }, me.appName, me.appArgs);
                    }
                }
            });
        }
    };
};
