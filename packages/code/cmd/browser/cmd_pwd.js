/*
    @author Zakai Hamilton
    @component CmdPwd
*/

screens.cmd.pwd = function CmdPwd(me, packages) {
    me.cmd = function (terminal, args) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        me.core.property.set(terminal, "print", current_dir);
        me.core.cmd.exit(terminal);
    };
};
