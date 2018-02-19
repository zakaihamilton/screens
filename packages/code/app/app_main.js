/*
 @author Zakai Hamilton
 @component AppMain
 */

package.require("app.main", "browser");
package.app.main = function (me) {
    me.ready = {browser:false, client:false};
    me.setStartupApp = function(callback, appName) {
        me.appName = appName;
    };
    me.setStartupArgs = function(callback, appArgs) {
        me.appArgs = appArgs;
    };
    me.client = function () {
        me.core.console.log("client is ready");
        me.ready.client = true;
        if(me.ready.browser) {
            me.ready();
        }
    };
    me.browser = function () {
        me.core.console.log("browser is ready");
        me.ready.browser = true;
        if(me.ready.client) {
            me.ready();
        }
    };
    me.ready = function () {
        me.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        package.include("app.progman", function(info) {
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
    };
    me.ok = {
        set: function (object, value) {
            me.core.message.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
};
