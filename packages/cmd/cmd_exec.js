/*
    @author Zakai Hamilton
    @component CmdExec
*/

package.cmd.exec = function CmdExec(me) {
    me.the.cmd = function(terminal, args) {
        args = args.slice(1);
        var result = me.the.core.message.send.apply(null, args);
        me.the.core.property.set(terminal, "print", JSON.stringify(result));
        me.the.core.cmd.exit(terminal);
    };
};
