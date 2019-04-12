/*
    @author Zakai Hamilton
    @component CmdUpdate
*/

screens.cmd.update = function CmdSize(me, packages) {
    const { core, db } = packages;
    me.cmd = async function (terminal, args) {
        await db.events.msg.send("core.server.run", "git checkout package.json");
        await db.events.msg.send("core.server.run", "git pull");
        core.property.set(terminal, "print", "sent update");
        core.cmd.exit(terminal);
    };
};
