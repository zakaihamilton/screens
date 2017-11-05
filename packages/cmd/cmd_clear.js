/*
    @author Zakai Hamilton
    @component CmdClear
*/

package.cmd.clear = function CmdClear(me) {
    me.the.cmd = function(terminal, args) {
        me.the.core.property.set(terminal, "clear");
        me.the.core.cmd.exit(terminal);
    };
};
