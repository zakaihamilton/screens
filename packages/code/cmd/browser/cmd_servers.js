/*
    @author Zakai Hamilton
    @component CmdServers
*/

screens.cmd.servers = function CmdServer(me, { core, db }) {
    me.cmd = async function (terminal, args) {
        if (args[1]) {
            core.property.set(terminal, "print", args.slice(1).join(" "));
            await db.events.msg.send(...args.slice(1));
        }
        else {
            try {
                var servers = await db.events.servers.list({});
                var ipList = servers.map(server => server.ip).filter(Boolean);
                for (const ip of ipList) {
                    core.property.set(terminal, "print", ip);
                }
            }
            catch (err) {
                let error = err;
                if (typeof error !== "string") {
                    error = JSON.stringify(err);
                }
                core.property.set(terminal, "print", error);
            }
        }
        core.cmd.exit(terminal);
    };
};
