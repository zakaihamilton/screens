/*
    @author Zakai Hamilton
    @component CmdShell
*/

screens.cmd.shell = function CmdShell(me, { core }) {
    me.cmd = async function (terminal, args) {
        await screens.include("app." + args[1]);
        await core.message.send("app." + args[1] + ".launch", args.slice(2));
        core.cmd.exit(terminal);
    };
};
