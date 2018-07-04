/*
 @author Zakai Hamilton
 @component CmdClean
 */

screens.cmd.clean = function CmdClean(me) {
    me.cmd = async function (terminal, args) {
        me.core.message.send_server("core.cache.resetAll");
        me.manager.download.clean("cache");
        me.core.property.set(terminal, "print", "cleaned cache");
        me.core.cmd.exit(terminal);
    };
};
