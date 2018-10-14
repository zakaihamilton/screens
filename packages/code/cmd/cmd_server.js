/*
    @author Zakai Hamilton
    @component CmdServer
*/

screens.cmd.server = function CmdServer(me) {
    me.cmd = async function(terminal, args) {
        var cmd = args.slice(1).join(" ");
        try {
            var data = await me.core.server.run(cmd);
            me.core.property.set(terminal, "print", data);
        }
        catch(err) {
            if(typeof err !== "string") {
                err = JSON.stringify(err);
            }
            me.core.property.set(terminal, "print", err);
        }
        me.core.cmd.exit(terminal);
    };
};
