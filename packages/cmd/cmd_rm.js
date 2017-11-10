/*
    @author Zakai Hamilton
    @component CmdRm
*/

package.cmd.rm = function CmdRm(me) {
    me.cmd = function(terminal, args) {
        var file_path = terminal.current_dir;
        if(!file_path) {
            file_path = ".";
        }
        if(args.length <= 1) {
            me.package.core.cmd.exit(terminal);
            return;
        }
        file_path = me.package.core.path.goto(file_path, args[1]);
        me.package.core.property.set(terminal, "input", "rm: " + args[1] + ": Are you sure you want to delete? (y/n)");
        return file_path;
    };
    me.response = function(terminal, file_path, args) {
        if(args[0].toLowerCase() !== "y") {
            me.package.core.cmd.exit(terminal);
            return;
        }
        me.package.core.file.delete(function(err) {
            if(err) {
                me.package.core.property.set(terminal, "print", "rm: " + file_path + ": Cannot delete file or directory");
            }
            me.package.core.cmd.exit(terminal);
        }, file_path);
    };
};
