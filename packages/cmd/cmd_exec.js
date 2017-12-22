/*
    @author Zakai Hamilton
    @component CmdExec
*/

package.cmd.exec = function CmdExec(me) {
    me.cmd = function(terminal, args) {
        args = args.slice(1);
        var result = me.core.message.send.apply(null, args);
        me.core.property.set(terminal, "print", JSON.stringify(result));
        me.core.cmd.exit(terminal);
    };
};
