/*
    @author Zakai Hamilton
    @component CmdUpdate
*/

screens.cmd.update = function CmdUpdate(me, packages) {
    const { core, db } = packages;
    me.cmd = async function (terminal, args) {
        await db.events.msg.send("core.server.run", "git checkout package.json");
        await db.events.msg.send("core.server.run", "git pull");
        await db.events.msg.send("core.server.run", "npm install");
        await db.events.msg.send("core.server.run", "npm rebuild");
        if (args[1] && args[1] === "reload") {
            await db.events.msg.send("core.server.run", "pm2 reload all");
        }
        else {
            core.property.set(terminal, "print", "add reload parameter to reload all servers");
        }
        core.property.set(terminal, "print", "sent update");
        core.cmd.exit(terminal);
    };
};
