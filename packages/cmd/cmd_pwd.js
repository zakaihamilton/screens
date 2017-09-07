/*
    @author Zakai Hamilton
    @component CmdPwd
*/

package.cmd.pwd = function CmdPwd(me) {
    me.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = ".";
        }
        me.set(terminal, "print", current_dir);
        me.core.cmd.exit(terminal);
    };
};
