/*
    @author Zakai Hamilton
    @component CmdServer
*/

screens.cmd.server = function CmdServer(me) {
    me.cmd = function(terminal, args) {
        var cmd = args.slice(1).join(" ");
        me.core.server.run(function(err, data, stderr) {
            if(err && err.message) {
                me.core.property.set(terminal, "print", err.message);
            }
            else if(stderr) {
                me.core.property.set(terminal, "print", stderr);
            }
            else {
                me.core.property.set(terminal, "print", data);
            }
            me.core.cmd.exit(terminal);
        }, cmd);
    };
};
