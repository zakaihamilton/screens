/*
 @author Zakai Hamilton
 @component StartupVersion
 */

screens.startup.version = function StartupVersion(me) {
    me.prepare = async function () {
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
            let version = me.storage.local.get(me.id);
            if (version !== config.version) {
                me.storage.local.set(me.id, config.version);
                var cacheList = await me.storage.cache.list();
                cacheList.map(item => {
                    me.log("deleting from cache: " + item.cache + " index: " + item.index + " url: " + item.url);
                });
                me.storage.cache.empty();
                location.reload(true);
            }
        }
    };
};
