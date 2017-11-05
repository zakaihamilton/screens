/*
    @author Zakai Hamilton
    @component CmdPwd
*/

package.cmd.pwd = function CmdPwd(me) {
    me.the.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = ".";
        }
        me.the.core.property.set(terminal, "print", current_dir);
        me.the.core.cmd.exit(terminal);
    };
};
