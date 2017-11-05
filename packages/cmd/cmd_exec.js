/*
    @author Zakai Hamilton
    @component CmdExec
*/

package.cmd.exec = function CmdExec(me) {
    me.package.cmd = function(terminal, args) {
        args = args.slice(1);
        var result = me.package.core.message.send.apply(null, args);
        me.package.core.property.set(terminal, "print", JSON.stringify(result));
        me.package.core.cmd.exit(terminal);
    };
};
