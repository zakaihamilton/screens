/*
    @author Zakai Hamilton
    @component CmdCd
*/

screens.cmd.cd = function CmdCd(me, { core }) {
    me.cmd = function (terminal, args) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        if (args.length <= 1) {
            core.cmd.exit(terminal);
            return;
        }
        current_dir = core.path.goto(current_dir, args[1]);
        try {
            core.file.readDir(current_dir);
            terminal.current_dir = current_dir;
        }
        catch (err) {
            core.property.set(terminal, "print", "cd: " + args[1] + ": No such file or directory");
        }
        core.cmd.exit(terminal);
    };
};
