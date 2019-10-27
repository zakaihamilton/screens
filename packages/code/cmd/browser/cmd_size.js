/*
    @author Zakai Hamilton
    @component CmdSize
*/

screens.cmd.size = function CmdSize(me, { core }) {
    me.cmd = async function (terminal, args) {
        var file_path = terminal.current_dir;
        if (!file_path) {
            file_path = ".";
        }
        if (args.length > 1) {
            file_path = core.path.goto(file_path, args[1]);
        }
        try {
            var size = await core.file.size(file_path);
            core.property.set(terminal, "print", "size: " + file_path + ": " + size + " bytes");
        }
        catch (err) {
            core.property.set(terminal, "print", "size: " + file_path + ": No such file or directory");
        }
        core.cmd.exit(terminal);
    };
};
