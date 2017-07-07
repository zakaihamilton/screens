/*
    @author Zakai Hamilton
    @component CmdClear
*/

package.cmd.clear = function CmdClear(me) {
    me.cmd = function(terminal, args) {
        me.set(terminal, "clear", null);
        me.core.cmd.exit(terminal);
    };
};
