/*
    @author Zakai Hamilton
    @component CmdPwd
*/

screens.cmd.pwd = function CmdPwd(me, { core }) {
    me.cmd = function (terminal, args) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        core.property.set(terminal, "print", current_dir);
        core.cmd.exit(terminal);
    };
};
