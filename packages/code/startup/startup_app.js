/*
 @author Zakai Hamilton
 @component StartupApp
 */

package.startup.app = function StartupApp(me) {
    me.name = null;
    me.args = null;
    me.run = function(task) {
        me.include("app.main", function (appInfo) {
            if (appInfo.complete) {
                if (me.name) {
                    me.app.main.setStartupApp(null, me.name);
                    me.app.main.setStartupArgs(null, me.args);
                }
                me.app.main.launch();
            }
        });
    };
};
