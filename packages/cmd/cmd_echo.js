/*
    @author Zakai Hamilton
    @component CmdEcho
*/

package.cmd.echo = function CmdEcho(me) {
    me.the.cmd = function(terminal, args) {
        me.the.core.property.set(terminal, "print", args.slice(1).join(' '));
        me.the.core.cmd.exit(terminal);
    };
};
