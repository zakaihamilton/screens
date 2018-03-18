/*
 @author Zakai Hamilton
 @component StartupApp
 */

package.startup.app = function StartupApp(me) {
    me.run = function(task) {
        me.ui.element([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        var app = me.core.startup.app;
        if(!app.name || app.name !== "none") {
            if(app.name) {
                me.core.app.launch(function(window) {
                    if(window) {
                        me.core.property.set(window, "widget.window.show", true);
                        me.core.property.set(window, "widget.window.maximize");
                    }
                }, app.name, app.params);
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
