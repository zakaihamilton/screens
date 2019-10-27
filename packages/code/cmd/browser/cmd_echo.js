/*
    @author Zakai Hamilton
    @component CmdEcho
*/

screens.cmd.echo = function CmdEcho(me, { core }) {
    me.cmd = function (terminal, args) {
        core.property.set(terminal, "print", args.slice(1).join(" "));
        core.cmd.exit(terminal);
    };
};
