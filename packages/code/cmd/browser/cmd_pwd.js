/*
    @author Zakai Hamilton
    @component CmdPwd
*/

screens.cmd.pwd = function CmdPwd(me, packages) {
    const { core } = packages;
    me.cmd = function (terminal, args) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        core.property.set(terminal, "print", current_dir);
        core.cmd.exit(terminal);
    };
};
