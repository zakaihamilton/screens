/*
    @author Zakai Hamilton
    @component CmdRm
*/

screens.cmd.rm = function CmdRm(me) {
    me.cmd = function(terminal, args) {
        var file_path = terminal.current_dir;
        if(!file_path) {
            file_path = ".";
        }
        if(args.length <= 1) {
            me.core.cmd.exit(terminal);
            return;
        }
        file_path = me.core.path.goto(file_path, args[1]);
        me.core.property.set(terminal, "input", "rm: " + args[1] + ": Are you sure you want to delete? (y/n)");
        return file_path;
    };
    me.response = async function(terminal, file_path, args) {
        if(args[0].toLowerCase() !== "y") {
            me.core.cmd.exit(terminal);
            return;
        }
        try {
            await me.core.file.delete(file_path);
        }
        catch(err) {
            me.core.property.set(terminal, "print", "rm: " + file_path + ": Cannot delete file or directory");
        }
        me.core.cmd.exit(terminal);
    };
};
