/*
    @author Zakai Hamilton
    @component CmdShell
*/

package.cmd.shell = function CmdShell(me) {
    me.the.cmd = function(terminal, args) {
        package.include("app." + args[1], function(info) {
            if(info.failure) {
                me.the.core.property.set(terminal, "print", "Cannot launch " + args[1] + " application");
            }
            else if(info.complete) {
                me.the.core.message.send("app." + args[1] + ".launch", args.slice(2));
            }
        });
        me.the.core.cmd.exit(terminal);
    };
};
