/*
    @author Zakai Hamilton
    @component CmdClear
*/

package.cmd.clear = function CmdClear(me) {
    me.cmd = function(terminal, args) {
        me.core.property.set(terminal, "clear");
        me.core.cmd.exit(terminal);
    };
};
