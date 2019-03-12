/*
 @author Zakai Hamilton
 @component StartupVersion
 */

screens.startup.version = function StartupVersion(me, packages) {
    const { core } = packages;
    me.init = function () {
        core.broadcast.register(me, {
            prepare: "startup.version.prepare"
        });
    };
    me.prepare = async function () {
        if (me.platform === "server") {
            me.log("retrieving version information");
            let config = await core.util.config();
            let date = new Date();
            let id = date.getTime();
            let data = {
                date: date.toString(),
                version: config.version,
                port: core.http.port,
                platform: me.platform
            };
            me.log("startup: " + JSON.stringify(data) + " id: " + id);
            me.log("startup verification complete");
        }
        else if (me.platform === "browser") {
            let config = await core.util.config();
            let version = me.storage.local.get(me.id);
            if (version && config.version && version !== config.version) {
                me.storage.local.set(me.id, config.version);
                await core.util.reload();
            }
        }
    };
};
