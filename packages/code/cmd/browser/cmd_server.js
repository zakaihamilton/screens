/*
    @author Zakai Hamilton
    @component CmdServer
*/

screens.cmd.server = function CmdServer(me, { core }) {
    me.cmd = async function (terminal, args) {
        var cmd = args.slice(1).join(" ");
        try {
            var data = await core.server.run(cmd);
            core.property.set(terminal, "print", data);
        }
        catch (err) {
            let error = err;
            if (typeof error !== "string") {
                error = JSON.stringify(err);
            }
            core.property.set(terminal, "print", error);
        }
        core.cmd.exit(terminal);
    };
};
