/*
    @author Zakai Hamilton
    @component CmdCd
*/

package.cmd.cd = function CmdCd(me) {
    me.the.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = ".";
        }
        if(args.length <= 1) {
            me.the.core.cmd.exit(terminal);
            return;
        }
        current_dir = me.the.core.path.goto(current_dir, args[1]);
        me.the.core.file.readDir(function(err, items) {
            if(err) {
                me.the.core.property.set(terminal, "print", "cd: " + args[1] + ": No such file or directory");
            }
            else {
                terminal.current_dir = current_dir;
            }
            me.the.core.cmd.exit(terminal);
        }, current_dir);
    };
};
