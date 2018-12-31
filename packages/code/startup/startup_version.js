/*
 @author Zakai Hamilton
 @component StartupVersion
 */

screens.startup.version = function StartupVersion(me) {
    me.run = async function () {
        if (me.platform === "server") {
            me.log("retrieving version information");
            let config = await me.core.util.config();
            let date = new Date();
            let id = date.getTime();
            let data = {
                date: date.toString(),
                version: config.version,
                port: me.core.http.port,
                platform: me.platform
            };
            me.log("startup: " + JSON.stringify(data) + " id: " + id);
            try {
                me.log("Saving verification data");
                await me.storage.data.saveAndVerify(data, "startup", id);
                me.log("startup verification complete");
            }
            catch (err) {
                me.log("startup verification failed");
            }
        }
        else if (me.platform === "browser") {
            let config = await me.core.util.config();
            var validKey = me.storage.local.validKey("startup.version");
            let version = me.core.property.get(me.storage.local.local, validKey);
            if (version !== config.version) {
                me.core.property.set(me.storage.local.local, validKey, config.version);
                location.reload(true);
            }
        }
    };
};
