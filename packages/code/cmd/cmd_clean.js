/*
 @author Zakai Hamilton
 @component CmdClean
 */

screens.cmd.clean = function CmdClean(me) {
    me.cmd = async function (terminal, args) {
        me.core.message.send_server("core.cache.resetAll");
        var cache_dir = "cache";
        var items = null;
        try {
            items = await me.core.file.readDir(cache_dir);
        }
        catch(err) {
            me.log("Cannot read cache dir, err: " + err.message || err);
        }
        if (items) {
            for (let item of items) {
                try {
                    await me.core.file.delete(cache_dir + "/" + item);
                    me.core.property.set(terminal, "print", item);
                }
                catch(err) {
                    me.core.property.set(terminal, "print", "cannot delete " + item);
                }
            }
        }
        await me.manager.download.removeall();
        me.core.cmd.exit(terminal);
    };
};
