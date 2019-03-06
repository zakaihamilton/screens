/*
    @author Zakai Hamilton
    @component CmdClear
*/

screens.cmd.clear = function CmdClear(me, packages) {
    const { core } = packages;
    me.cmd = function (terminal, args) {
        core.property.set(terminal, "clear");
        core.cmd.exit(terminal);
    };
};
