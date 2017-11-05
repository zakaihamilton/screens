/*
    @author Zakai Hamilton
    @component CmdEcho
*/

package.cmd.echo = function CmdEcho(me) {
    me.package.cmd = function(terminal, args) {
        me.package.core.property.set(terminal, "print", args.slice(1).join(' '));
        me.package.core.cmd.exit(terminal);
    };
};
