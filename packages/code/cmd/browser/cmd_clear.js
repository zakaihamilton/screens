/*
    @author Zakai Hamilton
    @component CmdClear
*/

screens.cmd.clear = function CmdClear(me, packages) {
    me.cmd = function (terminal, args) {
        me.core.property.set(terminal, "clear");
        me.core.cmd.exit(terminal);
    };
};
