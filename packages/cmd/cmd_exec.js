/*
    @author Zakai Hamilton
    @component CmdExec
*/

package.cmd.exec = function CmdExec(me) {
    me.cmd = function(terminal, args) {
        args = args.slice(1);
        var result = me.send.apply(null, args);
        me.set(terminal, "print", JSON.stringify(result));
        me.core.cmd.exit(terminal);
    };
};
