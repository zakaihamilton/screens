/*
    @author Zakai Hamilton
    @component CmdSize
*/

package.cmd.size = function CmdSize(me) {
    me.cmd = function(terminal, args) {
        var file_path = terminal.current_dir;
        if(!file_path) {
            file_path = ".";
        }
        if(args.length > 1) {
            file_path = me.package.core.path.goto(file_path, args[1]);
        }
        me.package.core.file.size(function(err, size) {
            if(err) {
                me.package.core.property.set(terminal, "print", "size: " + file_path + ": No such file or directory");
            }
            else {
                me.package.core.property.set(terminal, "print", "size: " + file_path + ": " + size + " bytes");
            }
            me.package.core.cmd.exit(terminal);
        }, file_path);
    };
};
