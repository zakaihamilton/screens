/*
    @author Zakai Hamilton
    @component CmdCd
*/

screens.cmd.cd = function CmdCd(me) {
    me.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = ".";
        }
        if(args.length <= 1) {
            me.core.cmd.exit(terminal);
            return;
        }
        current_dir = me.core.path.goto(current_dir, args[1]);
        me.core.file.readDir(function(err, items) {
            if(err) {
                me.core.property.set(terminal, "print", "cd: " + args[1] + ": No such file or directory");
            }
            else {
                terminal.current_dir = current_dir;
            }
            me.core.cmd.exit(terminal);
        }, current_dir);
    };
};
