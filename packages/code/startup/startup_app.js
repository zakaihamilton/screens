/*
 @author Zakai Hamilton
 @component StartupApp
 */

package.startup.app = function StartupApp(me) {
    me.name = null;
    me.args = null;
    me.run = function(task) {
        package.include("app.main", function (appInfo) {
            if (appInfo.complete) {
                if (me.name) {
                    me.core.message.send_browser("app.main.setStartupApp", null, me.name);
                    me.core.message.send_browser("app.main.setStartupArgs", null, me.args);
                }
                me.core.message.send_browser("app.main." + me.platform);
            }
        });
    };
};
