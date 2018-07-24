/*
 @author Zakai Hamilton
 @component StartupVersion
 */

screens.startup.version = function StartupVersion(me) {
    me.run = async function() {
        me.log("retrieving version information");
        var config = await me.core.util.config();
        var date = new Date();
        var id = date.getTime();
        var data = {
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
        catch(err) {
            me.log("startup verification failed");
        }
    };
};
