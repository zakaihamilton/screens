/*
 @author Zakai Hamilton
 @component CmdClean
 */

screens.cmd.clean = function CmdClean(me) {
    me.cmd = async function (terminal, args) {
        me.core.message.send_server("core.cache.resetAll");
        var info = await me.manager.download.clean("/tmp");
        me.core.property.set(terminal, "print", "cleaned cache, deleted: " + info.deleted + " failed: " + info.failed + " skipped: " + info.skipped);
        me.core.cmd.exit(terminal);
    };
};
