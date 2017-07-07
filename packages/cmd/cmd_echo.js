/*
    @author Zakai Hamilton
    @component CmdEcho
*/

package.cmd.echo = function CmdEcho(me) {
    me.cmd = function(terminal, args) {
        me.set(terminal, "print", args.slice(1).join(' '));
        me.core.cmd.exit(terminal);
    };
};
