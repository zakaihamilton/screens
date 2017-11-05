/*
    @author Zakai Hamilton
    @component CmdClear
*/

package.cmd.clear = function CmdClear(me) {
    me.package.cmd = function(terminal, args) {
        me.package.core.property.set(terminal, "clear");
        me.package.core.cmd.exit(terminal);
    };
};
