/*
    @author Zakai Hamilton
    @component CmdUpdate
*/

screens.cmd.update = function CmdUpdate(me, { core, db }) {
    me.cmd = async function (terminal, args) {
        await db.events.msg.send("core.server.run", "git checkout package.json");
        await db.events.msg.send("core.server.run", "git checkout package-lock.json");
        await db.events.msg.send("core.server.run", "git pull");
        await db.events.msg.send("core.server.run", "npm install");
        await db.events.msg.send("core.server.run", "npm rebuild");
        await db.events.msg.send("core.server.run", "rm -rf ~/screens/cache/*");
        await db.events.msg.send("core.server.run", "rm -rf ~/screens/metadata/*");
        if (args[1] && args[1] === "reload") {
            await db.events.msg.send("core.server.run", "pm2 flush");
            await db.events.msg.send("core.server.run", "pm2 reload all");
        }
        else {
            core.property.set(terminal, "print", "add reload parameter to reload all servers");
        }
        core.property.set(terminal, "print", "sent update");
        core.cmd.exit(terminal);
    };
};
