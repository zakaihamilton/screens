/*
    @author Zakai Hamilton
    @component CmdShell
*/

package.cmd.shell = function CmdShell(me) {
    me.cmd = function(terminal, args) {
        package.include("app." + args[1], function(failure) {
            if(failure) {
                me.set(terminal, "print", "Cannot launch " + args[1] + " application");
            }
            else {
                me.send("app." + args[1] + ".launch", args.slice(2));
            }
        });
        me.core.cmd.exit(terminal);
    };
};
