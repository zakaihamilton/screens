/*
 @author Zakai Hamilton
 @component StartupVersion
 */

screens.startup.version = function StartupVersion(me) {
    me.run = function(task) {
        me.log("retrieving version information");
        me.core.util.config(config => {
            me.core.network.ipAddress(ip => {
                var date = new Date();
                var id = date.getTime();
                var appName = me.core.startup.app.name || "";
                var data = {
                    date: date.toString(),
                    version: config.version,
                    port: me.core.http.port,
                    platform: me.platform,
                    ip: ip,
                    app: appName
                };
                me.log("startup: " + JSON.stringify(data) + " id: " + id);
                me.storage.data.saveAndVerify(err => {
                    if (err) {
                        me.log("failed to save startup to cloud: " + err.message);
                        me.unlock(task);
                    } else {
                        me.log("startup verification complete");
                    }
                    me.unlock(task);
                }, data, "startup", id);
            });
        });
    };
};
