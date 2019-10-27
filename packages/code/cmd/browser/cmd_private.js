/*
    @author Zakai Hamilton
    @component CmdPrivate
*/

screens.cmd.private = function CmdPrivate(me, { core, db }) {
    me.cmd = async function (terminal, args) {
        try {
            var data = await db.shared.settings.set("system.private", args[1]);
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
