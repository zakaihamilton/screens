/*
 @author Zakai Hamilton
 @component StartupVersion
 */

package.startup.version = function StartupVersion(me) {
    me.run = function(task) {
        me.core.console.log("retrieving version information");
        me.core.util.config(config => {
            me.core.network.ipAddress(ip => {
                var date = new Date();
                var id = date.getTime();
                var appName = package.core.startup.app.name || "";
                var data = {
                    date: date.toString(),
                    version: config.version,
                    port: me.core.http.port,
                    platform: me.platform,
                    ip: ip,
                    app: appName
                };
                me.core.console.log("startup: " + JSON.stringify(data) + " id: " + id);
                me.storage.data.saveAndVerify(err => {
                    if (err) {
                        me.core.console.log("failed to save startup to cloud: " + err.message);
                        me.unlock(task);
                    } else {
                        me.core.console.log("startup verification complete");
                    }
                    me.unlock(task);
                }, data, "startup", id);
            });
        });
    };
};
