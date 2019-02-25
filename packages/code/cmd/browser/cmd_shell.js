/*
    @author Zakai Hamilton
    @component CmdShell
*/

screens.cmd.shell = function CmdShell(me) {
    me.cmd = async function (terminal, args) {
        await screens.include("app." + args[1]);
        await me.core.message.send("app." + args[1] + ".launch", args.slice(2));
        me.core.cmd.exit(terminal);
    };
};
