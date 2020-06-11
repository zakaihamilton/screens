/*
    @author Zakai Hamilton
    @component CmdClear
*/

screens.cmd.clear = function CmdClear(me, { core }) {
    me.cmd = function (terminal) {
        core.property.set(terminal, "clear");
        core.cmd.exit(terminal);
    };
};
