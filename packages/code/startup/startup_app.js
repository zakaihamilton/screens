/*
 @author Zakai Hamilton
 @component StartupApp
 */

package.startup.app = function StartupApp(me) {
    me.appName = null;
    me.appArgs = null;
    me.run = function(task) {
        me.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        if(!me.appName || me.appName !== "none") {
            if(me.appName) {
                me.core.app.launch(function(window) {
                    if(window) {
                        me.core.property.set(window, "widget.window.show", true);
                        me.core.property.set(window, "widget.window.maximize");
                    }
                }, me.appName, me.appArgs);
            }
            else {
                me.core.app.launch(function(window) {
                    me.core.property.set(window, "widget.window.show", true);
                    me.core.property.set(window, "widget.window.maximize");
                }, "progman");
            }
        }
    };
};
