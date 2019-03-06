/*
    @author Zakai Hamilton
    @component CmdEcho
*/

screens.cmd.echo = function CmdEcho(me, packages) {
    me.cmd = function (terminal, args) {
        me.core.property.set(terminal, "print", args.slice(1).join(' '));
        me.core.cmd.exit(terminal);
    };
};
