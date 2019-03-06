/*
    @author Zakai Hamilton
    @component CmdEcho
*/

screens.cmd.echo = function CmdEcho(me, packages) {
    const { core } = packages;
    me.cmd = function (terminal, args) {
        core.property.set(terminal, "print", args.slice(1).join(' '));
        core.cmd.exit(terminal);
    };
};
