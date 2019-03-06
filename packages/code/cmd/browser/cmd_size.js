/*
    @author Zakai Hamilton
    @component CmdSize
*/

screens.cmd.size = function CmdSize(me, packages) {
    me.cmd = async function (terminal, args) {
        var file_path = terminal.current_dir;
        if (!file_path) {
            file_path = ".";
        }
        if (args.length > 1) {
            file_path = me.core.path.goto(file_path, args[1]);
        }
        try {
            var size = await me.core.file.size(file_path);
            me.core.property.set(terminal, "print", "size: " + file_path + ": " + size + " bytes");
        }
        catch (err) {
            me.core.property.set(terminal, "print", "size: " + file_path + ": No such file or directory");
        }
        me.core.cmd.exit(terminal);
    };
};
